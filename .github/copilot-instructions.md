# Copilot Instructions for Poornasree AI

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a comprehensive Next.js application called "Poornasree AI" featuring a complete authentication system, role-based dashboards, and Material Design 3 components. The project combines sophisticated user management with a clean, professional interface inspired by modern design principles.

## Project Architecture
- **Framework**: Next.js 15.4.5 with App Router, Turbopack development, and React 19.1.0
- **Language**: TypeScript with strict type checking for enterprise-grade reliability
- **UI Library**: Material UI v6.1.6 implementing Material Design 3 specifications
- **Animation System**: Framer Motion v11.11.7 with custom easing curves and branded loading states
- **Backend Integration**: FastAPI authentication system with JWT tokens and role-based access control
- **State Management**: React Context API for authentication and snackbar notifications

## Current Implementation Status

### Authentication System ✅ COMPLETE
- ✅ **Multi-Role Authentication**: SUPER_ADMIN, ADMIN, ENGINEER, CUSTOMER roles with granular permissions
- ✅ **Dual Login Methods**: Password-based and OTP-based authentication with email verification
- ✅ **Registration Workflows**: Separate Customer and Engineer registration flows with admin approval
- ✅ **Protected Routes**: Role-based route protection with automatic redirects
- ✅ **Session Management**: JWT token handling with automatic refresh and secure storage

### Dashboard Components ✅ COMPLETE
- ✅ **SuperAdminDashboard.tsx**: Complete system overview with admin creation, user management, and analytics
- ✅ **AdminDashboard.tsx**: Engineer application management, approval/rejection workflow, customer analytics
- ✅ **ProfileUpdateForm.tsx**: User profile management with password updates and personal information
- ✅ **AddAdminForm.tsx**: Admin creation form with department selection and validation
- ✅ **AdminList.tsx**: Comprehensive admin management with role badges and delete functionality

### Core Components ✅ COMPLETE
- ✅ **AuthScreen.tsx**: Unified authentication interface with step-based navigation
- ✅ **LoginForm.tsx**: Dual-mode login (password/OTP) with Material Design 3 styling
- ✅ **CustomerRegistrationForm.tsx**: Machine model and state-based customer registration
- ✅ **EngineerRegistrationForm.tsx**: Department-based engineer registration with admin approval
- ✅ **ProtectedRoute.tsx**: HOC for route protection with role validation
- ✅ **SidebarLayout.tsx**: Collapsible sidebar with user information and navigation

### Design System ✅ COMPLETE
- ✅ **Material Design 3**: Complete theming with MD3 color tokens, typography, and elevation system
- ✅ **Custom Branding**: Logo integration system with iconlogo.png and fulllogo.png assets
- ✅ **Responsive Design**: Mobile-first approach with adaptive layouts and touch interactions
- ✅ **Animation Framework**: Consistent Framer Motion animations with Material Design easing
- ✅ **Error Handling**: Comprehensive snackbar notification system with role-specific messaging

## Design Principles & Guidelines

### Authentication UX Standards
- **Progressive Disclosure**: Step-by-step registration flow with clear progress indicators
- **Dual Authentication**: Support both password and OTP-based login for flexibility
- **Role-Based Workflows**: Distinct user journeys for customers, engineers, and administrators
- **Validation Feedback**: Real-time form validation with descriptive error messages
- **Security First**: Secure token management with automatic session handling

### Visual Design Standards
- **Material Design 3**: Adherence to MD3 color system, typography scales, and interaction patterns
- **Professional Aesthetics**: Clean, minimal interface focusing on content and functionality
- **Brand Integration**: Consistent use of custom logos throughout the interface
- **Accessibility First**: High contrast ratios, semantic HTML, and comprehensive ARIA attributes
- **Responsive Excellence**: Mobile-first design with adaptive layouts for all screen sizes

### Animation & Interaction Patterns
- **Material Design Easing**: Use `[0.4, 0, 0.2, 1]` cubic-bezier for all transitions
- **Loading States**: Custom iconlogo.png animations with rotate-stop-rotate patterns
- **Smooth Transitions**: 300ms duration for most UI state changes with consistent timing
- **Hover Behaviors**: Subtle hover effects with appropriate feedback delays
- **Progressive Enhancement**: Graceful degradation when animations are disabled

### Component Architecture Principles
- **Functional Components**: React hooks and functional patterns exclusively
- **TypeScript Safety**: Comprehensive interfaces for all props and state
- **Context Integration**: Centralized state management for auth and notifications
- **Separation of Concerns**: Clear boundaries between UI, logic, and data layers
- **Reusable Design**: Modular components that compose and extend elegantly

## Technical Implementation Guidelines

### Code Quality Standards
- **TypeScript Strict Mode**: Enable all strict type checking options
- **Interface Definitions**: Comprehensive TypeScript interfaces in `/types` and `/hooks` directories
- **Error Handling**: Robust error boundaries, loading states, and user feedback systems
- **Performance**: Bundle optimization, dynamic imports, and efficient re-render strategies
- **Accessibility**: Complete ARIA labels, semantic HTML, and keyboard navigation support

### File Organization Patterns
```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable React components
│   ├── auth/            # Authentication-specific components
│   └── dashboard/       # Dashboard and admin components
├── config/              # Application configuration and constants
├── contexts/            # React contexts for global state
├── hooks/               # Custom React hooks and utilities
├── theme/               # Material UI theme system and providers
├── types/               # TypeScript interface definitions
└── utils/               # Pure utility functions and API clients
```

### Authentication Implementation
- **Context Pattern**: AuthContext for user state and authentication actions
- **API Integration**: Centralized API utilities with error handling and token management
- **Response Handling**: useApiResponse hook for standardized success/error notifications
- **Route Protection**: ProtectedRoute HOC with role-based access control
- **Session Management**: Automatic token refresh and secure localStorage integration

### State Management Architecture
- **AuthContext**: User authentication state, login/logout actions, role management
- **SnackbarContext**: Global notification system with variant support and auto-dismiss
- **Custom Hooks**: Specialized hooks like useApiResponse for common patterns
- **Local State**: Component-level state for forms and UI interactions
- **Props Threading**: Minimal prop drilling with strategic context usage

### API Integration Patterns
- **Centralized API Client**: utils/api.ts with standardized request/response handling
- **Error Management**: Custom APIError class with status codes and user-friendly messages
- **Authentication Headers**: Automatic Bearer token injection for protected endpoints
- **Response Processing**: Consistent data transformation and error extraction
- **Request Interceptors**: Token validation and automatic refresh logic

### Animation Implementation
- **LoadingAnimation Component**: Custom branded animations using iconlogo.png
- **Transparent Backgrounds**: Proper PNG transparency with `background: 'none !important'` overrides
- **Multiple Variants**: Rotation, pulse, and text-based loading states
- **Framer Motion Integration**: Consistent animation timing and easing throughout

### Logo Asset Management
- **iconlogo.png**: Used in sidebar collapsed state and loading animations
- **fulllogo.png**: Used in welcome screen and main chat interface header
- **Transparent Handling**: Ensure proper PNG transparency without white backgrounds
- **Responsive Sizing**: Scale logos appropriately for different screen sizes

## Current Feature Set

### Authentication Flow
- **Multi-Step Registration**: Email verification → OTP confirmation → Account creation
- **Dual Login Options**: Traditional password login and secure OTP authentication
- **Role-Based Access**: Automatic dashboard routing based on user role
- **Engineer Approval**: Admin workflow for reviewing and approving engineer applications
- **Session Persistence**: Secure token storage with automatic re-authentication

### Dashboard System
- **Super Admin Dashboard**: Complete system oversight, admin creation, user statistics
- **Admin Dashboard**: Engineer application management, customer analytics, approval workflows
- **Tabbed Interface**: Organized information architecture with smooth transitions
- **Real-time Updates**: Live statistics and pending application counts
- **Profile Management**: User information updates and password changes

### Notification System
- **Snackbar Integration**: Material Design toast notifications with multiple variants
- **API Response Handling**: Automatic success/error messaging for all operations
- **Role-Specific Messages**: Contextual feedback based on user type and action
- **Error Extraction**: Intelligent error message parsing from API responses
- **Auto-Dismiss**: Configurable timeout with manual dismiss options

## Development Workflow

### When Adding New Features
1. **Authentication First**: Ensure proper role-based access control implementation
2. **Component Reusability**: Create modular components that integrate with existing contexts
3. **TypeScript Safety**: Define comprehensive interfaces in `/types` before implementation
4. **Error Handling**: Implement proper API response handling with snackbar notifications
5. **Brand Integration**: Incorporate logos and design system consistently

### When Modifying Existing Components
1. **Preserve Authentication**: Maintain existing role-based protections and user flows
2. **Enhance API Integration**: Build upon existing useApiResponse patterns
3. **Test All User Roles**: Verify functionality across SUPER_ADMIN, ADMIN, ENGINEER, CUSTOMER
4. **Maintain Responsive Design**: Ensure mobile and desktop compatibility
5. **Update Documentation**: Keep component interfaces and prop definitions current

### Testing Guidelines
- **Role-Based Testing**: Verify components work correctly for each user role
- **API Integration**: Test success and error scenarios for all endpoints
- **Authentication Flow**: Validate login, registration, and session management
- **Responsive Behavior**: Check mobile and desktop layouts thoroughly
- **Error Boundaries**: Ensure graceful degradation for failed operations

## Key Components Deep Dive

### AuthScreen.tsx - Main Authentication Hub
```typescript
// Manages complete authentication flow with step-based navigation
interface AuthScreenProps {
  onAuthSuccess?: () => void;
  initialStep?: AuthStep;
}

// Authentication steps: 'login' | 'registration-type' | 'customer-registration' | 'engineer-registration'
// Integrates with AuthContext for state management
// Provides consistent error handling and loading states
```

### AdminDashboard.tsx - Admin Management Interface  
```typescript
// Tab-based dashboard with stats, applications, user management, profile
interface DashboardStats {
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  approved_engineers: number;
  rejected_engineers: number;
  active_customers: number;
}

// Features engineer application approval/rejection workflow
// Real-time statistics display with animated cards
// Integration with useApiResponse for user feedback
```

### useApiResponse.ts - Centralized Response Handling
```typescript
// Custom hook providing standardized API response management
interface ApiResponseOptions {
  successMessage?: string;
  successTitle?: string;
  errorTitle?: string;
  showSuccess?: boolean;
  showError?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: APIError) => void;
}

// Specialized handlers: handleLoginResponse, handleRegistrationResponse
// Automatic error extraction and user-friendly messaging
// Role-specific success messages and contextual feedback
```

### AuthContext.tsx - Authentication State Management
```typescript
// React context providing authentication state and actions
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithOTP: (data: OTPVerifyRequest) => Promise<void>;
  requestOTP: (data: OTPRequest) => Promise<boolean>;
  registerCustomer: (data: CustomerRegistration) => Promise<void>;
  registerEngineer: (data: EngineerRegistration) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Automatic token validation and session restoration
// Integration with localStorage for persistent sessions
// Error handling with detailed user feedback
```

### SnackbarContext.tsx - Global Notification System
```typescript
// Centralized notification management with Material Design components
interface SnackbarContextType {
  showSnackbar: (message: Omit<SnackbarMessage, 'id'>) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  hideSnackbar: (id?: string) => void;
}

// Auto-dismiss with configurable timeouts
// Multiple notification variants with proper iconography
// Slide-up transition animations with Material Design timing
```

## Performance Considerations
- **Bundle Optimization**: Dynamic imports for dashboard components, lazy-loaded admin interfaces
- **Authentication Caching**: Secure token storage with automatic validation and refresh
- **Component Memoization**: React.memo for expensive dashboard renders and statistics displays
- **API Response Caching**: Strategic caching of user data and dashboard statistics
- **Loading Strategy**: Progressive enhancement with skeleton states and branded animations

## Security Implementation
- **JWT Token Management**: Secure storage, automatic expiration handling, refresh logic
- **Role-Based Access Control**: Component-level and route-level permission enforcement
- **Input Validation**: Comprehensive client-side validation with server-side verification
- **XSS Protection**: Proper input sanitization and Content Security Policy headers
- **Session Security**: Automatic logout on token expiration, secure cookie handling

## Error Handling Patterns
- **Global Error Boundary**: Application-level error catching with user-friendly fallbacks
- **API Error Processing**: Structured error responses with specific user guidance
- **Form Validation**: Real-time validation with contextual error messages
- **Network Resilience**: Offline detection and graceful degradation
- **User Feedback**: Comprehensive snackbar notifications for all user actions

## Brand Identity Implementation

### Logo Usage Guidelines
- **Sidebar**: Use iconlogo.png in collapsed state (28px height)
- **Welcome Screen**: Use fulllogo.png prominently (64px height) 
- **Dashboard Headers**: Use fulllogo.png in dashboard toolbars (32px height)
- **Loading States**: Use iconlogo.png for branded animations
- **Transparency**: Always maintain PNG transparency without white backgrounds

### Color Palette
- **Primary Colors**: Material Design 3 primary color tokens (#6750A4)
- **Secondary Colors**: Complementary color system (#625B71)
- **Background**: Clean white/light surfaces with subtle Material Design 3 elevation
- **Text**: High contrast ratios for accessibility compliance
- **Status Colors**: Success (#006E1C), Error (#BA1A1A), Warning (#9C4A00)

### Typography System
- **Primary Font**: Roboto font family for Material Design consistency
- **Heading Scale**: Material Design 3 typography scale with proper weights
- **Code Font**: Monospace for technical content and code snippets
- **Accessibility**: Minimum 16px base size, proper line heights for readability

This project represents a comprehensive authentication system with modern Material Design 3 aesthetics, combining sophisticated user management with a clean, professional interface that scales from individual users to enterprise-level admin dashboards.
