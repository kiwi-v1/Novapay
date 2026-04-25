import { NextResponse } from 'next/server';
import {
  Keypair, Asset, TransactionBuilder, Operation,
  Networks, Horizon,
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

let ISSUER_SECRET = process.env.STELLAR_ISSUER_SECRET;
if (!ISSUER_SECRET) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const match = fs.readFileSync(envPath, 'utf8').match(/STELLAR_ISSUER_SECRET=([^\n]+)/);
    if (match) ISSUER_SECRET = match[1].trim();
  } catch (e) {}
}

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function POST(req: Request) {
  try {
    const { publicKey, action, voltAmt, xlmAmt, lpAmt } = await req.json();

    if (!publicKey || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }
    if (!ISSUER_SECRET) {
      return NextResponse.json({ error: 'Issuer key not configured' }, { status: 500 });
    }

    const issuerKp = Keypair.fromSecret(ISSUER_SECRET);
    const voltAsset = new Asset('VOLT', issuerKp.publicKey());
    const xlmAsset = Asset.native();
    const server = new Horizon.Server(HORIZON_URL);

    // The transaction source account is the User
    const userAcct = await server.loadAccount(publicKey);

    const txBuilder = new TransactionBuilder(userAcct, {
      fee: '2000',
      networkPassphrase: Networks.TESTNET,
    });

    if (action === 'add') {
      // User sends VOLT and XLM to Issuer
      txBuilder.addOperation(Operation.payment({
        source: publicKey,
        destination: issuerKp.publicKey(),
        asset: voltAsset,
        amount: parseFloat(voltAmt).toFixed(7),
      }));
      txBuilder.addOperation(Operation.payment({
        source: publicKey,
        destination: issuerKp.publicKey(),
        asset: xlmAsset,
        amount: parseFloat(xlmAmt).toFixed(7),
      }));
    } else if (action === 'remove') {
      // Issuer sends VOLT and XLM back to User (approximating 1 LP = 1 VOLT + 0.05 XLM)
      // Since we don't have a real LP token, we just estimate the refund
      const refundVolt = parseFloat(lpAmt).toFixed(7);
      const refundXlm = (parseFloat(lpAmt) * 0.05).toFixed(7);

      txBuilder.addOperation(Operation.payment({
        source: issuerKp.publicKey(),
        destination: publicKey,
        asset: voltAsset,
        amount: refundVolt,
      }));
      txBuilder.addOperation(Operation.payment({
        source: issuerKp.publicKey(),
        destination: publicKey,
        asset: xlmAsset,
        amount: refundXlm,
      }));
    }

    const tx = txBuilder.setTimeout(180).build();

    if (action === 'remove') {
      // Backend signs the transaction on behalf of the issuer because the issuer is the source of the payment operations
      tx.sign(issuerKp);
    }

    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (err: any) {
    console.error('Liquidity Error:', err);
    const detail = err?.response?.data?.extras?.result_codes || err.message;
    const errorMsg = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
