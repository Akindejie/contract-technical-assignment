// FinancialPlatform Contract ABI
export const FINANCIAL_PLATFORM_ABI = [
  // User Management
  {
    type: 'function',
    name: 'registerUser',
    inputs: [
      { name: 'walletAddress', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'role', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'updateUserRole',
    inputs: [
      { name: 'userAddress', type: 'address' },
      { name: 'newRole', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getUser',
    inputs: [{ name: 'userAddress', type: 'address' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'walletAddress', type: 'address' },
          { name: 'name', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'role', type: 'uint8' },
          { name: 'isActive', type: 'bool' },
          { name: 'createdAt', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },

  // Transaction Management
  {
    type: 'function',
    name: 'createTransaction',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'description', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestApproval',
    inputs: [
      { name: 'transactionId', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'completeTransaction',
    inputs: [{ name: 'transactionId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getTransaction',
    inputs: [{ name: 'transactionId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'description', type: 'string' },
          { name: 'status', type: 'uint8' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'approvalId', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserTransactions',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTransactionCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllTransactions',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },

  // Approval System
  {
    type: 'function',
    name: 'processApproval',
    inputs: [
      { name: 'approvalId', type: 'uint256' },
      { name: 'approved', type: 'bool' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getApproval',
    inputs: [{ name: 'approvalId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'transactionId', type: 'uint256' },
          { name: 'requester', type: 'address' },
          { name: 'approver', type: 'address' },
          { name: 'approvalType', type: 'uint8' },
          { name: 'status', type: 'uint8' },
          { name: 'reason', type: 'string' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPendingApprovals',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getApprovalCount',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },

  // Events
  {
    type: 'event',
    name: 'UserRegistered',
    inputs: [
      { name: 'userId', type: 'uint256', indexed: true },
      { name: 'walletAddress', type: 'address', indexed: true },
      { name: 'name', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'UserRoleUpdated',
    inputs: [
      { name: 'userAddress', type: 'address', indexed: true },
      { name: 'newRole', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TransactionCreated',
    inputs: [
      { name: 'transactionId', type: 'uint256', indexed: true },
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TransactionStatusUpdated',
    inputs: [
      { name: 'transactionId', type: 'uint256', indexed: true },
      { name: 'status', type: 'uint8', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ApprovalRequested',
    inputs: [
      { name: 'approvalId', type: 'uint256', indexed: true },
      { name: 'transactionId', type: 'uint256', indexed: true },
      { name: 'requester', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ApprovalProcessed',
    inputs: [
      { name: 'approvalId', type: 'uint256', indexed: true },
      { name: 'status', type: 'uint8', indexed: false },
      { name: 'approver', type: 'address', indexed: true },
    ],
  },
] as const;

// MockToken Contract ABI
export const MOCK_TOKEN_ABI = [
  {
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transfer',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
