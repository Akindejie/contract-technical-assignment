# Oumla Platform - Financial Management System

A comprehensive decentralized financial platform built with Next.js and Ethereum smart contracts, featuring user management, transaction workflows, and approval systems with real-time updates.

## 🚀 Features

### Core Functionality

- **User Management**: Role-based access control (Regular, Manager, Admin)
- **Transaction Workflow**: Create, approve, and complete transactions
- **Approval System**: Multi-level approval process with reason tracking
- **Real-time Updates**: Live UI updates via smart contract events
- **Wallet Integration**: MetaMask support with network switching

### User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Intuitive Navigation**: Sidebar navigation with role-based filtering
- **Loading States**: Comprehensive loading indicators and feedback
- **Form Validation**: Real-time validation with error messages
- **Toast Notifications**: Success/error feedback for all operations

## 🛠 Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern UI components
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management with Zod validation

### Smart Contracts

- **Solidity** - Smart contract language
- **Hardhat** - Development environment
- **OpenZeppelin** - Secure contract libraries
- **Ethers.js** - Ethereum interaction

### Web3 Integration

- **MetaMask** - Wallet connection
- **Event Listening** - Real-time contract updates
- **Transaction Management** - Gas estimation and confirmation

## 📁 Project Structure

```
contract-technical-assignment/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── transactions/  # Transaction management (with [id]/ for details)
│   │   │   ├── approvals/     # Approval workflow
│   │   │   ├── users/         # User management
│   │   │   ├── layout.tsx     # App layout
│   │   │   ├── providers.tsx  # App providers
│   │   │   └── globals.css    # Global styles (Tailwind, Shepherd, etc.)
│   │   ├── components/    # Reusable UI components
│   │   │   ├── layout/        # Header, Sidebar, etc.
│   │   │   ├── ui/            # shadcn/ui components (Button, Card, etc.)
│   │   │   ├── onboarding/    # AppTour and onboarding components
│   │   │   ├── dashboard/     # Dashboard widgets (e.g., TransactionChart)
│   │   │   ├── transactions/  # Transaction forms/components
│   │   │   ├── approvals/     # Approval-related components
│   │   │   └── web3/          # Wallet connection (WalletConnect)
│   │   ├── lib/          # Utilities and custom hooks
│   │   │   ├── hooks/         # useWallet, useContract, useContractEvents
│   │   │   ├── schemas/       # Zod schemas for forms
│   │   │   ├── web3/          # Ethers/web3 provider utilities
│   │   │   ├── errors.ts      # Error helpers
│   │   │   └── utils.ts       # General utilities
│   │   ├── types/        # TypeScript definitions
│   │   ├── constants/    # Contract ABIs, addresses, network configs
│   └── public/           # Static assets
└── contract/             # Smart contracts
    ├── contracts/        # Solidity contracts (FinancialPlatform, MockToken)
    ├── scripts/          # Deployment and setup scripts
    ├── test/             # Contract tests
    ├── deployment-info.json # Deployment metadata
    └── hardhat.config.js # Hardhat config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Git

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd contract-technical-assignment

# Install frontend dependencies
cd client
npm install

# Install smart contract dependencies
cd ../contract
npm install
```

### 2. Setup Environment Variables

Create `.env.local` in the `client` directory:

```env
# Network Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Contract Addresses - Localhost (Hardhat)
NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_LOCALHOST=
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_LOCALHOST=

# Contract Addresses - Sepolia Testnet
NEXT_PUBLIC_FINANCIAL_PLATFORM_ADDRESS_SEPOLIA=
NEXT_PUBLIC_MOCK_TOKEN_ADDRESS_SEPOLIA=
```

### 3. Deploy Smart Contracts

```bash
# Start local Hardhat node
cd contract
npx hardhat node

# In a new terminal, deploy contracts
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract addresses to your `.env.local` file.

### 4. Start the Application

```bash
# Start the frontend
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Demo Workflows

### 1. Wallet Connection

1. Open the application in your browser
2. Click "Connect Wallet" in the header
3. Approve MetaMask connection
4. Switch to localhost network if prompted

### 2. User Registration (Admin Only)

1. Navigate to "Users" page
2. Connect with an admin wallet
3. Fill out the registration form:
   - Wallet Address: `0x...`
   - Name: User's full name
   - Email: user@example.com
   - Role: Select appropriate role
4. Submit the form

### 3. Transaction Creation

1. Navigate to "Transactions" page
2. Click "Create Transaction"
3. Fill out the form:
   - Recipient: Valid Ethereum address
   - Amount: Transaction amount
   - Description: Transaction purpose
4. Submit and confirm in MetaMask

### 4. Approval Workflow

1. Navigate to "Approvals" page (Manager/Admin only)
2. View pending approval requests
3. Click "Approve" or "Reject"
4. Provide reason for decision
5. Confirm in MetaMask

### 5. Transaction Completion

1. Navigate to "Transactions" page
2. Find an approved transaction
3. Click "Complete Transaction"
4. Confirm in MetaMask

## 🧪 Testing

### Smart Contract Tests

```bash
cd contract
npm test
```

### Frontend Development

```bash
cd client
npm run dev
```

### Production Build

```bash
cd client
npm run build
npm start
```

## 🔧 Configuration

### Networks Supported

- **Localhost**: Development and testing
- **Sepolia Testnet**: Testnet deployment

### Environment Variables

See `environment.md` for detailed environment variable documentation.

## 📚 Documentation

- **Smart Contracts**: See `contract/README.md` for detailed contract documentation
- **Environment Setup**: See `environment.md` for configuration details
- **API Reference**: Contract functions and events are documented in the contract README

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ using Next.js, Solidity, and Web3 technologies**
