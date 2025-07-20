// Smart Contract Type Definitions
export enum UserRole {
  Regular = 0,
  Manager = 1,
  Admin = 2,
}

export enum TransactionStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Rejected = 3,
}

export enum ApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export enum ApprovalType {
  Transaction = 0,
  UserRole = 1,
  SystemConfig = 2,
}

export interface User {
  id: bigint;
  walletAddress: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: bigint;
}

export interface Transaction {
  id: bigint;
  from: string;
  to: string;
  amount: bigint;
  description: string;
  status: TransactionStatus;
  timestamp: bigint;
  approvalId: bigint;
}

export interface Approval {
  id: bigint;
  transactionId: bigint;
  requester: string;
  approver: string;
  approvalType: ApprovalType;
  status: ApprovalStatus;
  reason: string;
  timestamp: bigint;
}

// Contract Events
export interface UserRegisteredEvent {
  userId: bigint;
  walletAddress: string;
  name: string;
  role: UserRole;
}

export interface UserRoleUpdatedEvent {
  userAddress: string;
  newRole: UserRole;
}

export interface TransactionCreatedEvent {
  transactionId: bigint;
  from: string;
  to: string;
  amount: bigint;
}

export interface TransactionStatusUpdatedEvent {
  transactionId: bigint;
  status: TransactionStatus;
}

export interface ApprovalRequestedEvent {
  approvalId: bigint;
  transactionId: bigint;
  requester: string;
}

export interface ApprovalProcessedEvent {
  approvalId: bigint;
  status: ApprovalStatus;
  approver: string;
}

// UI Types
export interface DashboardMetrics {
  totalTransactions: number;
  pendingApprovals: number;
  totalUsers: number;
  userRole: UserRole;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
}

export interface ContractAddresses {
  financialPlatform: string;
  mockToken: string;
}
