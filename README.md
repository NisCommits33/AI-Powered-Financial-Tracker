# 💰 AI-Powered Financial Tracker

A modern, feature-rich personal finance management application built with Next.js, React, TypeScript, and Supabase. Track accounts, transactions, budgets, and categories with an intuitive UI and powerful insights.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue?style=flat-square&logo=tailwindcss)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Available Scripts](#available-scripts)
- [Usage Guide](#usage-guide)
- [Authentication](#authentication)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - Email/password authentication with Supabase
- 💳 **Account Management** - Track multiple accounts (checking, savings, credit, investment, loans)
- 📊 **Transaction Tracking** - Log income and expenses with detailed categorization
- 💡 **Budget Planning** - Set and monitor budgets across categories
- 🏷️ **Category Organization** - Create custom spending categories
- 📈 **Financial Insights** - Visual dashboards with charts and trends
- 🌙 **Dark Mode** - Seamless dark/light theme support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

### Advanced Features
- Multi-account balance tracking
- Budget vs. actual spending analysis
- Transaction filtering and search
- Currency support
- Secure session management
- Demo mode for testing

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React
- **Validation**: Zod

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Supabase REST API

### Development
- **Linting**: ESLint
- **Package Manager**: npm
- **Build Tool**: Next.js compiler

---

## 📁 Project Structure

```
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── (auth)/              # Authentication routes (login, register)
│   │   ├── (dashboard)/         # Protected dashboard routes
│   │   │   ├── accounts/        # Accounts management page
│   │   │   ├── budgets/         # Budgets page
│   │   │   ├── categories/      # Categories page
│   │   │   ├── dashboard/       # Main dashboard
│   │   │   └── transactions/    # Transactions page
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── middleware.ts            # Next.js middleware for auth protection
│   ├── utils/
│   │   └── supabase/            # Supabase client setup
│   │       ├── client.ts        # Browser client
│   │       ├── server.ts        # Server client
│   │       ├── middleware.ts    # Session management
│   │       └── seeder.ts        # Data seeding
│   ├── data/
│   │   └── seedData.ts          # Sample data for demo mode
│   └── types/                   # TypeScript type definitions
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind CSS config
├── next.config.ts               # Next.js config
├── eslint.config.mjs            # ESLint config
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-powered\ Financial\ Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see [Environment Setup](#environment-setup))
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Use demo mode or create an account

---

## 🔧 Environment Setup

### Create `.env.local` file in project root

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For email confirmation
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Get Supabase Credentials

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **API**
4. Copy `Project URL` and `anon public key`
5. Paste into `.env.local`

### Database Schema Setup

The Supabase schema is defined in [supabase_schema.sql](supabase_schema.sql). Run this SQL in your Supabase SQL editor to set up tables:

```sql
-- See supabase_schema.sql for complete schema
```

---

## 📝 Available Scripts

```bash
# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint checks
npm run lint

# Take screenshots (for testing)
node take-screenshots.js
```

---

## 💡 Usage Guide

### 1. **Authentication**

- **Register**: Create account with email and password
- **Login**: Sign in with credentials
- **Demo Mode**: Browse without authentication (local storage only)
- **Logout**: Sign out from profile menu

### 2. **Dashboard**

- View account summary and balance overview
- See recent transactions
- Monitor budget status
- Quick access to all features

### 3. **Accounts**

- Add new accounts (checking, savings, credit, investment, loan)
- Edit account details
- Delete accounts
- View account balances
- Track account history

### 4. **Transactions**

- Record income and expenses
- Categorize transactions
- Filter by date range, category, or account
- Edit or delete transactions
- View transaction details

### 5. **Budgets**

- Set spending limits per category
- Monitor budget progress
- Compare budget vs. actual spending
- Receive alerts when approaching limits

### 6. **Categories**

- Create custom categories
- Organize spending
- Set category-specific rules
- Assign colors and icons

---

## 🔐 Authentication

The app uses Supabase Authentication with:

- **Email/Password** - Standard email/password flow
- **Session Management** - Secure cookie-based sessions
- **Protected Routes** - Middleware ensures auth before dashboard access
- **Auto-refresh** - Sessions automatically refresh on request

### Auth Flow

```
User → Login Page → Supabase Auth → Session Token → Protected Routes
```

See [AUTHENTICATION.md](docs/AUTHENTICATION.md) for detailed flow diagrams.

---

## 📡 API Documentation

### Supabase Tables

#### `users`
```typescript
{
  id: string              // UUID
  email: string
  password: hashed
  created_at: timestamp
}
```

#### `profiles`
```typescript
{
  id: string
  full_name: string
  currency: string        // USD, EUR, GBP, etc.
  created_at: timestamp
  updated_at: timestamp
}
```

#### `accounts`
```typescript
{
  id: number
  user_id: string
  name: string
  account_type: enum      // checking, savings, credit, investment, loan
  balance: decimal
  currency: string
  created_at: timestamp
}
```

#### `transactions`
```typescript
{
  id: number
  user_id: string
  account_id: number
  category_id: number
  amount: decimal
  type: enum              // income, expense
  description: string
  date: date
  created_at: timestamp
}
```

#### `budgets`
```typescript
{
  id: number
  user_id: string
  category_id: number
  amount: decimal
  period: enum            // monthly, quarterly, yearly
  created_at: timestamp
}
```

#### `categories`
```typescript
{
  id: number
  user_id: string
  name: string
  icon: string
  color: string
  created_at: timestamp
}
```

---

## 🔄 Development Workflow

### Running Development Server

```bash
npm run dev
```

- Hot reload on file changes
- Error overlays in browser
- Type checking with TypeScript

### Building for Production

```bash
npm run build
npm start
```

### Code Quality

```bash
npm run lint
```

---

## 📚 Key Documentation

- [REUSABLE_COMPONENTS.md](REUSABLE_COMPONENTS.md) - Component guide and templates
- [supabase_schema.sql](supabase_schema.sql) - Database schema
- [Career_Development_Learning_Portfolio.md](Career_Development_Learning_Portfolio.md) - Learning resources

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Commit changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

3. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

4. **Open Pull Request**

### Code Standards

- Follow TypeScript strict mode
- Use functional components with hooks
- Write meaningful commit messages
- Keep components focused and reusable
- Add types for all props and returns

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` and restart dev server

### Issue: Supabase connection fails
**Solution**: Check environment variables in `.env.local`

### Issue: Authentication not working
**Solution**: Verify Supabase project is active and credentials are correct

### Issue: Styles not appearing
**Solution**: Ensure Tailwind CSS is installed and dev server is running

---

## 📊 Performance Tips

- Images are optimized via Next.js Image component
- Code splitting automatic with App Router
- Database queries use indexes for speed
- CSS is minimized in production

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy with one click

### Other Platforms

- **Netlify**: Requires API routes serverless functions
- **Self-hosted**: Deploy with Docker (see `archive/backend/Dockerfile`)

---

## 📞 Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Open an issue in repository
4. Contact development team

---

## 📄 License

This project is private and confidential.

---

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com)

---

**Version**: 0.1.0  
**Last Updated**: May 2026  
**Made with ❤️ for better financial management**
