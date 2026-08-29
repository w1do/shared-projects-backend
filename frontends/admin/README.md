<div align="center">

# Ætheria Admin

### Premium Admin Dashboard for Multi-Brand Beauty & Skincare Ecommerce

A production-ready, commercially polished admin template built with **Next.js 16**, **React 19**, **Tailwind CSS v4**, and **shadcn/ui**. Designed specifically for beauty, skincare, and cosmetics ecommerce — but flexible enough for any multi-brand retail operation.

**800+ source files · 54,000+ lines of code · 57 UI components · 16 admin modules · 30+ pages**

[Getting Started](#-getting-started) · [Features](#-features) · [Architecture](#%EF%B8%8F-architecture) · [Customization](#-customization) · [Project Structure](#-project-structure) · [Tech Stack](#-tech-stack)

</div>

---

## ✨ Why Ætheria Admin?

Most admin templates feel generic — gray tables on white backgrounds with no personality. Ætheria Admin is different. Every pixel is crafted for the beauty and luxury ecommerce vertical with a **warm terracotta-on-midnight-ink** palette, OpenRunde typography, and dense, calm operational UI that makes managing thousands of SKUs, orders, and customers a pleasure.

- 🎨 **Distinctive brand identity** — Not another generic dashboard. Warm terracotta accents, curated color tokens, and cohesive design language throughout.
- 🏗️ **Production architecture** — Service layer, query caching, Zod schemas, dual data-source (mock/API) — ready for your real backend.
- 📱 **Fully responsive** — Collapsible sidebar, mobile-optimized layouts, touch-friendly interactions across all breakpoints.
- ⚡ **Skeleton loading states** — Every page has meticulously crafted skeleton UIs for a polished loading experience.
- 🔌 **Backend-agnostic** — Ships with rich mock data; flip one env variable to connect your own REST API.
- 🧩 **57 UI components** — Extended shadcn/ui component library organized by category: inputs, data display, feedback, navigation, overlay, charts, and layout.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm**, **yarn**, **pnpm**, or **bun** package manager

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd admin

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the admin dashboard automatically.

### Environment Variables

| Variable                          | Default                 | Description                                                                  |
| --------------------------------- | ----------------------- | ---------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ADMIN_API_BASE_URL`  | `http://localhost:8080` | Your REST API base URL                                                       |
| `NEXT_PUBLIC_ADMIN_API_USERNAME`  | —                       | API basic auth username                                                      |
| `NEXT_PUBLIC_ADMIN_API_PASSWORD`  | —                       | API basic auth password                                                      |

### Available Scripts

```bash
npm run dev       # Start development server (Next.js with Turbopack)
npm run build     # Create production build
npm run start     # Run production server
npm run lint      # Run ESLint checks
npm run format    # Format code with Prettier
```

---

## 📋 Features

### Dashboard

The home page offers a dense, at-a-glance overview of your business:

- **KPI cards** — Revenue, orders, customers, and conversion rate with sparkline trend indicators
- **Revenue chart** — Interactive area chart with period selector (7d / 30d / 90d / 12m)
- **Brand performance** — Revenue breakdown by brand with visual bar indicators
- **Category sales** — Top-performing categories with gradient progress bars
- **Best sellers** — Product leaderboard with thumbnail, revenue, and units sold
- **Recent orders** — Live feed of latest orders with status badges
- **Campaign performance** — Active campaign metrics with progress tracking
- **Low stock alerts** — Inventory warnings for products nearing stockout
- **Quick actions** — One-click shortcuts to common tasks (add product, launch campaign, import inventory, etc.)

### Catalog Management

| Module          | Capabilities                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Products**    | List view with grid/table toggle, sortable columns, status filters, bulk actions, search. Full CRUD with add/edit forms featuring image upload, rich text editor, variant linking, brand/category selectors, SEO fields, and pricing |
| **Variants**    | Dedicated variant management with SKU, size, color, weight, and stock tracking per variant                                                                                                                                           |
| **Brands**      | Brand directory with logo upload, description, add/edit forms with slug auto-generation                                                                                                                                              |
| **Categories**  | Hierarchical category tree with parent/child relationships, icon selection, and reordering                                                                                                                                           |
| **Collections** | Curated product collections with cover images, add/edit forms, and product picker                                                                                                                                                    |
| **Inventory**   | Real-time stock levels with low/out-of-stock indicators, inline stock adjustment sheet, bulk XLSX import with column mapping and preview                                                                                             |

### Commerce & Operations

| Module         | Capabilities                                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Orders**     | Filterable order list with status badges (pending, processing, shipped, delivered, cancelled, refunded), date-range filtering, detail modal with order timeline, items, shipping info, and payment details |
| **Customers**  | Customer directory with lifetime value, order count, join date. Detail modal with purchase history, contact info, and engagement metrics. Bulk actions and audience engagement modal                       |
| **Campaigns**  | Campaign management with card-based grid layout, status tracking (draft, active, ended), performance metrics (impressions, clicks, conversions, ROI), launch wizard, and detail modal                      |
| **Promotions** | Coupon and discount management with spotlight hero card, table/card views, promotion type badges (percentage, fixed, BOGO, free shipping), create/edit/detail modals, and usage analytics                  |
| **Support**    | Help desk with split-panel inbox layout, ticket list with priority/status indicators, threaded conversation view with message bubbles, reply composer, and ticket statistics                               |

### Workspace & Content

| Module            | Capabilities                                                                                                                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blogs**         | Article management with rich text editor (Tiptap), cover image upload, slug generation, add/edit/list views, and status management (draft, published)                                                 |
| **Notifications** | Notification center with categorized feed, read/unread state management, and notification preferences                                                                                                 |
| **Team**          | Team member directory with role badges, invite member dialog, and role-based access indicators                                                                                                        |
| **Settings**      | Multi-tab settings with General (store info, logo, timezone), Security (password, 2FA), Payments (gateway config), Shipping (zones, rates), Taxes (tax rules by region), and Notification preferences |

### Cross-Cutting Features

- **Login screen** — Branded sign-in with showcase panel, email/password form, OTP verification, and optional demo account selector
- **Role-based access** — Unauthorized page with graceful handling
- **AI assistant** — Floating chatbot widget with suggestion chips and conversational UI
- **Global search** — Command palette for quick navigation
- **Notification bell** — Topbar notification dropdown with unread count
- **Support quick menu** — Contextual help and support links
- **PDF export** — Branded report generation with custom typography and layout
- **Breadcrumb navigation** — Contextual breadcrumbs on all sub-pages
- **Skeleton loading** — Every page has polished skeleton states (20 dedicated loading components)
- **Toast notifications** — Sonner-powered success/error/info toasts
- **Form validation** — React Hook Form + Zod schema validation throughout

---

## 🏗️ Architecture

### Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   UI Components  │ ──▶ │   React Query    │ ──▶ │  Service Layer   │
│  (Pages/Sections)│     │   (Hooks Layer)  │     │ @/lib/admin/     │
│                  │     │   Cache + State   │     │   services/      │
└──────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                           │
                                            ┌──────────────┴──────────────┐
                                            ▼                             ▼
                                   ┌─────────────────┐          ┌─────────────────┐
                                   │   Mock Data     │          │   REST API      │
                                   │ @/lib/admin/    │          │   Client        │
                                   │   mocks/        │          │   api-client.ts │
                                   └─────────────────┘          └─────────────────┘
```

**Dual data-source architecture** — The template ships with a complete mock data layer that mirrors real API responses. Toggle between `mock` and `api` mode with a single environment variable. The service layer abstracts this decision, so UI components never branch on data source.

### Key Patterns

| Pattern                 | Implementation                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Service layer**       | `@/lib/admin/services/` — Catalog, Ops, and Content domain services abstract data access                    |
| **Query management**    | `@tanstack/react-query` with centralized query keys (`@/lib/admin/query/keys.ts`) and invalidation helpers  |
| **Form handling**       | `react-hook-form` + `zod` + `@hookform/resolvers` — Schema-first validation                                 |
| **Type safety**         | Strict TypeScript with barrel exports, Zod schema inference, and centralized type definitions               |
| **Thin routes**         | `page.tsx` files are slim shells that compose page components from `@/components/pages/`                    |
| **Component isolation** | Each page module has its own `sections/`, `loading/`, `config/`, `hooks/`, and `utils/` subdirectories      |

---

## 🎨 Customization

### Rebranding Checklist

Ætheria Admin is designed for easy white-labeling. Follow these steps to rebrand:

1. **`src/lib/site-config.ts`** — Update brand name, tagline, legal name, URLs, SEO metadata, and copy strings. This single file drives all brand references across the app.

2. **`public/logo.svg`** and **`src/app/icon.svg`** — Replace with your logo assets.

3. **`src/theme.css`** — Modify color primitives to match your brand palette:

   ```css
   @theme {
     --color-terracotta-dusk: #your-accent;
     --color-terracotta-beam: #your-accent-hover;
     --color-terracotta-mist: #your-accent-surface;
     --color-midnight-ink: #your-ink-color;
     /* ... */
   }
   ```

4. **`src/lib/theme-colors.ts`** — Update the runtime hex mirrors (used by charts, PDF export, and dynamic gradients) to match your `theme.css` changes.

5. **Smoke test** — Verify the admin shell, login screen, PDF export, and chart pages render correctly with your new tokens.

### Design System

The design system is documented in [`DESIGN.md`](DESIGN.md) and enforced through CSS custom properties:

| Token Category       | Examples                                                                                |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Color primitives** | `terracotta-dusk`, `midnight-ink`, `signal-green`, `cobalt-pulse`, `ember`              |
| **Semantic colors**  | `background`, `foreground`, `brand-accent`, `success`, `destructive`, `muted`           |
| **Typography scale** | `micro` (10px) → `caption` (12px) → `body` (14px) → `heading` (24px) → `display` (60px) |
| **Shadows**          | `shadow-subtle`, `shadow-subtle-2`, `shadow-subtle-3` — Elevation via `color-mix()`     |
| **Radius**           | `radius-sm` through `radius-3xl` — Consistent corner rounding                           |
| **Spacing**          | 8px grid for all padding, margin, gap, and sizing                                       |

### Charts & Visualizations

Charts use both **Recharts** (area charts, bar charts) and **ApexCharts** (sparklines, advanced charts) with theme-aware colors pulled from `@/lib/theme-colors.ts`.

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, global CSS, toaster)
│   ├── login/                    # Login page route
│   ├── actions/                  # Server actions
│   └── admin/                    # Admin dashboard routes
│       ├── layout.tsx            # Admin shell wrapper
│       ├── page.tsx              # Dashboard (home)
│       ├── products/             # Products list, add, [id]/edit
│       ├── variants/             # Variant management
│       ├── brands/               # Brand list, add, [id]/edit
│       ├── categories/           # Category list, add, [id]/edit
│       ├── collections/          # Collection list, add, [id]/edit
│       ├── inventory/            # Inventory management
│       ├── orders/               # Order management
│       ├── customers/            # Customer directory
│       ├── campaigns/            # Campaign list, add, [id]/edit, launch
│       ├── promotions/           # Promotion management
│       ├── support/              # Help desk / tickets
│       ├── blogs/                # Article list, add, [slug]/edit
│       ├── notifications/        # Notification center
│       ├── team/                 # Team management
│       ├── settings/             # Store settings (multi-tab)
│       └── unauthorized/         # Access denied page
│
├── components/
│   ├── ui/                       # Base UI component library (57 components)
│   │   ├── inputs/               # Button, Input, Select, Checkbox, Calendar,
│   │   │                         # DatePicker, Textarea, Switch, Slider, Toggle,
│   │   │                         # RadioGroup, RichTextEditor, ImageUploader,
│   │   │                         # Autocomplete, OTP Input, Form, Label
│   │   ├── data-display/         # Card, Table, Tabs, Avatar, AvatarGroup, Badge,
│   │   │                         # DataGrid, Carousel, Accordion, Skeleton, Separator
│   │   ├── feedback/             # Alert, Progress, StatusDot, Sonner (toast)
│   │   ├── navigation/           # Sidebar, Breadcrumb, Pagination, NavigationMenu
│   │   ├── overlay/              # Dialog, Sheet, Drawer, DropdownMenu, ContextMenu,
│   │   │                         # Popover, Tooltip, HoverCard, AlertDialog,
│   │   │                         # Command, Menubar, Collapsible
│   │   ├── charts/               # AreaChart, Chart (Recharts), ApexCharts loader
│   │   └── layout/               # ScrollArea, Resizable panels
│   │
│   ├── layout/                   # App shell components
│   │   ├── AdminShell.tsx        # Main layout wrapper
│   │   ├── AdminSidebar.tsx      # Collapsible navigation sidebar
│   │   ├── AdminTopbar.tsx       # Top navigation bar with search, notifications
│   │   ├── AdminFooter.tsx       # Footer with version info
│   │   ├── NotificationsBell.tsx # Notification dropdown
│   │   ├── SupportQuickMenu.tsx  # Support/help menu
│   │   ├── floating/             # Floating action button, AI chatbot widget
│   │   └── modals/               # Global modal provider and context
│   │
│   ├── pages/                    # Page-level component modules (per route)
│   │   ├── dashboard/            # Dashboard sections, loading states
│   │   ├── products/             # Product list, form, grid, table, preview
│   │   ├── orders/               # Order columns, detail modal, status badges
│   │   ├── customers/            # Customer table, detail modal, bulk actions
│   │   ├── campaigns/            # Campaign cards, detail modal, launch wizard
│   │   ├── promotions/           # Promotion cards, spotlight, form modal
│   │   ├── support/              # Ticket inbox, thread, message bubbles
│   │   ├── settings/             # General, Security, Payments, Shipping, Taxes
│   │   ├── auth/                 # Login form, showcase panel, demo selector
│   │   └── ... (+ 9 more)       # brands, categories, collections, inventory,
│   │                             # blogs, notifications, team, variants, unauthorized
│   │
│   ├── shared/                   # Cross-page shared components
│   │   ├── data-table/           # DataTableFooter, KpiStatCard, Pagination, StatusFilters
│   │   └── layout/               # PageHeader, Breadcrumb, FormStickyHeader,
│   │                             # CapabilityNotice, StubPage, SelectableCard
│   │
│   ├── admin/                    # Admin-specific components
│   │   ├── ImportInventoryDialog # XLSX inventory import dialog
│   │   └── AdminDynamicStyles    # Dynamic style injection
│   │
│   ├── icons/                    # Custom icon components (Sparkline, etc.)
│   └── providers/                # QueryProvider (TanStack React Query)
│
├── hooks/
│   ├── use-data-table.ts         # Generic data table hook with pagination, sorting, filtering
│   ├── use-import-inventory.ts   # XLSX file import parsing and validation
│   ├── use-sticky-header.ts      # Sticky header scroll behavior
│   ├── use-apex-charts-painted.ts# ApexCharts mount detection
│   ├── use-mobile.tsx            # Responsive breakpoint detection
│   └── admin/                    # Domain-specific hooks (16 modules)
│       ├── dashboard/            # Dashboard data fetching
│       ├── products/             # Product CRUD hooks
│       ├── orders/               # Order query hooks
│       ├── customers/            # Customer query hooks
│       └── ... (+ 12 more)
│
├── lib/
│   ├── site-config.ts            # ⭐ Central brand/config surface (one file rebrand)
│   ├── theme-colors.ts           # Runtime hex mirrors for charts, PDF, gradients
│   ├── utils.ts                  # cn() utility and shared helpers
│   └── admin/
│       ├── services/             # Service layer (domain-driven)
│       │   ├── catalog/          # Products, Brands, Categories, Collections,
│       │   │                     # Inventory, Variants — CRUD services
│       │   ├── ops/              # Orders, Customers, Promotions, Dashboard,
│       │   │                     # Notifications, Support — operational services
│       │   └── content-domain/   # Articles, Campaigns, Settings, Capabilities
│       │
│       ├── data-source/          # Dual-mode data abstraction
│       │   ├── config.ts         # Data source toggle (mock vs API)
│       │   ├── api-client.ts     # REST API client with auth
│       │   ├── queries/          # Read queries (catalog, commerce, content, dashboard)
│       │   ├── mutations/        # Write mutations
│       │   ├── mappers/          # API response → UI model mappers
│       │   └── api-types/        # API response type definitions
│       │
│       ├── mocks/                # Complete mock data set
│       │   ├── products.ts       # Product mock data
│       │   ├── orders/           # Order mock data
│       │   ├── customers/        # Customer mock data
│       │   ├── brands/           # Brand mock data
│       │   ├── campaigns/        # Campaign mock data with timelines
│       │   ├── promotions/       # Promotion mock data
│       │   ├── support/          # Support ticket mock data
│       │   └── ... (+ 8 more)
│       │
│       ├── schemas/              # Zod validation schemas
│       ├── types/                # TypeScript type definitions
│       ├── query/                # React Query key factories and invalidation
│       ├── pdf/                  # PDF export utilities and shared styles
│       └── shared/               # Shared utilities (localStorage, slugify, stock status)
│
├── styles.css                    # Global styles and component classes
├── theme.css                     # Design tokens (@theme layer)
└── proxy.ts                      # API proxy utilities
```

---

## 🛠️ Tech Stack

### Core Framework

| Technology                               | Version | Purpose                                                                    |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------- |
| [Next.js](https://nextjs.org)            | 16.2    | React framework with App Router, server components, and file-based routing |
| [React](https://react.dev)               | 19.2    | UI library with concurrent features and server components support          |
| [TypeScript](https://typescriptlang.org) | 5.8     | Type safety across the entire codebase                                     |

### Styling & Design

| Technology                                    | Version  | Purpose                                                 |
| --------------------------------------------- | -------- | ------------------------------------------------------- |
| [Tailwind CSS](https://tailwindcss.com)       | 4.2      | Utility-first CSS with `@theme` design token layer      |
| [shadcn/ui](https://ui.shadcn.com)            | new-york | Extended component library built on Radix UI primitives |
| [Radix UI](https://radix-ui.com)              | Latest   | Accessible, unstyled UI primitives (17 packages)        |
| [Lucide React](https://lucide.dev)            | 0.575    | Consistent icon system                                  |
| [class-variance-authority](https://cva.style) | 0.7      | Component variant management                            |

### Data & State

| Technology                                         | Version | Purpose                                               |
| -------------------------------------------------- | ------- | ----------------------------------------------------- |
| [TanStack React Query](https://tanstack.com/query) | 5.101   | Server state management, caching, and synchronization |
| [React Hook Form](https://react-hook-form.com)     | 7.71    | Performant form state management                      |
| [Zod](https://zod.dev)                             | 3.24    | Schema declaration and runtime validation             |

### Rich Content

| Technology                            | Version | Purpose                                                  |
| ------------------------------------- | ------- | -------------------------------------------------------- |
| [Tiptap](https://tiptap.dev)          | 3.24    | Rich text editor for blog posts and product descriptions |
| [Recharts](https://recharts.org)      | 2.15    | Declarative chart library (area, bar, line charts)       |
| [ApexCharts](https://apexcharts.com)  | 5.13    | Advanced interactive charts and sparklines               |
| [SheetJS (xlsx)](https://sheetjs.com) | 0.18    | Excel/CSV file parsing for inventory import              |

### Utilities

| Technology                                                                  | Purpose                          |
| --------------------------------------------------------------------------- | -------------------------------- |
| [date-fns](https://date-fns.org)                                            | Date formatting and manipulation |
| [Sonner](https://sonner.emilkowal.ski)                                      | Toast notification system        |
| [cmdk](https://cmdk.paco.me)                                                | Command palette / global search  |
| [Embla Carousel](https://embla-carousel.com)                                | Touch-friendly carousel          |
| [react-dropzone](https://react-dropzone.js.org)                             | File upload with drag-and-drop   |
| [react-day-picker](https://react-day-picker.js.org)                         | Date picker calendar             |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Resizable split-pane layouts     |
| [Vaul](https://vaul.emilkowal.ski)                                          | Mobile-friendly drawer component |

### Developer Experience

| Technology                      | Purpose                                            |
| ------------------------------- | -------------------------------------------------- |
| [ESLint](https://eslint.org)    | Code linting with TypeScript and React hooks rules |
| [Prettier](https://prettier.io) | Opinionated code formatting                        |
| [PostCSS](https://postcss.org)  | CSS processing pipeline                            |

---

## 📐 Component Library

The template includes an extended **shadcn/ui** component library (New York style), organized by functional category:

### Inputs (21 components)

`Button` · `ButtonGroup` · `IconButton` · `Input` · `Textarea` · `Select` · `Checkbox` · `RadioGroup` · `Switch` · `Slider` · `Toggle` · `ToggleGroup` · `Calendar` · `DatePicker` · `Autocomplete` · `CountryAutocomplete` · `InputOTP` · `Form` · `Label` · `ImageUploader` · `RichTextEditor`

### Data Display (13 components)

`Card` · `Table` · `DataGrid` · `Tabs` · `Avatar` · `AvatarGroup` · `Badge` · `Carousel` · `Accordion` · `AspectRatio` · `Skeleton` · `Separator`

### Feedback (4 components)

`Alert` · `Progress` · `StatusDot` · `Sonner` (Toast)

### Navigation (4 components)

`Sidebar` · `Breadcrumb` · `Pagination` · `NavigationMenu`

### Overlay (12 components)

`Dialog` · `AlertDialog` · `Sheet` · `Drawer` · `DropdownMenu` · `ContextMenu` · `Popover` · `Tooltip` · `HoverCard` · `Command` · `Menubar` · `Collapsible`

### Charts (3 components)

`Chart` (Recharts wrapper) · `AreaChart` · `ApexCharts Loader`

### Layout (2 components)

`ScrollArea` · `Resizable` (split panels)

---

## 🔌 Connecting Your Backend

The template includes a complete **dual data-source layer** that makes backend integration straightforward:

### 1. Switch to API Mode

```env
NEXT_PUBLIC_ADMIN_API_BASE_URL=https://your-api.com
NEXT_PUBLIC_ADMIN_API_USERNAME=your-username
NEXT_PUBLIC_ADMIN_API_PASSWORD=your-password
```

### 2. API Client

The built-in API client (`src/lib/admin/data-source/api-client.ts`) provides:

- Basic authentication headers
- Base URL configuration
- Request/response type safety
- Error handling patterns

### 3. Data Mappers

Response mappers (`src/lib/admin/data-source/mappers`) transform API responses into the UI models your components expect. Update these to match your API schema.

### 4. Query & Mutation Layer

- **Queries** (`src/lib/admin/data-source/queries`) — Read operations organized by domain (catalog, commerce, content, dashboard, settings)
- **Mutations** (`src/lib/admin/data-source/mutations`) — Write operations with optimistic update patterns
- **Query Keys** (`src/lib/admin/query/keys.ts`) — Centralized cache key factory for consistent invalidation

### 5. Service Layer

The service layer (`src/lib/admin/services`) provides the public API that UI components consume. Services are organized by business domain:

- **Catalog** — Products, Brands, Categories, Collections, Inventory, Variants
- **Operations** — Orders, Customers, Promotions, Dashboard, Notifications, Support
- **Content** — Articles, Campaigns, Settings, Capabilities

---

## 📄 License

This is a premium commercial template. Please refer to the license included with your purchase for usage terms and redistribution rights.

---

<div align="center">

**Built with ❤️ by [Nacy Dev](https://github.com/hoanle0126)**

Ætheria Admin v1.2.0 · A premium template by **Nacy Dev**

</div>
