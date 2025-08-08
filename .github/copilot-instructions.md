# Copilot Instructions for Poornasree AI

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a comprehensive Next.js application called "Poornasree AI" featuring a complete authentication system, role-based dashboards, and Material Design 3 components. The project combines sophisticated user management with a clean, professional interface inspired by modern design principles.

## 🏗️ Project Architecture

### **Core Technology Stack**
- **Framework**: Next.js 15.4.5 with App Router, Turbopack development, and React 19.1.0
- **Language**: TypeScript with strict type checking for enterprise-grade reliability
- **UI Library**: Material UI v6.1.6 implementing Material Design 3 specifications
- **Animation System**: Framer Motion v11.11.7 with custom easing curves and branded loading states
- **Backend Integration**: FastAPI authentication system with JWT tokens and role-based access control
- **State Management**: React Context API for authentication and snackbar notifications
- **Icons**: Lucide React 0.453.0 and Material UI Icons for comprehensive iconography

### **Build Configuration**
- **Development**: `npm run dev` with Turbopack for enhanced performance
- **TypeScript**: Strict mode enabled with comprehensive type checking
- **Linting**: ESLint 9 with Next.js configuration for code quality
- **Styling**: Tailwind CSS 4 with PostCSS integration
- **Font**: Roboto font family from Google Fonts with multiple weights

## 📁 Project Structure

```
poornasreeai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers (65 lines)
│   │   ├── page.tsx                 # Landing page
│   │   ├── loading.tsx              # Global loading component
│   │   ├── not-found.tsx            # 404 error page
│   │   ├── globals.css              # Global styles and CSS variables
│   │   ├── auth/
│   │   │   └── page.tsx             # Authentication page
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Dashboard routing page
│   │   └── login/
│   │       └── page.tsx             # Login page
│   ├── components/                   # Reusable React components
│   │   ├── auth/                    # Authentication components
│   │   │   ├── AuthLayout.tsx       # Auth page layout wrapper
│   │   │   ├── AuthModal.tsx        # Modal for authentication
│   │   │   ├── AuthScreen.tsx       # Main auth flow controller (222 lines)
│   │   │   ├── CustomerRegistrationForm.tsx # Customer signup form
│   │   │   ├── EngineerRegistrationForm.tsx # Engineer application form
│   │   │   ├── LoginForm.tsx        # Login with password/OTP
│   │   │   ├── ProtectedRoute.tsx   # HOC for route protection
│   │   │   ├── RegistrationType.tsx # Registration type selector
│   │   │   └── index.ts             # Component exports
│   │   ├── dashboard/               # Dashboard & admin components
│   │   │   ├── SuperAdminDashboard.tsx # Super admin interface (449 lines)
│   │   │   ├── AdminDashboard.tsx   # Regular admin interface
│   │   │   ├── ProfessionalAdminDashboard.tsx # Enhanced admin UI
│   │   │   ├── ProfileUpdateForm.tsx # User profile management
│   │   │   ├── AddAdminForm.tsx     # Admin creation form
│   │   │   ├── AdminList.tsx        # Admin user management
│   │   │   ├── SystemStatusIndicators.tsx # Real-time status
│   │   │   └── views/               # Dashboard view components
│   │   ├── shared/                  # Shared UI components
│   │   ├── SidebarLayout.tsx        # Main app sidebar (810 lines)
│   │   ├── ChatPage.tsx             # AI chat interface
│   │   ├── LoadingAnimation.tsx     # Branded loading animation (232 lines)
│   │   ├── LoadingButton.tsx        # Button with loading state
│   │   ├── Loading.tsx              # General loading component
│   │   └── TestLogin.tsx            # Development login helper
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state (327 lines)
│   │   └── SnackbarContext.tsx      # Global notifications
│   ├── hooks/                       # Custom React hooks
│   │   └── useApiResponse.ts        # API response handling (238 lines)
│   ├── theme/                       # Material UI theming
│   │   ├── theme.ts                 # MD3 color tokens & typography (206 lines)
│   │   ├── ThemeRegistry.tsx        # Theme provider wrapper
│   │   ├── dashboardDesign.ts       # Dashboard-specific theme
│   │   └── types.ts                 # Theme type augmentations
│   ├── types/                       # TypeScript interfaces
│   │   ├── auth.ts                  # Authentication types (130 lines)
│   │   └── chat.ts                  # Chat interface types
│   ├── utils/                       # Utility functions
│   │   ├── api.ts                   # API client & error handling (251 lines)
│   │   └── dataGenerators.ts        # Mock data generators
│   ├── config/                      # Application configuration
│   │   └── app.ts                   # App config & constants (60 lines)
│   └── constants/                   # Application constants
│       └── departments.ts           # Engineering departments
├── public/                          # Static assets
│   ├── logo/                        # Brand assets
│   │   ├── iconlogo.png            # Compact logo for loading
│   │   ├── fulllogo.png            # Full logo for headers
│   │   └── flogo.png               # Alternative logo variant
│   ├── file.svg                    # File type icons
│   ├── globe.svg                   # Global/network icons
│   ├── next.svg                    # Next.js branding
│   ├── vercel.svg                  # Vercel deployment
│   └── window.svg                  # UI element icons
├── .env.local.example              # Environment variables template
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── next.config.ts                  # Next.js configuration
├── eslint.config.mjs               # ESLint configuration
├── postcss.config.mjs              # PostCSS configuration
├── tailwindcss.config.js           # Tailwind CSS configuration
└── documentation/                   # Project documentation
    ├── ADMIN_DASHBOARD_SYSTEM.md   # Admin system overview
    ├── AUTH_SYSTEM_DOCS.md         # Authentication documentation
    ├── FRONTEND_SETUP_COMPLETE.md  # Setup completion guide
    ├── PROFESSIONAL_ADMIN_DASHBOARD.md # Dashboard design guide
    ├── QUICK_START_GUIDE.md        # Getting started guide
    ├── SUPER_ADMIN_LOGIN_GUIDE.md  # Super admin access
    └── SYSTEM_STATUS_IMPLEMENTATION.md # Status monitoring
```

## 🎯 Current Implementation Status

### **Authentication System** ✅ COMPLETE
- ✅ **Multi-Role Authentication**: SUPER_ADMIN, ADMIN, ENGINEER, CUSTOMER roles with granular permissions
- ✅ **Dual Login Methods**: Password-based and OTP-based authentication with email verification
- ✅ **Registration Workflows**: Separate Customer and Engineer registration flows with admin approval
- ✅ **Protected Routes**: Role-based route protection with automatic redirects and HOC implementation
- ✅ **Session Management**: JWT token handling with automatic refresh and secure localStorage integration
- ✅ **AuthContext Integration**: Complete context provider with reducer pattern for state management

### **Dashboard Components** ✅ COMPLETE
- ✅ **SuperAdminDashboard.tsx**: Complete system overview with admin creation, user management, and real-time analytics
- ✅ **AdminDashboard.tsx**: Engineer application management, approval/rejection workflow, customer analytics
- ✅ **ProfessionalAdminDashboard.tsx**: Enhanced admin interface with modern Material Design 3 aesthetics
- ✅ **ProfileUpdateForm.tsx**: User profile management with password updates and personal information editing
- ✅ **AddAdminForm.tsx**: Admin creation form with department selection and comprehensive validation
- ✅ **AdminList.tsx**: Comprehensive admin management with role badges, delete functionality, and pagination
- ✅ **SystemStatusIndicators.tsx**: Real-time system monitoring with pending application counts

### **Core Components** ✅ COMPLETE
- ✅ **AuthScreen.tsx**: Unified authentication interface with step-based navigation and error handling
- ✅ **LoginForm.tsx**: Dual-mode login (password/OTP) with Material Design 3 styling and validation
- ✅ **CustomerRegistrationForm.tsx**: Machine model and state-based customer registration with OTP verification
- ✅ **EngineerRegistrationForm.tsx**: Department-based engineer registration with admin approval workflow
- ✅ **ProtectedRoute.tsx**: Higher-Order Component for route protection with role validation
- ✅ **SidebarLayout.tsx**: Collapsible sidebar with user information, navigation, and responsive design

### **Design System** ✅ COMPLETE
- ✅ **Material Design 3**: Complete theming with MD3 color tokens, typography scale, and elevation system
- ✅ **Custom Branding**: Logo integration system with iconlogo.png, fulllogo.png, and flogo.png assets
- ✅ **Responsive Design**: Mobile-first approach with adaptive layouts and touch interactions
- ✅ **Animation Framework**: Consistent Framer Motion animations with Material Design easing curves
- ✅ **Loading Animation System**: Comprehensive branded loading states using iconlogo.png throughout application
- ✅ **Error Handling**: Comprehensive snackbar notification system with role-specific messaging

### **State Management** ✅ COMPLETE
- ✅ **AuthContext**: Complete authentication state management with reducer pattern
- ✅ **SnackbarContext**: Global notification system with multiple variants and auto-dismiss
- ✅ **Custom Hooks**: useApiResponse for standardized API interaction patterns
- ✅ **API Integration**: Centralized API client with error handling and token management
- ✅ **Theme Integration**: Material UI theme provider with custom color tokens and typography

## 🎨 Design Principles & Guidelines

### **Authentication UX Standards**
- **Progressive Disclosure**: Step-by-step registration flow with clear progress indicators and validation feedback
- **Dual Authentication**: Support both password and OTP-based login for enhanced security and flexibility
- **Role-Based Workflows**: Distinct user journeys for customers, engineers, and administrators with tailored experiences
- **Validation Feedback**: Real-time form validation with descriptive error messages and field-level guidance
- **Security First**: Secure token management with automatic session handling and logout on expiration

### **Visual Design Standards**
- **Material Design 3**: Adherence to MD3 color system, typography scales, and interaction patterns for consistency
- **Professional Aesthetics**: Clean, minimal interface focusing on content and functionality with purposeful white space
- **Brand Integration**: Consistent use of custom logos throughout the interface with proper transparency handling
- **Accessibility First**: High contrast ratios, semantic HTML, comprehensive ARIA attributes, and keyboard navigation
- **Responsive Excellence**: Mobile-first design with adaptive layouts for all screen sizes and touch interactions

### **Animation & Interaction Patterns**
- **Material Design Easing**: Use `[0.4, 0, 0.2, 1]` cubic-bezier for all transitions and state changes
- **Branded Loading States**: Custom iconlogo.png animations with rotate-stop-rotate patterns used throughout application
- **Loading Component System**: LoadingAnimation, LoadingWithText, PulseLoadingAnimation, and ButtonLoading components
- **Consistent Loading UX**: All loading states use branded logo animations instead of generic Material UI spinners
- **Smooth Transitions**: 300ms duration for most UI state changes with consistent timing and easing
- **Button Loading States**: Interactive buttons show logo animations when processing requests with proper feedback
- **Hover Behaviors**: Subtle hover effects with appropriate feedback delays and accessibility considerations
- **Progressive Enhancement**: Graceful degradation when animations are disabled or reduced motion is preferred

### **Component Architecture Principles**
- **Functional Components**: React hooks and functional patterns exclusively with modern React practices
- **TypeScript Safety**: Comprehensive interfaces for all props, state, and API responses with strict typing
- **Context Integration**: Centralized state management for auth and notifications with minimal prop drilling
- **Separation of Concerns**: Clear boundaries between UI, logic, and data layers with service abstractions
- **Reusable Design**: Modular components that compose and extend elegantly with consistent APIs

## 🔧 Technical Implementation Guidelines

### **Code Quality Standards**
- **TypeScript Strict Mode**: Enable all strict type checking options with comprehensive interface definitions
- **Interface Definitions**: Complete TypeScript interfaces in `/types` and `/hooks` directories with proper exports
- **Error Handling**: Robust error boundaries, loading states, and user feedback systems with graceful degradation
- **Performance**: Bundle optimization, dynamic imports, efficient re-render strategies, and memoization patterns
- **Accessibility**: Complete ARIA labels, semantic HTML, keyboard navigation support, and screen reader compatibility

### **Authentication Implementation Patterns**
```typescript
// AuthContext usage pattern
const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();

// Protected route implementation
<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
  <AdminDashboard />
</ProtectedRoute>

// API call with authentication
const response = await authAPI.login({ email, password });
storeAuthToken(response.access_token);

// Role-based conditional rendering
{user?.role === UserRole.SUPER_ADMIN && <SuperAdminActions />}
```

### **State Management Architecture**
```typescript
// AuthContext reducer pattern
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// SnackbarContext for notifications
const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

// useApiResponse hook for standardized API handling
const { handleApiResponse, handleLoginResponse, handleRegistrationResponse } = useApiResponse();
```

### **API Integration Patterns**
```typescript
// Centralized API client with authentication
const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  // Implementation with error handling
};

// Custom APIError class for structured error handling
class APIError extends Error {
  constructor(message: string, public status: number, public errors?: string[]) {
    super(message);
    this.name = 'APIError';
  }
}
```

### **Animation Implementation Patterns**
```typescript
// LoadingAnimation component usage
<LoadingAnimation size={48} duration={1.5} pauseDuration={0.5} />

// Framer Motion animation with Material Design easing
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

// Button loading state implementation
{loading ? <LoadingAnimation size={20} /> : 'Submit'}
```

## 🎯 Loading Animation System

### **Core Loading Components**
The application uses a comprehensive branded loading animation system that replaces all generic Material UI CircularProgress components with custom logo-based animations.

#### **LoadingAnimation.tsx - Main Loading Component**
```typescript
interface LoadingAnimationProps {
  size?: number;           // Default: 48px
  duration?: number;       // Default: 1.5s
  pauseDuration?: number;  // Default: 0.5s
}

// Features:
// - Rotate-pause-rotate animation pattern with Material Design easing
// - Transparent background handling for proper logo display
// - Configurable size and timing for different contexts
// - Subtle scale animation for breathing effect
// - No white background artifacts with proper PNG transparency
```

#### **LoadingWithText Component**
```typescript
interface LoadingWithTextProps extends LoadingAnimationProps {
  text?: string;          // Default: "Loading..."
  showText?: boolean;     // Default: true
}

// Features:
// - Combines LoadingAnimation with animated text
// - Typing dots animation with staggered delays
// - Used for page-level loading states with context
// - Responsive text sizing and spacing
```

#### **ButtonLoading Component**
```typescript
interface ButtonLoadingProps {
  size?: number;          // Default: 20px for button context
  variant?: 'rotate' | 'pulse';
}

// Features:
// - Optimized for inline button usage
// - Smaller default size for button context
// - Maintains button layout without shifting
// - Consistent with button styling
```

### **Implementation Guidelines**

#### **Replacing CircularProgress**
```typescript
// ❌ OLD: Generic Material UI spinner
{loading ? <CircularProgress size={24} /> : 'Submit'}

// ✅ NEW: Branded logo animation
{loading ? <LoadingAnimation size={24} /> : 'Submit'}

// ✅ BUTTON CONTEXT: Optimized for buttons
{loading ? <ButtonLoading size={20} /> : 'Submit'}

// ✅ PAGE LOADING: With descriptive text
<LoadingWithText text="Loading dashboard..." size={48} />
```

#### **Animation Consistency Standards**
- **Timing**: Use Material Design easing `[0.4, 0, 0.2, 1]` for all animations
- **Duration**: Standard 1.5s rotation with 0.5s pause for primary loading states
- **Size Standards**: 20px for buttons, 48px for cards, 64px for page loading
- **Background**: Always use transparent backgrounds to prevent white artifacts
- **Performance**: Optimize animations for 60fps with proper GPU acceleration

## 🔐 Authentication & Security Implementation

### **AuthContext Architecture**
```typescript
// Complete authentication state management
interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithOTP: (data: OTPVerifyRequest) => Promise<void>;
  requestOTP: (data: OTPRequest) => Promise<boolean>;
  registerCustomer: (data: CustomerRegistration) => Promise<void>;
  registerEngineer: (data: EngineerRegistration) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Reducer pattern for state management
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
    case 'SET_ERROR':
    case 'LOGIN_SUCCESS':
    case 'LOGOUT':
    case 'CLEAR_ERROR':
      // Implementation with immutable state updates
  }
};
```

### **Protected Route Implementation**
```typescript
// Higher-Order Component for route protection
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/auth',
  fallback
}) => {
  // Implementation with role checking and automatic redirects
};
```

### **Session Management**
```typescript
// Token storage and validation
const storeAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};
```

## 📊 Dashboard System Architecture

### **SuperAdminDashboard.tsx - Complete System Overview**
```typescript
interface DashboardStats {
  total_users: number;
  total_admins: number;
  total_engineers: number;
  total_customers: number;
  pending_engineers: number;
  active_users: number;
  inactive_users: number;
}

// Features:
// - Real-time statistics fetching with auto-refresh
// - Tabbed interface for different management areas
// - Admin creation and management functionality
// - User statistics with visual indicators
// - Engineer application approval workflow
// - Profile management integration
```

### **Real-time Status Updates**
```typescript
// SystemStatusIndicators component for live data
const fetchDashboardStats = async () => {
  try {
    const response = await fetch('/api/v1/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    setStats(data.stats);
  } catch (error) {
    handleApiError(error);
  }
};

// Auto-refresh mechanism
useEffect(() => {
  fetchDashboardStats();
  const interval = setInterval(fetchDashboardStats, 30000); // 30-second refresh
  return () => clearInterval(interval);
}, []);
```

## 🎨 Material Design 3 Implementation

### **Color System**
```typescript
// Material Design 3 color tokens
export const colorTokens = {
  primary: {
    main: '#6750A4',
    light: '#EADDFF',
    dark: '#21005D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#625B71',
    light: '#E8DEF8',
    dark: '#1D192B',
    contrastText: '#FFFFFF',
  },
  // Complete MD3 color system with semantic tokens
};
```

### **Typography Scale**
```typescript
// Material Design 3 typography system
export const typographyTokens = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '3.5rem',
    fontWeight: 400,
    lineHeight: 1.167,
    letterSpacing: '-0.01562em',
  },
  // Complete typography scale with proper spacing
};
```

### **Theme Integration**
```typescript
// Theme provider setup in layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased`}>
        <ThemeRegistry>
          <AuthProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
```

## 🚀 Performance & Optimization

### **Bundle Optimization**
- **Dynamic Imports**: Lazy-loaded dashboard components and admin interfaces
- **Code Splitting**: Route-based code splitting with Next.js App Router
- **Tree Shaking**: Optimal imports for Material UI and other libraries
- **Image Optimization**: Next.js Image component for logo assets

### **Component Memoization**
```typescript
// React.memo for expensive renders
const ExpensiveDashboardComponent = React.memo(({ stats }: { stats: DashboardStats }) => {
  return <ComplexVisualization data={stats} />;
});

// useMemo for expensive calculations
const processedStats = useMemo(() => {
  return computeComplexStatistics(rawStats);
}, [rawStats]);

// useCallback for stable function references
const handleUserAction = useCallback((userId: number) => {
  // Implementation
}, [dependency]);
```

### **Authentication Caching**
- **Token Storage**: Secure localStorage with automatic cleanup
- **Session Restoration**: Automatic token validation on app initialization
- **API Response Caching**: Strategic caching of user data and dashboard statistics
- **Optimistic Updates**: Immediate UI updates with backend synchronization

## 🛡️ Security Implementation

### **Client-Side Security**
```typescript
// Input validation with TypeScript interfaces
interface CustomerRegistration {
  email: string;
  first_name: string;
  last_name: string;
  machine_model: string;
  state: string;
  phone_number: string;
  otp_code: string;
}

// Role-based access control
const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Secure token handling
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};
```

### **Error Handling Patterns**
```typescript
// Global error boundary for authentication errors
class AuthErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth error:', error, errorInfo);
  }
}

// API error handling with user feedback
const handleApiError = (error: APIError) => {
  if (error.status === 401) {
    // Handle authentication errors
    logout();
    showError('Session expired. Please log in again.');
  } else {
    showError(error.message || 'An error occurred');
  }
};
```

## 🔧 Development Workflow

### **Adding New Features**
1. **Authentication First**: Ensure proper role-based access control implementation
2. **TypeScript Safety**: Define comprehensive interfaces in `/types` before implementation
3. **Component Reusability**: Create modular components that integrate with existing contexts
4. **Error Handling**: Implement proper API response handling with snackbar notifications
5. **Brand Integration**: Incorporate logos and design system consistently
6. **Loading States**: Use branded LoadingAnimation components instead of CircularProgress
7. **Testing**: Verify functionality across all user roles and screen sizes

### **Code Review Checklist**
- ✅ TypeScript interfaces defined with proper exports
- ✅ Authentication and authorization checks implemented
- ✅ Error handling with user-friendly messages
- ✅ Loading states with branded animations
- ✅ Responsive design with mobile support
- ✅ Accessibility attributes and keyboard navigation
- ✅ Material Design 3 principles followed
- ✅ Performance optimizations applied

### **Testing Guidelines**
- **Role-Based Testing**: Verify components work correctly for each user role
- **Authentication Flow**: Validate login, registration, and session management
- **Responsive Behavior**: Check mobile and desktop layouts thoroughly
- **Error Scenarios**: Test API failures and network issues
- **Accessibility**: Verify keyboard navigation and screen reader support

## 🎯 Component Usage Patterns

### **Authentication Components**
```typescript
// AuthScreen usage with step management
<AuthScreen 
  initialStep="login"
  onAuthSuccess={() => router.push('/dashboard')}
/>

// ProtectedRoute for role-based access
<ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
  <AdminDashboard />
</ProtectedRoute>

// LoginForm with dual authentication modes
<LoginForm 
  onSuccess={handleLoginSuccess}
  onSwitchToOTP={handleOTPMode}
  loading={isLoading}
/>
```

### **Dashboard Components**
```typescript
// SuperAdminDashboard with real-time updates
<SuperAdminDashboard 
  autoRefresh={true}
  refreshInterval={30000}
/>

// AdminList with pagination and filtering
<AdminList 
  onAdminCreated={handleAdminCreated}
  onAdminDeleted={handleAdminDeleted}
  pageSize={10}
/>

// ProfileUpdateForm with validation
<ProfileUpdateForm 
  user={currentUser}
  onUpdateSuccess={handleProfileUpdate}
  onPasswordChange={handlePasswordChange}
/>
```

### **Loading and Animation Components**
```typescript
// LoadingAnimation for general use
<LoadingAnimation size={48} duration={1.5} />

// LoadingWithText for contextual loading
<LoadingWithText text="Loading dashboard..." size={64} />

// ButtonLoading for button states
<Button 
  disabled={loading}
  startIcon={loading ? <ButtonLoading size={20} /> : <SaveIcon />}
>
  {loading ? 'Saving...' : 'Save Changes'}
</Button>
```

## 🌟 Brand Identity Implementation

### **Logo Usage Guidelines**
- **Sidebar**: Use iconlogo.png in collapsed state (28px height) with proper spacing
- **Welcome Screen**: Use fulllogo.png prominently (64px height) with brand messaging
- **Dashboard Headers**: Use fulllogo.png in dashboard toolbars (32px height) with navigation
- **Loading States**: Use iconlogo.png for branded animations with transparent backgrounds
- **Email Templates**: Use fulllogo.png in email headers with consistent styling

### **Asset Optimization**
- **PNG Transparency**: Maintain proper transparency without white backgrounds
- **Responsive Sizing**: Scale logos appropriately for different screen sizes and DPI
- **Performance**: Optimize image files for web delivery with Next.js Image component
- **Accessibility**: Provide alt text and proper ARIA labels for logo images

This project represents a comprehensive authentication system with modern Material Design 3 aesthetics, combining sophisticated user management with a clean, professional interface that scales from individual users to enterprise-level admin dashboards.

## 🎉 Recent Updates & Achievements

### **✅ COMPLETE: Comprehensive Frontend API Integration & Error Handling System**
- **21 API Endpoints Audited**: Comprehensive exploration and enhancement of all frontend endpoints
- **Standardized Error Handling**: Every API call now has proper error handling with status-specific snackbar notifications
- **Complete Coverage**: Authentication, user management, admin operations, and dashboard APIs fully integrated
- **Robust UX**: Users receive appropriate feedback for all success/error scenarios with contextual messaging

### **✅ COMPLETE: Universal Branded Loading Animation System**
- **Total CircularProgress Replacement**: All generic Material UI spinners replaced with branded LoadingAnimation
- **All Components Updated**: Every interactive button across the application now uses branded logo animations
- **Dashboard Views Enhanced**: Engineers.tsx, Customers.tsx, EngineerApplicationCard.tsx, ProfessionalAdminDashboard.tsx, SuperAdminDashboard.tsx
- **Authentication Forms**: All auth components use branded loading states
- **User Management**: Profile updates, admin creation, and all CRUD operations show logo animations
- **Consistent Branding**: Unified loading experience with iconlogo.png throughout entire application

### **✅ COMPLETE: Advanced Dashboard Management System**
- **Engineers Management**: Complete CRUD operations with branded loading, comprehensive error handling, and real-time updates
- **Customers Management**: Full customer lifecycle management with sophisticated status tracking and bulk operations
- **Engineer Applications**: Streamlined approval/rejection workflow with immediate feedback and status updates
- **Admin Panel**: Advanced admin creation, role management, and permission systems
- **Real-time Monitoring**: Live dashboard statistics with 30-second auto-refresh and system status indicators

### **✅ COMPLETE: Production-Ready Error Handling Architecture**
- **API Error Classification**: Structured handling for 400, 401, 403, 404, 422, 500 status codes
- **User-Friendly Messaging**: Context-aware error messages with actionable guidance
- **Network Error Handling**: Graceful degradation for connectivity issues
- **Validation Feedback**: Real-time form validation with field-level error display
- **Recovery Mechanisms**: Automatic retry logic and user-guided error recovery

### **✅ COMPLETE: TypeScript Code Quality & File Management**
- **Duplicate Code Resolution**: Fixed all duplicate function implementations and interface declarations
- **Clean File Structure**: Resolved Engineers.tsx and Customers.tsx corruption issues
- **Zero TypeScript Errors**: All dashboard components compile without warnings or errors
- **Consistent Import Patterns**: Standardized import organization and dependency management
- **Performance Optimization**: Eliminated redundant code and improved bundle efficiency

### **✅ COMPLETE: Snackbar Notification System Enhancement**
- **Comprehensive Coverage**: Every user action now provides appropriate feedback
- **Contextual Messaging**: Role-specific notifications with relevant information
- **Success Confirmations**: Clear success indicators for all completed operations
- **Error Recovery**: Actionable error messages with suggested next steps
- **Loading States**: Informative progress updates during long-running operations

### **Key Implementation Patterns Now Established**
```typescript
// ✅ Standard API Error Handling Pattern
const handleApiError = (error: any, defaultMessage: string) => {
  if (error.response?.status === 401) {
    showError('Your session has expired. Please log in again.', 'Authentication Required');
  } else if (error.response?.status === 403) {
    showError('You do not have permission to perform this action.', 'Access Denied');
  } else {
    showError(error.response?.data?.detail || defaultMessage, 'Error');
  }
};

// ✅ Branded Loading Animation Usage
{actionLoading === itemId ? (
  <LoadingAnimation size={16} />
) : (
  <ActionIcon fontSize="small" />
)}

// ✅ Comprehensive API Request Pattern
const makeApiRequest = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw { response: { status: response.status, data: await response.json() } };
  }
  
  return response.json();
};
```

### **Current System Status** 🚀
- **Frontend Architecture**: Production-ready with comprehensive error handling
- **User Experience**: Consistent branded animations and contextual feedback throughout
- **Code Quality**: Zero TypeScript errors, clean file structure, optimized performance
- **API Integration**: All 21 endpoints properly integrated with standardized error handling
- **Dashboard System**: Complete user management with real-time updates and advanced features
- **Loading States**: Universal branded animations replacing all generic Material UI spinners
- **Error Recovery**: Robust error handling with user-friendly messaging and recovery options

### **Development Guidelines Updated**
- **Always use LoadingAnimation**: Never use CircularProgress - use branded logo animations
- **Implement comprehensive error handling**: Use handleApiError pattern for all API calls
- **Provide user feedback**: Every action should have appropriate snackbar notifications
- **Maintain TypeScript quality**: Ensure no duplicate declarations or compilation errors
- **Follow established patterns**: Use the standardized API request and error handling patterns

**Remember**: The application now has enterprise-grade error handling, consistent branding through loading animations, and comprehensive user feedback systems. Always maintain these standards when adding new features or components.
