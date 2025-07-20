# Environment Variables

Create a `.env.local` file in the client directory with the following variables:

```env
# Network Configuration
NEXT_PUBLIC_HOLESKY_RPC_URL=https://ethereum-holesky.publicnode.com

# Contract Addresses - Localhost (Hardhat)
NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_LOCALHOST=
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_LOCALHOST=

# Contract Addresses - Holesky Testnet
NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_HOLESKY=
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_HOLESKY=
```

## Setup Instructions

1. Copy the above content to a new file named `.env.local` in the client directory
2. Fill in the contract addresses after deploying the smart contracts
3. Update the RPC URL if using a different provider

## Getting Contract Addresses

After deploying the smart contracts using the deployment script in the smart-contract folder, you'll get the contract addresses which should be added to the environment variables.

For localhost development:

- Start a Hardhat node: `npx hardhat node`
- Deploy contracts: `npx hardhat run scripts/deploy.js --network localhost`
- Copy the addresses from the deployment output
