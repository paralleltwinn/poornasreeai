# Copilot Instructions for Poornasree AI

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a sophisticated Next.js website project called "Poornasree AI" with Material Design 3 components and a Perplexity.ai-inspired chat interface. The project emphasizes clean, borderless design with custom branding and professional animations.

## Project Architecture
- **Framework**: Next.js 15 with App Router and Turbopack development
- **Language**: TypeScript with strict type checking for reliability
- **UI Library**: Material UI v6 implementing Material Design 3 specifications
- **Animation System**: Framer Motion with custom easing curves and branded loading states
- **File Organization**: Modern separation of concerns with logical component structure

## Current Implementation Status

### Core Components Completed
- ✅ **SidebarLayout.tsx**: Collapsible sidebar with 2-second hover delay, stable animations, iconlogo.png branding
- ✅ **ChatPage.tsx**: Perplexity.ai-style borderless interface, fulllogo.png integration, welcome screen with typing animation
- ✅ **LoadingAnimation.tsx**: Custom rotate-stop-rotate animations using iconlogo.png with transparent backgrounds
- ✅ **Loading.tsx**: Enhanced loading component with multiple animation variants
- ✅ **ThemeRegistry.tsx**: Material Design 3 theme provider with SSR support

### Design System Implementation
- ✅ **Material Design 3**: Complete theming with color tokens, typography, and component overrides
- ✅ **Custom Branding**: Logo integration system with iconlogo.png (sidebar) and fulllogo.png (main interface)
- ✅ **Borderless UI**: Clean Perplexity.ai-inspired interface without unnecessary borders or containers
- ✅ **Animation Framework**: Consistent Framer Motion animations with Material Design easing curves
- ✅ **Responsive Layout**: Mobile-first approach with adaptive sidebar and touch-friendly interactions

## Design Principles & Guidelines

### Visual Design Standards
- **Borderless Approach**: Remove unnecessary borders, containers, and visual clutter following Perplexity.ai aesthetics
- **Material Design 3**: Adhere to MD3 color system, typography scales, and interaction patterns
- **Professional Aesthetics**: Clean, minimal interface focusing on content and functionality
- **Brand Integration**: Consistent use of custom logos throughout the interface
- **Accessibility First**: High contrast ratios, semantic HTML, and ARIA attributes

### Animation & Interaction Patterns
- **Material Design Easing**: Use `[0.4, 0, 0.2, 1]` cubic-bezier for all transitions
- **Branded Loading States**: Custom iconlogo.png animations with rotate-stop-rotate patterns
- **Smooth Transitions**: 300ms duration for most UI state changes
- **Hover Behaviors**: 2-second delay for sidebar expansion, subtle hover effects for buttons
- **Progressive Enhancement**: Graceful degradation when animations are disabled

### Component Architecture
- **Functional Components**: Use React hooks and functional patterns exclusively
- **TypeScript Interfaces**: Define clear prop interfaces for all components
- **Separation of Concerns**: Keep styling, logic, and data management separate
- **Reusable Design**: Create modular components that can be composed and extended
- **Performance Optimization**: Lazy loading, memoization, and efficient re-renders

## Technical Implementation Guidelines

### Code Quality Standards
- **TypeScript Strict Mode**: Enable all strict type checking options
- **Interface Definitions**: Define comprehensive TypeScript interfaces in `/types` directory
- **Error Handling**: Implement proper error boundaries and loading states
- **Performance**: Optimize bundle size, use dynamic imports, and minimize re-renders
- **Accessibility**: Include ARIA labels, semantic HTML, and keyboard navigation

### File Organization Patterns
```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable React components
├── config/              # Application configuration and constants  
├── theme/               # Material UI theme system and providers
├── types/               # TypeScript interface definitions
├── utils/               # Pure utility functions and helpers
```

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

### Sidebar Navigation
- **Collapsible Design**: Minimized by default, expands on 2-second hover
- **Stable Animations**: No layout shifting or glitching during state transitions
- **Logo Integration**: iconlogo.png branding in collapsed state
- **Chat History**: Organized conversation management
- **Mobile Responsive**: Touch-friendly drawer for mobile devices

### Chat Interface
- **Welcome Screen**: Centered fulllogo.png with typing animation for brand name
- **Borderless Design**: Clean conversation view without unnecessary visual barriers
- **Source Citations**: Clickable source references with external links
- **Smart Suggestions**: Context-aware follow-up suggestions and quick actions
- **Loading States**: Branded iconlogo.png animations during AI processing

### Animation System
- **Custom LoadingAnimation**: Rotate-stop-rotate pattern with iconlogo.png
- **Transparent Rendering**: Proper PNG transparency without white backgrounds
- **Multiple Variants**: PulseLoadingAnimation, LoadingWithText components
- **Material Design Timing**: Consistent easing curves and duration standards

## Development Workflow

### When Adding New Features
1. **Design Consistency**: Follow Perplexity.ai-inspired borderless aesthetic
2. **Component Reusability**: Create modular components that fit the existing system
3. **TypeScript Safety**: Define interfaces before implementation
4. **Animation Integration**: Use Framer Motion with consistent timing
5. **Brand Integration**: Incorporate logos appropriately in new features

### When Modifying Existing Components
1. **Preserve Current Functionality**: Maintain existing working features
2. **Enhance Don't Replace**: Build upon current implementation rather than rebuilding
3. **Test Animation States**: Ensure smooth transitions and no visual glitches
4. **Maintain Responsiveness**: Verify mobile and desktop behavior
5. **Logo Asset Handling**: Preserve proper transparent background rendering

### Performance Considerations
- **Bundle Optimization**: Use dynamic imports for heavy components
- **Animation Performance**: Prefer transforms over layout changes
- **Image Optimization**: Ensure logos are properly optimized for web
- **Memory Management**: Clean up animation timers and event listeners
- **Loading Strategy**: Implement progressive loading for better user experience

## Brand Identity Implementation

### Logo Usage Guidelines
- **Sidebar**: Use iconlogo.png in collapsed state (28px height)
- **Welcome Screen**: Use fulllogo.png prominently (64px height) 
- **Chat Header**: Use fulllogo.png in smaller size (28px height)
- **Loading States**: Use iconlogo.png for branded animations
- **Transparency**: Always maintain PNG transparency without white backgrounds

### Color Palette
- **Primary Colors**: Material Design 3 primary color tokens
- **Background**: Clean white/light surfaces with subtle dividers
- **Text**: High contrast ratios for accessibility compliance
- **Accent**: Consistent with Material Design 3 color system

### Typography System
- **Primary Font**: Inter font family for modern, clean appearance
- **Heading Scale**: Material Design 3 typography scale
- **Code Font**: Monospace for technical content and code snippets
- **Accessibility**: Minimum 16px base size, proper line heights

This project represents a modern, professional AI chat interface that combines the best of Material Design 3 with Perplexity.ai's clean aesthetic, enhanced with custom branding and sophisticated animations.
