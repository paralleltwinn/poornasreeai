# Poornasree AI

A sophisticated AI-powered chat interface built with Next.js 15 and Material Design 3, inspired by Perplexity.ai's clean and intuitive design.

## ✨ Features

- 🎨 **Material Design 3** - Modern, accessible UI components with custom theme system
- 💬 **Perplexity.ai-inspired Interface** - Clean, borderless chat experience with professional aesthetics
- 🔄 **Smart Sidebar Layout** - Collapsible navigation with 2-second hover delay and smooth animations
- 🖼️ **Custom Branding** - Integrated logo system with iconlogo.png and fulllogo.png
- 📱 **Responsive Design** - Optimized for mobile and desktop with adaptive layouts
- ⚡ **Next.js 15** - Latest React framework with App Router and Turbopack development
- 🎭 **Rich Animations** - Framer Motion for smooth transitions and loading states
- 🎬 **Interactive Welcome Screen** - Beautiful landing with typing animation and logo integration
- 🔍 **Source Citations** - Research-style source linking with clickable references
- 💡 **Smart Suggestions** - Dynamic conversation suggestions and quick action buttons
- 🎯 **TypeScript** - Full type safety throughout the application
- � **Custom Loading Animations** - Branded loading states with rotate-stop-rotate iconlogo animation
- � **Chat History Management** - Organized conversation tracking
- 🌟 **Professional UI/UX** - Borderless design matching modern AI interfaces

## 🎨 UI/UX Highlights

### Sidebar Navigation
- **Collapsible Design**: Minimized by default, expands on 2-second hover
- **Logo Integration**: Custom iconlogo.png branding in collapsed state
- **Smooth Animations**: Stable layout transitions without glitching
- **Chat History**: Organized list of previous conversations
- **Mobile Support**: Responsive drawer for touch devices

### Welcome Experience
- **Centered Logo**: fulllogo.png prominently displayed above welcome text
- **Typing Animation**: Welcome text appears with typewriter effect and cursor
- **Quick Actions**: Interactive buttons for common AI tasks
- **Professional Layout**: Vertical logo-text arrangement for brand hierarchy

### Chat Interface
- **Borderless Design**: Clean Perplexity.ai-style conversation view
- **Rich Message Display**: Enhanced typography and spacing
- **Source Integration**: Clickable source chips with external links
- **Custom Loading States**: Branded iconlogo.png animations during AI responses
- **Suggestion System**: Context-aware follow-up suggestions

### Animation System
- **LoadingAnimation Component**: Custom rotate-stop-rotate pattern using iconlogo.png
- **Transparent Backgrounds**: Proper PNG transparency handling
- **Multiple Variants**: Pulse, with-text, and rotation animation options
- **Material Design Easing**: Smooth, professional transitions

## 🛠️ Tech Stack

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
