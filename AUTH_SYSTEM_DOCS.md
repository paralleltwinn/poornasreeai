# Authentication System Documentation

This document describes the comprehensive authentication system built for the Poornasree AI frontend application, integrated with the psr-ai-api backend.

## 🏗️ Architecture Overview

The authentication system is built using a layered architecture:

### 1. **Context Layer** (`src/contexts/AuthContext.tsx`)
- Manages global authentication state using React Context + useReducer
- Handles token storage and retrieval
- Provides authentication methods (login, register, logout)
- Automatically initializes authentication state on app load

### 2. **API Layer** (`src/utils/api.ts`)
- Centralizes all API calls to the backend
- Handles token-based authentication
- Provides error handling and response formatting
- Includes JWT token utilities (decode, expiration check)

### 3. **Component Layer** (`src/components/auth/`)
- Modular, reusable authentication components
- Material-UI design system integration
- Framer Motion animations
- Form validation and user experience optimization

### 4. **Type Layer** (`src/types/auth.ts`)
- TypeScript interfaces matching backend API schemas
- Ensures type safety across the entire auth flow

## 🔐 Supported Authentication Methods

### 1. **Password-based Login**
- Email + password authentication
- Secure token-based session management
- Password visibility toggle

### 2. **OTP-based Login**
- Email-based OTP authentication
- 60-second cooldown timer
- 6-digit verification code

### 3. **Customer Registration**
- Two-step registration process
- Email verification with OTP
- Immediate account activation

### 4. **Engineer Application**
- Comprehensive application form
- Skills, experience, and portfolio submission
- Admin review required (no immediate activation)

## 📱 User Interface Components

### `AuthScreen` - Main Controller
The primary component that orchestrates the entire authentication flow:

```tsx
<AuthScreen 
  onAuthSuccess={() => router.push('/dashboard')}
  initialStep="login"
/>
```

**Features:**
- Step-based navigation
- Error handling with user feedback
- Loading states and animations
- Success message handling

### `LoginForm` - Authentication Entry Point
Dual-mode login component supporting both password and OTP authentication:

```tsx
<LoginForm
  onRegisterClick={() => setStep('register')}
  onSuccess={() => handleAuthSuccess()}
/>
```

**Features:**
- Tabbed interface (Password/OTP)
- Real-time form validation
- Resend OTP functionality
- Keyboard navigation support

### `RegistrationType` - User Type Selection
Allows users to choose between Customer and Engineer registration:

```tsx
<RegistrationType
  onTypeSelect={(type) => handleRegistration(type)}
  onBackClick={() => goToLogin()}
/>
```

**Features:**
- Visual card-based selection
- Hover animations
- Clear role descriptions

### `CustomerRegistrationForm` - Customer Signup
Two-step customer registration with email verification:

```tsx
<CustomerRegistrationForm
  onBackClick={() => goBack()}
  onSuccess={() => handleSuccess()}
  initialEmail="user@example.com"
/>
```

**Features:**
- Progress stepper
- Email verification flow
- Phone number (optional)
- Immediate account activation

### `EngineerRegistrationForm` - Engineer Application
Comprehensive form for engineer applications:

```tsx
<EngineerRegistrationForm
  onBackClick={() => goBack()}
  onSuccess={() => showSuccessMessage()}
/>
```

**Features:**
- Multi-section form layout
- Experience level selection
- Skills and portfolio submission
- Cover letter (optional)
- URL validation

### `ProtectedRoute` - Route Protection
Higher-order component for protecting authenticated routes:

```tsx
<ProtectedRoute requiredRole={['ADMIN', 'CUSTOMER']}>
  <Dashboard />
</ProtectedRoute>
```

**Features:**
- Authentication checking
- Role-based access control
- Loading states
- Automatic redirect to login

### `AuthLayout` - Consistent UI Framework
Base layout providing consistent styling across all auth screens:

```tsx
<AuthLayout
  title="Welcome Back"
  subtitle="Sign in to continue"
  error={errorMessage}
  isLoading={loading}
>
  {children}
</AuthLayout>
```

**Features:**
- Responsive design
- Brand consistency
- Error display
- Loading overlays
- Background animations

## 🔗 API Integration

### Backend Endpoints Used

| Method | Endpoint | Purpose | Component |
|--------|----------|---------|-----------|
| `POST` | `/api/v1/auth/login` | Password login | LoginForm |
| `POST` | `/api/v1/auth/request-otp` | Request OTP | LoginForm, CustomerRegistrationForm |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP & login | LoginForm |
| `POST` | `/api/v1/auth/register/customer` | Customer registration | CustomerRegistrationForm |
| `POST` | `/api/v1/auth/register/engineer` | Engineer application | EngineerRegistrationForm |
| `GET` | `/api/v1/users/me` | Get user profile | AuthContext (initialization) |

### Request/Response Flow

1. **Authentication Request** → API call with credentials
2. **Backend Validation** → Server validates and processes
3. **Token Response** → JWT token returned on success
4. **Token Storage** → Stored in localStorage
5. **Context Update** → Global state updated
6. **UI Redirect** → User redirected to protected content

## 🛡️ Security Features

### Token Management
- JWT tokens stored in localStorage
- Automatic token expiration checking
- Secure token transmission in Authorization headers
- Token cleanup on logout

### Form Validation
- Email format validation
- Password strength requirements (8+ characters)
- URL format validation for portfolios
- Real-time validation feedback

### Error Handling
- Network error detection
- API error message display
- Form validation errors
- Automatic error clearing

### Role-Based Access Control
- User role checking in ProtectedRoute
- Backend role validation
- UI adaptation based on user permissions

## 🎨 Design System Integration

### Material-UI Components
- Consistent design language
- Custom theme integration
- Responsive layouts
- Accessibility compliance

### Animation Framework
- Framer Motion integration
- Page transition animations
- Loading state animations
- Hover effects and micro-interactions

### Color Scheme
```typescript
primary: '#6750A4'      // Main brand color
secondary: '#625B71'    // Secondary actions
surface: '#FFFBFE'      // Background surfaces
error: '#BA1A1A'        // Error states
success: '#006E1C'      // Success states
```

## 🚀 Usage Examples

### Basic Authentication Setup

1. **Wrap your app with AuthProvider:**
```tsx
// app/layout.tsx
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

2. **Protect routes:**
```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from '../components/auth';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

3. **Use authentication state:**
```tsx
import { useAuth } from '../contexts/AuthContext';

function UserProfile() {
  const { user, logout, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Custom Authentication Flows

```tsx
// Custom login page
function CustomLogin() {
  const { login } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (error) {
      // Error handled by context
    }
  };
  
  return <LoginForm onSuccess={handleLogin} />;
}
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Configuration
```typescript
// src/utils/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

## 🧪 Testing the System

### 1. **Start the Backend API**
```bash
cd psr-ai-api
python -m uvicorn main:app --reload
```

### 2. **Start the Frontend**
```bash
cd poornasreeai
npm run dev
```

### 3. **Test Authentication Flows**
- Visit `http://localhost:3000/auth` for dedicated auth page
- Visit `http://localhost:3000` for protected main page
- Try different registration types
- Test OTP flows
- Verify role-based access

## 📚 Component Hierarchy

```
AuthScreen (Main Controller)
├── AuthLayout (UI Framework)
│   ├── LoginForm
│   │   ├── Password Tab
│   │   └── OTP Tab
│   ├── RegistrationType
│   │   ├── Customer Card
│   │   └── Engineer Card
│   ├── CustomerRegistrationForm
│   │   ├── Step 1: Account Details
│   │   └── Step 2: Email Verification
│   └── EngineerRegistrationForm
│       ├── Personal Information
│       └── Professional Information
└── ProtectedRoute (Route Guard)
    └── Application Content
```

## 🔄 State Management Flow

```
User Action → Component → useAuth Hook → API Call → Backend → Response → Context Update → UI Update
```

## 📈 Future Enhancements

1. **Social Authentication** (Google, GitHub, LinkedIn)
2. **Two-Factor Authentication** (TOTP)
3. **Remember Me** functionality
4. **Session timeout warnings**
5. **Password reset flows**
6. **Account verification emails**
7. **Audit logging**
8. **Rate limiting display**

## 🐛 Troubleshooting

### Common Issues

1. **"Network error occurred"**
   - Check if backend API is running
   - Verify NEXT_PUBLIC_API_URL configuration

2. **"Token expired" errors**
   - Token expiration is handled automatically
   - User will be redirected to login

3. **Form validation errors**
   - Check email format
   - Ensure password meets requirements
   - Verify required fields are filled

4. **OTP not received**
   - Check backend logs for email sending
   - Verify email service configuration
   - Wait for cooldown timer

This authentication system provides a robust, user-friendly, and secure foundation for the Poornasree AI application, with comprehensive integration to the psr-ai-api backend.
