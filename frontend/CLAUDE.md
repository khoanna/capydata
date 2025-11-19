# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **frontend** component of a **Decentralized Data Marketplace** called **CapyData** ("The Chillest Data Marketplace"). The project is a monorepo with two main components:
- `/frontend` - Next.js 16 web application (this directory)
- `/contract` - Move smart contracts for blockchain integration

## Commands

### Development
```bash
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build production bundle
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

Note: This project uses `pnpm` as the package manager.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.0 with React 19 features
- **Styling**: Tailwind CSS v4 (using new `@theme` directive in CSS)
- **TypeScript**: v5 with strict mode enabled
- **Fonts**: Space Grotesk (sans), JetBrains Mono (mono) via next/font
- **Icons**: Lucide icons loaded via CDN in layout

### Project Structure

```
/app                    # Next.js App Router pages
  page.tsx             # Homepage (client component)
  layout.tsx           # Root layout with fonts, navbar, footer
  globals.css          # Tailwind config & custom animations

/components
  /Home                # Homepage section components
    Hero.tsx           # Hero section
    Stats.tsx          # Statistics display
    TopDataset.tsx     # Featured datasets
    Flow.tsx           # User flow visualization
    WhyUs.tsx          # Features/benefits section
  Navbar.tsx           # Fixed navigation bar
  Footer.tsx           # Site footer
  FooterSlide.tsx      # Footer animation component
  CustomAnimation.tsx  # Global animation definitions
```

### Styling Architecture

**Tailwind CSS v4** is configured using the new `@theme` directive directly in `app/globals.css`. Custom theme includes:

**Color Palette** (brand colors):
- `void`: #0c0c0c (dark background)
- `panel`: #161616 (panel background)
- `yuzu`: #FF9F1C (primary accent - orange)
- `capy-brown`: #C69C6D (capybara brown)
- `capy-dark`: #8D6E4E (darker brown)
- `hydro`: #4ECDC4 (teal accent)
- `grass`: #95D600 (green accent)
- `border`: #262626 (border color)

**Custom Animations** (defined in globals.css):
- `animate-marquee`: Horizontal scrolling text
- `animate-float`: Floating effect (6s ease-in-out)
- `animate-steam`: Steam rising effect
- `animate-blink`: Blinking animation
- `animate-nose`: Subtle scale pulse

**Font Variables**:
- `font-sans`: Space Grotesk
- `font-mono`: JetBrains Mono

Use these custom colors via Tailwind classes: `bg-void`, `text-yuzu`, `border-border`, etc.

### Path Aliases

The project uses `@/*` path alias pointing to the root directory:
```typescript
import Hero from "@/components/Home/Hero";
import Navbar from "@/components/Navbar";
```

### Layout Pattern

All pages use a consistent layout defined in `app/layout.tsx`:
1. CustomAnimations (global animation setup)
2. Navbar (fixed at top)
3. Page content (children)
4. Footer
5. FooterSlide (animated footer element)

The homepage (`app/page.tsx`) is a client component that composes five main sections in order: Hero → Stats → TopDataset → Flow → WhyUs.

## Smart Contract Integration

The project includes a Move smart contract located at `/contract`. While not yet integrated into the frontend, this suggests future blockchain functionality for the data marketplace.

**Contract location**: `../contract/sources/contract.move`
**Move.toml**: Contract package configuration at `../contract/Move.toml`

## Design Patterns

### 1. Component Composition
Pages are built by composing small, focused section components. The homepage demonstrates this pattern by composing `Hero`, `Stats`, `TopDataset`, `Flow`, and `WhyUs` components in sequence.

### 2. Presentational Components
All components are **pure presentational** - they are stateless functional components with no business logic. Data is currently hardcoded directly in components, ready to be replaced with props when data fetching is implemented.

### 3. Side Effects Management
`CustomAnimation.tsx` is a specialized client component that returns `null` but manages global side effects:
- Initializes Lucide icons via `createIcons()`
- Sets up IntersectionObserver for `.reveal` elements (scroll-triggered animations)
- Implements mouse parallax tracking for `.animate-float` elements
- Properly cleans up event listeners in useEffect return

### 4. Animation Orchestration
Multi-layered animation system:
- **CSS animations**: Defined in `globals.css` using `@keyframes` (marquee, float, steam, blink, nose)
- **JavaScript animations**: Mouse tracking parallax, scroll-triggered reveals with IntersectionObserver
- **Staggered reveals**: Elements use `.reveal.delay-100`, `.delay-200`, `.delay-300` classes for sequential animation
- **Hover states**: Group hover patterns (`group` + `group-hover:`) for interactive feedback

### 5. Glass Morphism Visual Pattern
The UI heavily uses modern glass/neumorphic effects:
- `backdrop-blur-sm/md` for glassmorphic panels
- Semi-transparent backgrounds (`bg-void/90`, `bg-black/40`, `border-white/5`)
- Glow effects via box-shadow (`shadow-[0_0_20px_rgba(255,159,28,0.4)]`)
- Layered borders and translucent overlays

### 6. Utility-First Styling (Tailwind)
Components use Tailwind's utility-first approach extensively:
- Custom design tokens for colors (`bg-yuzu`, `text-hydro`)
- Responsive breakpoints (`md:`, `lg:`)
- Hover and group-hover states inline
- Custom animations via Tailwind classes

### 7. Progressive Enhancement
UI elements progressively reveal and enhance:
- Elements marked with `.reveal` class animate in when scrolled into viewport
- Threshold: `0.1`, rootMargin: `0px 0px -50px 0px`
- Staggered delays create cascading effect
- Base styles work without JavaScript; animations enhance experience

### 8. Atomic Design Structure
Component hierarchy follows atomic design principles:
- **Atoms**: Buttons, badges, icons (inline in components)
- **Molecules**: Stat cards, navigation links
- **Organisms**: `Navbar`, `Footer`, `FooterSlide`
- **Templates**: `layout.tsx`
- **Pages**: `page.tsx` compositions

## Current Architecture State

This is an **MVP/prototype focused on visual design and layout**. The following patterns are intentionally not yet implemented:

- ❌ No state management (Context, Redux, Zustand)
- ❌ No data fetching (all content hardcoded)
- ❌ No container/smart components pattern
- ❌ No error boundaries
- ❌ No custom hooks (except side effects in CustomAnimation)
- ❌ No component library dependencies
- ❌ No blockchain integration (Move contracts exist but not connected)

When implementing new features, maintain the presentational component pattern and be prepared to:
1. Extract hardcoded data into props/API calls
2. Add container components for data fetching
3. Implement Web3 integration with the Move contracts
4. Add error boundaries for production resilience

## Development Notes

- All page components use `"use client"` directive (client-side rendering)
- Lucide icons are loaded via CDN (`unpkg.com`) in the layout head, then initialized client-side via `createIcons({ icons })`
- Selection styling is customized: `selection:bg-yuzu selection:text-black`
- Smooth scrolling enabled via `scroll-smooth` class on html element
- Overflow-x is hidden on body to prevent horizontal scroll
- IntersectionObserver watches all `.reveal` elements for scroll animations
