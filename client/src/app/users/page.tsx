'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/hooks/useWallet';
import { useUser, useRegisterUser } from '@/lib/hooks/useContract';
import { UserRole } from '@/types/contracts';
import { formatAddress } from '@/lib/web3/provider';
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
  role: z.enum(['0', '1', '2'], { required_error: 'Role is required' }),
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
      console.error('Error registering user:', error);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Wallet Address */}
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-2">
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
      <div className="space-y-3 p-4 bg-muted rounded-lg">
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
      <div className="flex gap-3">
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
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Only admins can register new users</p>
        <p>
          • Users will be able to connect with their wallet address immediately
        </p>
        <p>• Role permissions take effect immediately after registration</p>
      </div>
    </form>
  );
};

export default function UsersPage() {
  const { isConnected, address } = useWallet();
  const { data: user } = useUser(address || '');
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  // Check if user has admin permissions
  const isAdmin = user?.role === UserRole.Admin;

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
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
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md">
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </Badge>
          <Dialog
            open={isRegisterDialogOpen}
            onOpenChange={setIsRegisterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Register User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
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

        <Card>
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

        <Card>
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
      <div className="grid gap-4 md:grid-cols-2">
        {/* Register New User */}
        <Card>
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
        <Card>
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
      <Card>
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
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Platform Admin</span>
                <Badge variant="secondary">Admin</Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                0xf39F...2266
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">John Manager</span>
                <Badge variant="outline">Manager</Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                0x7099...79C8
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Alice User</span>
                <Badge variant="secondary">Regular</Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                0x3C44...93BC
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Bob User</span>
                <Badge variant="secondary">Regular</Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                0x90F7...b906
              </p>
            </div>

            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">Sarah Approver</span>
                <Badge variant="outline">Manager</Badge>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                0x15d3...6A65
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
