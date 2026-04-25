import { NextResponse } from 'next/server';
import {
  Keypair, Asset, TransactionBuilder, Operation,
  Networks, Horizon,
} from '@stellar/stellar-sdk';
import fs from 'fs';
import path from 'path';

// Get secret either from process.env or fallback to reading .env.local directly (for hot-reloading)
let ISSUER_SECRET = process.env.STELLAR_ISSUER_SECRET;
if (!ISSUER_SECRET) {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/STELLAR_ISSUER_SECRET=([^\n]+)/);
    if (match) ISSUER_SECRET = match[1].trim();
  } catch (e) {
    console.warn('Could not read .env.local dynamically', e);
  }
}
const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function POST(req: Request) {
  try {
    const { publicKey, dir, amountIn, amountOut } = await req.json();

    if (!publicKey || !dir || !amountIn || !amountOut) {
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

    const sendAsset = dir === 'VOLT_TO_XLM' ? voltAsset : xlmAsset;
    const receiveAsset = dir === 'VOLT_TO_XLM' ? xlmAsset : voltAsset;

    // Build the atomic swap transaction
    const tx = new TransactionBuilder(userAcct, {
      fee: '2000', // 2 operations
      networkPassphrase: Networks.TESTNET,
    })
      // 1. User sends `amountIn` to Issuer
      .addOperation(Operation.payment({
        source: publicKey,
        destination: issuerKp.publicKey(),
        asset: sendAsset,
        amount: parseFloat(amountIn).toFixed(7),
      }))
      // 2. Issuer sends `amountOut` to User
      .addOperation(Operation.payment({
        source: issuerKp.publicKey(),
        destination: publicKey,
        asset: receiveAsset,
        amount: parseFloat(amountOut).toFixed(7),
      }))
      .setTimeout(180)
      .build();

    // Backend signs the transaction on behalf of the issuer (authorizes operation 2)
    tx.sign(issuerKp);

    // Return the partially signed XDR to the frontend
    return NextResponse.json({ xdr: tx.toXDR() });
  } catch (err: any) {
    console.error('Swap Error:', err);
    const detail = err?.response?.data?.extras?.result_codes || err.message;
    const errorMsg = typeof detail === 'object' ? JSON.stringify(detail) : String(detail);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
