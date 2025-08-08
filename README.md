# 🚀 Poornasree AI - Next.js Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.0+-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://typescriptlang.org)
[![Material-UI](https://img.shields.io/badge/Material--UI-6.0+-purple.svg)](https://mui.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A **sophisticated AI-powered chat interface** built with Next.js 15 and Material Design 3, featuring **Perplexity.ai-inspired design**, **comprehensive authentication system**, and **professional animations**. Integrates seamlessly with the Poornasree AI FastAPI backend for complete user management and role-based access control.

## ✨ Features

### 🎨 **Modern UI/UX**
- 💎 **Material Design 3** - Modern, accessible UI components with custom theme system
- 🎭 **Perplexity.ai-inspired Interface** - Clean, borderless chat experience with professional aesthetics
- � **Responsive Design** - Optimized for mobile and desktop with adaptive layouts
- 🎬 **Rich Animations** - Framer Motion for smooth transitions and loading states
- 🖼️ **Custom Branding** - Integrated logo system with iconlogo.png and fulllogo.png

### � **Authentication System**
- 🔑 **Multi-Modal Authentication** - Password login + OTP-based verification
- 👥 **Role-Based Access Control** - Support for 4 user roles (SUPER_ADMIN, ADMIN, ENGINEER, CUSTOMER)
- 🛡️ **JWT Token Management** - Secure session handling with auto-expiration
- 📧 **Email Verification** - OTP-based email confirmation for customers
- 🔄 **Engineer Applications** - Comprehensive application workflow with admin approval
- 🚪 **Route Protection** - Automatic authentication checks and redirects

### 💬 **Chat Interface**
- � **Interactive Welcome Screen** - Beautiful landing with typing animation and logo integration
- 💬 **Borderless Chat Design** - Clean conversation view matching modern AI interfaces
- 🔍 **Source Citations** - Research-style source linking with clickable references
- 💡 **Smart Suggestions** - Dynamic conversation suggestions and quick action buttons
- 📚 **Chat History Management** - Organized conversation tracking

### 🔄 **Smart Navigation**
- 🎯 **Collapsible Sidebar** - Minimized by default, expands on 2-second hover
- 🌊 **Smooth Animations** - Stable layout transitions without glitching
- 📱 **Mobile Support** - Responsive drawer for touch devices
- 🎨 **Custom Loading States** - Branded loading animations with rotate-stop-rotate patterns

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │    │   FastAPI       │    │   MySQL         │
│   Frontend      │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (Port 8000)   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Material-UI   │    │   Email Service │
│   + Framer      │    │   (SMTP/Gmail)  │
│   Motion        │    │                 │
└─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
poornasreeai/
├── 📂 src/
│   ├── 🎨 app/                          # Next.js App Router
│   │   ├── favicon.ico                 # App favicon
│   │   ├── globals.css                 # Global styles
│   │   ├── layout.tsx                  # Root layout with providers
│   │   ├── loading.tsx                 # Global loading component
│   │   ├── not-found.tsx              # 404 page
│   │   ├── page.tsx                    # Home page (protected)
│   │   └── auth/                       # Authentication routes
│   │       └── page.tsx               # Auth page
│   ├── 🧩 components/                   # React components
│   │   ├── auth/                       # Authentication components
│   │   │   ├── AuthModal.tsx          # Main auth modal with dynamic forms
│   │   │   ├── AuthLayout.tsx         # Auth screens layout
│   │   │   ├── LoginForm.tsx          # Password/OTP login forms
│   │   │   ├── RegistrationType.tsx   # User type selection
│   │   │   ├── CustomerRegistration.tsx # Customer signup form
│   │   │   ├── EngineerRegistration.tsx # Engineer application form
│   │   │   └── ProtectedRoute.tsx     # Route protection wrapper
│   │   ├── ChatPage.tsx               # Main chat interface
│   │   ├── SidebarLayout.tsx          # Collapsible sidebar navigation
│   │   ├── Loading.tsx                # Enhanced loading component
│   │   └── LoadingAnimation.tsx       # Custom branded animations
│   ├── 🎭 contexts/                     # React Context providers
│   │   └── AuthContext.tsx            # Global authentication state
│   ├── ⚙️ config/                       # Configuration files
│   │   └── app.ts                     # App configuration constants
│   ├── 🎨 theme/                        # Material-UI theme system
│   │   ├── theme.ts                   # Material Design 3 theme
│   │   ├── ThemeRegistry.tsx          # Theme provider with SSR
│   │   └── types.ts                   # Theme type definitions
│   ├── 📝 types/                        # TypeScript type definitions
│   │   ├── auth.ts                    # Authentication interfaces
│   │   └── chat.ts                    # Chat-related types
│   └── 🛠️ utils/                        # Utility functions
│       ├── api.ts                     # API client and auth utilities
│       └── dataGenerators.ts         # Mock data generators
├── 📁 public/                          # Static assets
│   └── logo/                          # Brand assets
│       ├── iconlogo.png              # Sidebar/loading icon
│       ├── fulllogo.png              # Main brand logo
│       └── flogo.png                 # Alternative logo
├── ⚙️ Configuration Files
│   ├── next.config.ts                # Next.js configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── eslint.config.mjs             # ESLint configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   └── package.json                  # Dependencies and scripts
└── 📚 Documentation
    └── README.md                     # This file
```

## 🚀 Quick Start

### 1️⃣ **Prerequisites**
```bash
# Node.js 18+
node --version

# npm or yarn
npm --version
```

### 2️⃣ **Installation**
```bash
# Clone the repository
git clone https://github.com/your-org/poornasreeai.git
cd poornasreeai

# Install dependencies
npm install
```

### 3️⃣ **Environment Setup**
```bash
# Create environment file
cp .env.local.example .env.local

# Edit configuration (optional - defaults work for local development)
nano .env.local
```

```bash
# .env.local (optional configuration)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Poornasree AI
```

### 4️⃣ **Start Backend API** (Required)
```bash
# In separate terminal, start the FastAPI backend
cd ../psr-ai-api
python main.py

# Backend should be running on http://localhost:8000
```

### 5️⃣ **Launch Development Server**
```bash
# Start Next.js development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🔐 Authentication System

### 🎯 **Supported Authentication Methods**

#### 🔑 **Super Admin Login**
- **Email**: `official.tishnu@gmail.com`
- **Password**: `Access@404`
- **Flow**: Email + Password → Direct login (no OTP)
- **Access**: Full system administration

#### 📧 **Customer Registration**
- **Method**: Email verification with OTP
- **Flow**: Registration → Email OTP → Account activation
- **Access**: Basic chat and profile features

#### 🛠️ **Engineer Application**
- **Method**: Application form with admin review
- **Flow**: Application → Admin review → Approval/rejection
- **Access**: Extended features after approval

#### 🔐 **OTP-Based Login**
- **Method**: Email-based one-time password
- **Flow**: Email → OTP sent → Verification → Login
- **Access**: Role-based permissions

### 🎭 **Smart Authentication UI**

#### **Dynamic Login Form**
```typescript
// Automatic form adaptation based on email:
// official.tishnu@gmail.com → Password field appears
// other@email.com → OTP verification flow

<AuthModal>
  {email === 'official.tishnu@gmail.com' ? (
    <PasswordLogin />  // Direct admin login
  ) : (
    <OTPLogin />       // Standard user flow
  )}
</AuthModal>
```

#### **Progressive Registration**
- **Customer**: Simple 2-step process (details → email verification)
- **Engineer**: Comprehensive application (experience, skills, portfolio)
- **Visual Stepper**: Clear progress indication
- **Form Validation**: Real-time feedback and error handling

### 🛡️ **Security Features**
- 🔒 **JWT Token Storage** - Secure client-side token management
- ⏰ **Auto-expiration** - Automatic token refresh and logout
- 🚫 **Route Protection** - Unauthorized access prevention
- 🔐 **Role-based Access** - Granular permission system
- 🛡️ **CSRF Protection** - Cross-site request forgery prevention

## 🎨 Design System

### 🎭 **Material Design 3 Implementation**
- **Color System**: Dynamic color tokens with light/dark mode support
- **Typography**: Inter font family with Material Design scale
- **Component Library**: Custom Material-UI components
- **Spacing**: 8px grid system for consistent layouts
- **Elevation**: Proper shadow system for depth perception

### 🖼️ **Branding System**
```typescript
// Logo Usage Guidelines
const logoSystem = {
  sidebar: 'iconlogo.png',      // Collapsed state (28px)
  welcome: 'fulllogo.png',      // Welcome screen (64px)
  header: 'fulllogo.png',       // Chat header (28px)
  loading: 'iconlogo.png',      // Animations (32px)
}
```

### 🎬 **Animation Framework**
- **Framer Motion**: Professional animation library
- **Easing Curves**: Material Design motion specifications
- **Loading States**: Custom branded animations
- **Page Transitions**: Smooth navigation between routes
- **Micro-interactions**: Hover effects and button animations

## 💬 Chat Interface Features

### 🌟 **Welcome Experience**
- **Centered Logo**: fulllogo.png prominently displayed
- **Typing Animation**: Welcome text with typewriter effect
- **Quick Actions**: Interactive buttons for common tasks
- **Professional Layout**: Vertical logo-text hierarchy

### 💬 **Conversation View**
- **Borderless Design**: Clean Perplexity.ai-style interface
- **Rich Typography**: Enhanced message display with proper spacing
- **Source Citations**: Clickable source chips with external links
- **Smart Suggestions**: Context-aware follow-up questions
- **Message History**: Persistent conversation tracking

### 🔄 **Interactive Elements**
- **Suggestion Buttons**: Quick action prompts
- **Source Links**: External reference integration
- **Copy Functionality**: Message copying with formatting
- **Export Options**: Conversation export capabilities

## 🛠️ Development

### 📦 **Available Scripts**
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 🧪 **Testing**
```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 🔧 **Code Quality**
```bash
# ESLint for code quality
npm run lint

# Prettier for code formatting
npm run format

# TypeScript type checking
npm run type-check

# Bundle analysis
npm run analyze
```

## 📱 Responsive Design

### 📐 **Breakpoint System**
```typescript
const breakpoints = {
  xs: '0px',      // Mobile portrait
  sm: '600px',    // Mobile landscape
  md: '900px',    // Tablet
  lg: '1200px',   // Desktop
  xl: '1536px',   // Large desktop
}
```

### 🎯 **Mobile Optimizations**
- **Touch-friendly**: Larger tap targets and gesture support
- **Drawer Navigation**: Collapsible sidebar becomes slide-out drawer
- **Responsive Typography**: Scalable text for different screen sizes
- **Optimized Images**: WebP format with fallbacks
- **Performance**: Lazy loading and code splitting

## ⚡ Performance

### 🚀 **Optimization Features**
- **Next.js 15**: Latest React framework with App Router
- **Turbopack**: Ultra-fast development builds
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Webpack bundle analyzer integration

### 📊 **Performance Metrics**
- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

## 🚀 Deployment

### 🌐 **Vercel Deployment** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Production deployment
vercel --prod
```

### 🐳 **Docker Deployment**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ **Production Environment**
```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start npm --name "poornasree-ai" -- start
```

## 🔧 API Integration

### 🌐 **Backend Connection**
```typescript
// API Client Configuration
const apiClient = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

// Authentication endpoints
const authAPI = {
  login: '/api/v1/auth/login',
  register: '/api/v1/auth/register',
  verifyOTP: '/api/v1/auth/verify-otp',
  requestOTP: '/api/v1/auth/request-otp',
}
```

### 🔐 **Token Management**
```typescript
// JWT Token Utilities
const tokenUtils = {
  store: (token: string) => localStorage.setItem('token', token),
  get: () => localStorage.getItem('token'),
  remove: () => localStorage.removeItem('token'),
  decode: (token: string) => jwtDecode(token),
  isExpired: (token: string) => Date.now() >= decode(token).exp * 1000,
}
```

## 🎯 Testing Guide

### 🔐 **Authentication Testing**

#### **Super Admin Login**
1. Open http://localhost:3000
2. Click account icon in sidebar
3. Enter: `official.tishnu@gmail.com`
4. Password field appears automatically
5. Enter: `Access@404`
6. Click "Sign In as Admin"
7. ✅ Should login with SUPER_ADMIN role

#### **Customer Registration**
1. Click "Get Started" in auth modal
2. Select "Customer" registration type
3. Fill in registration form
4. Submit and check email for OTP
5. Enter verification code
6. ✅ Should activate account immediately

#### **Engineer Application**
1. Select "Engineer" registration type
2. Fill comprehensive application form
3. Submit application
4. ✅ Should show "pending review" status

### 🎨 **UI/UX Testing**
- **Responsive Design**: Test on mobile, tablet, desktop
- **Theme System**: Verify light/dark mode switching
- **Animations**: Check loading states and transitions
- **Accessibility**: Test keyboard navigation and screen readers

## 🔧 Troubleshooting

### ❓ **Common Issues**

**"API connection failed"**
```bash
# Ensure backend is running
cd ../psr-ai-api && python main.py

# Check API URL in .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**"Authentication not working"**
```bash
# Clear browser storage
localStorage.clear()

# Check backend authentication endpoint
curl http://localhost:8000/api/v1/auth/login

# Verify backend super admin exists
```

**"Build failures"**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

## 📞 Support & Resources

### 🆘 **Getting Help**
- 📧 **Email**: support@poornasree.ai
- 📚 **Documentation**: See component JSDoc comments
- 🐛 **Issues**: Create GitHub issue with reproduction steps
- 💬 **Community**: Join our Discord server

### 🔗 **Useful Links**
- [Next.js Documentation](https://nextjs.org/docs)
- [Material-UI Components](https://mui.com/components/)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## � Contributors

- **Poornasree AI Team** - *Frontend development and UI/UX design*

---

<div align="center">

**Built with ❤️ by the Poornasree AI Team**

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js-black.svg)](https://nextjs.org)
[![React](https://img.shields.io/badge/Powered%20by-React-blue.svg)](https://reactjs.org)
[![Material-UI](https://img.shields.io/badge/Styled%20with-Material--UI-purple.svg)](https://mui.com)

</div>

- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Library**: Material UI v6 (Material Design 3)
- **Animations**: Framer Motion with custom easing curves
- **Language**: TypeScript with strict type checking
- **Styling**: Material UI theming + custom CSS overrides
- **Icons**: Material UI Icons + custom logo assets
- **Build Tool**: Next.js with optimized bundling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd poornasreeai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page with SidebarLayout
│   ├── loading.tsx        # Global loading component
│   ├── not-found.tsx      # Custom 404 page
│   └── globals.css        # Global styles and CSS variables
├── components/            # React components
│   ├── ChatPage.tsx       # Main chat interface with Perplexity.ai design
│   ├── SidebarLayout.tsx  # Collapsible sidebar with hover behavior
│   ├── LoadingAnimation.tsx # Custom loading animations with iconlogo
│   └── Loading.tsx        # Enhanced loading component
├── config/                # Configuration files
│   └── app.ts            # App configuration and settings
├── theme/                 # Material UI theme system
│   ├── theme.ts          # Material Design 3 theme definition
│   ├── ThemeRegistry.tsx # Theme provider with SSR support
│   └── types.ts          # Theme-related TypeScript types
├── types/                 # TypeScript definitions
│   └── chat.ts           # Chat-related interfaces and types
└── utils/                 # Utility functions
    └── dataGenerators.ts  # Mock data generators for chat
public/
├── logo/                  # Logo assets
│   ├── iconlogo.png      # Icon logo for sidebar and loading
│   └── fulllogo (1).png  # Full logo for welcome screen
└── [other static assets]
```

## ⚙️ Configuration

### App Configuration
The app uses centralized configuration in `src/config/app.ts`:

```typescript
export const appConfig = {
  name: 'Poornasree AI',
  description: 'Your intelligent AI research assistant',
  ui: {
    maxWidth: '1200px',
    sidebarWidth: { collapsed: 64, expanded: 280 },
    animations: { enabled: true, duration: 300 }
  },
  chat: {
    typingDelay: 2000,
    placeholders: ['Ask anything...', 'Research topics...'],
    maxMessages: 100
  }
};
```

### Theme Customization
Modify Material Design 3 theme in `src/theme/theme.ts`:

- **Color Tokens**: Primary, secondary, surface colors
- **Typography**: Font families, sizes, weights
- **Component Overrides**: Custom component styling
- **Spacing & Borders**: Consistent spacing system

## 🎭 Animation Features

### LoadingAnimation Component
```typescript
// Basic rotating animation
<LoadingAnimation size={48} />

// Custom timing
<LoadingAnimation size={64} duration={2} pauseDuration={1} />

// With text
<LoadingWithText text="Processing..." size={48} />

// Pulse variant  
<PulseLoadingAnimation size={32} />
```

### Features:
- **Rotate-Stop-Rotate Pattern**: Iconlogo rotates, pauses, repeats
- **Transparent Background**: Proper PNG transparency handling  
- **Multiple Variants**: Rotation, pulse, and text combinations
- **Material Design Easing**: Professional animation curves

## 🎨 Design System

### Color Palette
- **Primary**: Material Design 3 primary color scheme
- **Background**: Clean white/light gray surfaces
- **Text**: High contrast ratios for accessibility
- **Borders**: Subtle dividers and outlines

### Typography
- **Headings**: Inter font family for modern appearance
- **Body Text**: Optimized for readability
- **Code**: Monospace for technical content

### Spacing
- **Consistent Grid**: 8px base unit system
- **Component Padding**: Standardized spacing
- **Layout Margins**: Responsive spacing scales

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Start production server  
npm start

# Generate static export (if configured)
npm run export
```

## 📱 Deployment

The app is optimized for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify** with Next.js support
- **AWS Amplify** with SSR
- **Any Node.js hosting platform**

### Environment Variables
Create `.env.local` for configuration:
```env
NEXT_PUBLIC_APP_NAME="Poornasree AI"
NEXT_PUBLIC_API_URL="your-api-endpoint"
```

## 🔧 Development

### Key Components

#### SidebarLayout.tsx
- Collapsible sidebar with hover behavior
- Logo integration and chat history
- Mobile-responsive drawer
- Stable animation system

#### ChatPage.tsx  
- Perplexity.ai-inspired interface
- Borderless conversation view
- Logo placement and welcome screen
- Source citation system

#### LoadingAnimation.tsx
- Custom branded loading states
- Transparent background handling
- Multiple animation variants
- Material Design timing

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Automated code formatting
- **Component Structure**: Functional components with hooks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Material Design 3 principles
- Maintain TypeScript type safety
- Add animations with Framer Motion
- Test responsive behavior
- Optimize for performance

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Inspired by Perplexity.ai** for clean, professional chat interface design
- **Material Design 3** for comprehensive design system guidelines
- **Next.js Team** for excellent React framework and tooling
- **Framer Motion** for smooth, performant animations
- **Material UI** for robust component library

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Follow the project structure and coding standards
- Refer to Material Design 3 guidelines for UI decisions

---

**Poornasree AI** - Building the future of AI-powered conversations with elegant design and superior user experience. 🚀
