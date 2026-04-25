# ⚡ Nova Pay

> DeFi AMM on Stellar Soroban

## Live Demo
[Deployment URL here]

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Stellar Soroban Smart Contracts (Rust)
- Freighter Wallet API
- SWR for real-time data polling

## Smart Contract Addresses (Testnet)
| Contract | Address |
|---|---|
| Liquidity Pool | CCQZXG3QGFPLRS6LJJ4XALJGUGVNLISYN6BJSVOH57ED6FYJH7KGKXAR |
| VOLT Token | CCHLK4RHSS27U4K6VRIP6QW2N5IGBJJES4GA4CI3RRUGP54G4FH5HL7P |
| Asset Wrapper | CBMGE6BSHIGBXAUMW32D542POCBMI3DHP7ZZGI6RTGPRECJQA3S5ZFDI |
| VOLT Issuer | GBALPCSLWTTOVYUJ35KSDBOQETFDFAGKMQOYN76OWLY7QCIHLQUHINBS |

## Screenshots
> [PLACEHOLDER: Add your mobile responsive screenshot here]
> [PLACEHOLDER: Add your CI/CD pipeline badge/screenshot here]

## CI/CD
GitHub Actions workflow runs on every push to main:
- Lints TypeScript
- Builds Next.js production bundle
- Deploys to Vercel

## Inter-Contract Calls
The swap function calls from the AMM Pool contract into the VOLT Token contract for balance checks and transfers. Transaction hash: [ADD HASH]

## Custom Token & Pool
- VOLT Token deployed at: CCHLK4RHSS27U4K6VRIP6QW2N5IGBJJES4GA4CI3RRUGP54G4FH5HL7P
- Liquidity Pool deployed at: CCQZXG3QGFPLRS6LJJ4XALJGUGVNLISYN6BJSVOH57ED6FYJH7KGKXAR

## Local Development
To get started locally, follow these steps:
1. Clone the repository and navigate to the root directory.
2. Ensure you have Node.js and npm installed.
3. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   ```
4. Set up your `.env.local` inside the `frontend` directory with required environment variables.
5. Run the development server:
   ```bash
   npm run dev
   ```

## License
MIT
