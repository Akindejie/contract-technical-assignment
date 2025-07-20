import { z } from 'zod';
import { UserRole } from '@/types/contracts';

// User registration schema
export const registerUserSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

// Transaction creation schema
export const createTransactionSchema = z.object({
  to: z
    .string()
    .min(1, 'Recipient address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(200, 'Description must be less than 200 characters'),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

// Approval processing schema
export const processApprovalSchema = z.object({
  approved: z.boolean(),
  reason: z
    .string()
    .min(3, 'Reason must be at least 3 characters')
    .max(200, 'Reason must be less than 200 characters'),
});

export type ProcessApprovalFormData = z.infer<typeof processApprovalSchema>;

// User role update schema
export const updateUserRoleSchema = z.object({
  userAddress: z
    .string()
    .min(1, 'User address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  newRole: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

export type UpdateUserRoleFormData = z.infer<typeof updateUserRoleSchema>;

// Search and filter schemas
export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type TransactionFilterFormData = z.infer<typeof transactionFilterSchema>;

export const approvalFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
});

export type ApprovalFilterFormData = z.infer<typeof approvalFilterSchema>;
