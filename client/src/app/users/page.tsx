'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import {
  useUser,
  useRegisterUser,
  useUpdateUserRole,
} from '@/lib/hooks/useContract';
import { UserRole } from '@/types/contracts';
import { getAddress } from 'ethers';
import { extractErrorMessage } from '@/lib/errors';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import {
  Users,
  Plus,
  UserPlus,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerUserSchema = z.object({
  walletAddress: z
    .string()
    .min(1, 'Wallet address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  role: z.enum(['0', '1', '2']),
});

type RegisterUserFormData = z.infer<typeof registerUserSchema>;

interface RegisterUserFormProps {
  onSuccess?: () => void;
}

const RegisterUserForm: React.FC<RegisterUserFormProps> = ({ onSuccess }) => {
  const registerUserMutation = useRegisterUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<RegisterUserFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      walletAddress: '',
      name: '',
      email: '',
      role: '0',
    },
  });

  const onSubmit = async (data: RegisterUserFormData) => {
    try {
      await registerUserMutation.mutateAsync({
        walletAddress: data.walletAddress,
        name: data.name,
        email: data.email,
        role: parseInt(data.role) as UserRole,
      });

      reset();
      onSuccess?.();
    } catch (error) {
      const message = extractErrorMessage(error);
      console.error('Error registering user:', message);
      // Optionally show a toast or set an error state here
    }
  };

  const isLoading = isSubmitting || registerUserMutation.isPending;

  const getRoleDescription = (role: string) => {
    switch (role) {
      case '0':
        return 'Can create transactions and view own data';
      case '1':
        return 'Can approve transactions and manage regular users';
      case '2':
        return 'Full system access including user management';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-2">
      {/* Wallet Address */}
      <div className="space-y-3">
        <Label htmlFor="walletAddress">Wallet Address *</Label>
        <Input
          id="walletAddress"
          type="text"
          placeholder="0x..."
          {...register('walletAddress')}
          className={errors.walletAddress ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.walletAddress && (
          <p className="text-sm text-red-500">{errors.walletAddress.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          The Ethereum address that will be registered as a user
        </p>
      </div>

      {/* Name */}
      <div className="space-y-3">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          {...register('name')}
          className={errors.name ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-3">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@company.com"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div className="space-y-3">
        <Label htmlFor="role">User Role *</Label>
        <Select
          value={watch('role')}
          onValueChange={(value) => setValue('role', value as '0' | '1' | '2')}
          disabled={isLoading}
        >
          <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Regular User
              </div>
            </SelectItem>
            <SelectItem value="1">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Manager
              </div>
            </SelectItem>
            <SelectItem value="2">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-red-500">{errors.role.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {getRoleDescription(watch('role'))}
        </p>
      </div>

      <Separator />

      {/* User Summary */}
      <div className="space-y-4 p-6 bg-muted rounded-lg">
        <h4 className="font-medium">Registration Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address:</span>
            <span className="font-mono">
              {watch('walletAddress') || 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name:</span>
            <span>{watch('name') || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email:</span>
            <span>{watch('email') || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">
              {watch('role') === '0' && 'Regular User'}
              {watch('role') === '1' && 'Manager'}
              {watch('role') === '2' && 'Admin'}
              {!watch('role') && 'Not selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
          className="flex-1"
        >
          Reset
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Register User
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-xs text-muted-foreground space-y-2 pt-2">
        <p>• Only admins can register new users</p>
        <p>
          • Users will be able to connect with their wallet address immediately
        </p>
        <p>• Role permissions take effect immediately after registration</p>
      </div>
    </form>
  );
};

// Add a new component for updating user roles
const UpdateUserRoleForm: React.FC<{
  walletAddress: string;
  currentRole: UserRole;
  onSuccess?: (newRole: UserRole) => void;
}> = ({ walletAddress, currentRole, onSuccess }) => {
  const updateUserRoleMutation = useUpdateUserRole();
  const [role, setRole] = React.useState<UserRole>(currentRole);
  const [error, setError] = React.useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === currentRole) return;
    setError(null);
    try {
      // Normalize and validate the address
      const normalizedAddress = getAddress(walletAddress);
      await updateUserRoleMutation.mutateAsync({
        walletAddress: normalizedAddress,
        role,
      });
      onSuccess?.(role);
    } catch (err: unknown) {
      setError(extractErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleUpdate} className="flex items-center gap-2">
      <Select
        value={role.toString()}
        onValueChange={(v) => setRole(Number(v) as UserRole)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Regular User</SelectItem>
          <SelectItem value="1">Manager</SelectItem>
          <SelectItem value="2">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        type="submit"
        size="sm"
        disabled={updateUserRoleMutation.isPending || role === currentRole}
      >
        {updateUserRoleMutation.isPending ? 'Updating...' : 'Update'}
      </Button>
      {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
    </form>
  );
};

export default function UsersPage() {
  const [testUsers, setTestUsers] = useState([
    {
      name: 'Platform Admin',
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      role: UserRole.Admin,
    },
    {
      name: 'John Manager',
      address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      role: UserRole.Manager,
    },
    {
      name: 'Alice User',
      address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
      role: UserRole.Regular,
    },
    {
      name: 'Bob User',
      address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      role: UserRole.Regular,
    },
    {
      name: 'Sarah Approver',
      address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
      role: UserRole.Manager,
    },
  ]);
  const { isConnected, address } = useWallet();
  const { data: user } = useUser(address || '');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  // Check if user has admin permissions
  const isAdmin = user?.role === UserRole.Admin;

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to access user management
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-in fade-in duration-500">
        <Card className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need Admin role to access user management
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 animate-in slide-in-from-top-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="flex items-center animate-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: '100ms' }}
          >
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </Badge>
          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                className="animate-in slide-in-from-right-4 duration-500"
                style={{ animationDelay: '200ms' }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Register User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the financial platform
                </DialogDescription>
              </DialogHeader>
              <RegisterUserForm
                onSuccess={() => setIsRegisterDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid gap-4 md:grid-cols-4 animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '100ms' }}
      >
        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '150ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '200ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '250ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Can approve transactions
            </p>
          </CardContent>
        </Card>

        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Standard access level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Features */}
      <div
        className="grid gap-4 md:grid-cols-2 animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '200ms' }}
      >
        {/* Register New User */}
        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '250ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Register New User
            </CardTitle>
            <CardDescription>
              Add new users to the financial platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Registration Process:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Provide wallet address and user details</li>
                <li>• Assign appropriate role (Regular/Manager/Admin)</li>
                <li>• User can immediately connect and use the platform</li>
                <li>• Role permissions are applied instantly</li>
              </ul>
            </div>
            <Button
              onClick={() => setIsRegisterDialogOpen(true)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register New User
            </Button>
          </CardContent>
        </Card>

        {/* User Roles & Permissions */}
        <Card
          className="animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '300ms' }}
        >
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Role Permissions
            </CardTitle>
            <CardDescription>Understanding user access levels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Users className="w-4 h-4 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">Regular User</p>
                  <p className="text-xs text-muted-foreground">
                    Create transactions, view own data
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 mt-1 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Manager</p>
                  <p className="text-xs text-muted-foreground">
                    Approve transactions, view all data
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Shield className="w-4 h-4 mt-1 text-purple-500" />
                <div>
                  <p className="font-medium text-sm">Admin</p>
                  <p className="text-xs text-muted-foreground">
                    Full system access, user management
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Accounts Information */}
      <Card
        className="animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '350ms' }}
      >
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Test Accounts Available
          </CardTitle>
          <CardDescription>
            Pre-configured accounts for testing (from deployment)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {testUsers.map((user, index) => (
              <div
                key={user.address}
                className="p-3 border rounded-lg animate-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <Badge
                    variant={
                      user.role === UserRole.Admin
                        ? 'secondary'
                        : user.role === UserRole.Manager
                        ? 'outline'
                        : 'secondary'
                    }
                  >
                    {UserRole[user.role]}
                  </Badge>
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  {user.address}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Role Management Table */}
      <Card
        className="animate-in slide-in-from-bottom-4 duration-500"
        style={{ animationDelay: '400ms' }}
      >
        <CardHeader>
          <CardTitle>User Role Management</CardTitle>
          <CardDescription>Update user roles as an admin</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Address</th>
                <th className="text-left p-2">Current Role</th>
                <th className="text-left p-2">Update Role</th>
              </tr>
            </thead>
            <tbody>
              {testUsers.map((user, index) => (
                <tr
                  key={user.address}
                  className="border-b animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${450 + index * 50}ms` }}
                >
                  <td className="p-2">{user.name}</td>
                  <td className="p-2 font-mono">{user.address}</td>
                  <td className="p-2">{UserRole[user.role]}</td>
                  <td className="p-2">
                    <UpdateUserRoleForm
                      walletAddress={user.address}
                      currentRole={user.role}
                      onSuccess={(newRole) => {
                        setTestUsers((users) =>
                          users.map((u) =>
                            u.address === user.address
                              ? { ...u, role: newRole }
                              : u
                          )
                        );
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
