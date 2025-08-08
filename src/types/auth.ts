// =============================================================================
// AUTHENTICATION TYPES
// =============================================================================

/**
 * TypeScript interfaces for authentication system
 * Mirrors the backend API schemas from psr-ai-api
 */

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ENGINEER = 'engineer',
  CUSTOMER = 'customer'
}

export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved', 
  REJECTED = 'rejected',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  status: UserStatus;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  phone_number?: string;
  profile_picture?: string;
  // Customer fields
  machine_model?: string;
  state?: string;
  // Engineer fields  
  department?: string;
  dealer?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  expires_in: number;
}

export interface OTPRequest {
  email: string;
  purpose?: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp_code: string;
  purpose?: string;
}

export interface CustomerRegistration {
  email: string;
  first_name: string;
  last_name: string;
  machine_model: string;
  state: string;
  phone_number: string;
  otp_code: string;
}

export interface EngineerRegistration {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  department: string;
  dealer?: string;
  state: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithOTP: (data: OTPVerifyRequest) => Promise<void>;
  requestOTP: (data: OTPRequest) => Promise<boolean>;
  registerCustomer: (data: CustomerRegistration) => Promise<void>;
  registerEngineer: (data: EngineerRegistration) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// API Response types
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// Authentication step types for multi-step flows
export type AuthStep = 
  | 'login'
  | 'register-type'
  | 'register-customer'
  | 'register-engineer'
  | 'otp-verification'
  | 'welcome';

export interface AuthFlowState {
  step: AuthStep;
  email?: string;
  registrationType?: 'customer' | 'engineer';
  otpPurpose?: string;
}
