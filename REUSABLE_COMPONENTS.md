# Reusable Components Guide

A comprehensive guide for building, structuring, and using reusable React components in the AI-powered Financial Tracker.

## Table of Contents

1. [Overview](#overview)
2. [Component Structure](#component-structure)
3. [Best Practices](#best-practices)
4. [Component Templates](#component-templates)
5. [Common Patterns](#common-patterns)
6. [Examples](#examples)

---

## Overview

Reusable components are self-contained, independent UI elements that can be used across different pages and features. They accept configuration through props and manage their own internal state when needed.

### Benefits

- **DRY Principle**: Avoid duplicating code across pages
- **Consistency**: Ensure uniform styling and behavior
- **Maintainability**: Update once, applies everywhere
- **Testability**: Isolated components are easier to test
- **Scalability**: Build complex UIs from simple building blocks

---

## Component Structure

### Directory Organization

```
src/components/
├── [feature]/
│   ├── ComponentName.tsx          # Main component
│   ├── ComponentName.types.ts     # TypeScript interfaces
│   └── index.ts                   # Named exports
├── shared/                         # Universal components
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── Card.tsx
└── layout/
    ├── Navbar.tsx
    └── Footer.tsx
```

### File Naming Conventions

- **Component files**: PascalCase (e.g., `AccountCard.tsx`, `TransactionForm.tsx`)
- **Type files**: ComponentName.types.ts (e.g., `AccountCard.types.ts`)
- **Folders**: kebab-case (e.g., `account-details`, `transaction-history`)

---

## Best Practices

### 1. **Type Safety**

Always define prop interfaces separately or inline:

```typescript
// Separate file (recommended for complex components)
// AccountCard.types.ts
export interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

// In component
interface AccountCardProps {
  title: string;
  value: number;
  currency: string;
}
```

### 2. **Props Composition**

```typescript
interface ComponentProps {
  // Required props
  id: string;
  label: string;
  
  // Optional props with defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  
  // Callbacks
  onClick?: () => void;
  onChange?: (value: string) => void;
  
  // Style props
  className?: string;
  disabled?: boolean;
}
```

### 3. **Component Composition**

Break complex components into smaller ones:

```typescript
// ❌ Bad: One massive component
const ComplexForm = () => { /* 500+ lines */ }

// ✅ Good: Composed from smaller components
const ComplexForm = () => (
  <>
    <FormHeader />
    <FormFields />
    <FormActions />
  </>
)
```

### 4. **State Management**

- Use local state (`useState`) for UI state (open/closed, focused, etc.)
- Lift state up only when needed for sibling components
- Use context for app-wide state (auth, theme, user preferences)

```typescript
const [isOpen, setIsOpen] = useState(false);        // Local UI state
const { user } = useContext(AuthContext);          // Global state
const [data, setData] = useCallback(...);          // Memoized updates
```

### 5. **Callback Functions**

Always type callbacks properly:

```typescript
interface Props {
  onSuccess?: (result: SuccessResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}
```

---

## Component Templates

### Template 1: Simple UI Component (No State)

```typescript
'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: number
  className?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {trend !== undefined && (
            <p className={`text-sm mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <Icon className="w-8 h-8 text-blue-600" />
      </div>
    </div>
  )
}
```

### Template 2: Interactive Component with State

```typescript
'use client'

import React, { useState } from 'react'

interface DeleteConfirmProps {
  title: string
  message: string
  isOpen: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DeleteConfirm: React.FC<DeleteConfirmProps> = ({
  title,
  message,
  isOpen,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Template 3: Form Component

```typescript
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'

interface FormField {
  name: string
  label: string
  type?: string
  required?: boolean
  placeholder?: string
}

interface FormProps {
  title: string
  fields: FormField[]
  onSubmit: (data: any) => Promise<void>
  submitLabel?: string
  isLoading?: boolean
}

export const DynamicForm: React.FC<FormProps> = ({
  title,
  fields,
  onSubmit,
  submitLabel = 'Submit',
  isLoading = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-600">*</span>}
          </label>
          <input
            {...register(field.name, { required: field.required })}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600"
            disabled={isLoading}
          />
          {errors[field.name] && (
            <span className="text-sm text-red-600">{field.name} is required</span>
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : submitLabel}
      </button>
    </form>
  )
}
```

---

## Common Patterns

### Pattern 1: Conditional Rendering

```typescript
// Use early returns
if (!data) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />

return <Content data={data} />
```

### Pattern 2: Memo for Performance

```typescript
import { memo } from 'react'

export const OptimizedList = memo(({ items }: Props) => {
  return items.map(item => <Item key={item.id} {...item} />)
})

OptimizedList.displayName = 'OptimizedList'
```

### Pattern 3: Custom Hooks for Logic

```typescript
// hooks/useFormValidation.ts
export function useFormValidation(initialValues: any) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = useCallback(() => {
    // validation logic
    return Object.keys(errors).length === 0
  }, [errors])

  return { values, setValues, errors, validate }
}

// Use in component
const { values, errors, validate } = useFormValidation(initial)
```

### Pattern 4: Controlled Components

```typescript
interface InputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export const ControlledInput: React.FC<InputProps> = ({
  value,
  onChange,
  onBlur,
}) => {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      className="..."
    />
  )
}
```

---

## Examples

### Example 1: Using AccountCard Component

```typescript
import { AccountCard } from '@/components/accounts'
import { useAccounts } from '@/hooks/useAccounts'

export default function AccountsPage() {
  const { accounts, isLoading, error } = useAccounts()

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={(acc) => console.log('Edit', acc)}
          onDelete={(id) => console.log('Delete', id)}
        />
      ))}
    </div>
  )
}
```

### Example 2: Creating a New Reusable Button Component

```typescript
// components/shared/Button.tsx
'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-slate-700',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    }

    const sizeStyles = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? 'Loading...' : children}
      </button>
    )
  },
)

Button.displayName = 'Button'
```

### Example 3: Exporting from Index File

```typescript
// components/accounts/index.ts
export { AccountCard } from './AccountCard'
export { AccountForm } from './AccountForm'
export { AccountList } from './AccountList'

export type { AccountCardProps } from './AccountCard.types'
export type { AccountFormProps } from './AccountForm.types'
```

---

## Component Checklist

Before marking a component as reusable, ensure it meets these criteria:

- [ ] Has clear, well-typed props interface
- [ ] No dependencies on specific page context
- [ ] Handles loading/error states gracefully
- [ ] Uses consistent styling with project theme
- [ ] Includes proper TypeScript types
- [ ] Has descriptive prop names
- [ ] Exported from an index file
- [ ] Can be used independently
- [ ] Includes sensible default values
- [ ] Documented with JSDoc comments

---

## Quick Reference

| Aspect | Guidelines |
|--------|-----------|
| **Props** | Keep interfaces focused and typed |
| **State** | Use local state for UI, context for app state |
| **Styling** | Use Tailwind classes, support dark mode |
| **Performance** | Memoize when appropriate, avoid prop drilling |
| **Naming** | PascalCase for components, UPPER_SNAKE for constants |
| **Testing** | Components should be testable in isolation |
| **Documentation** | Use JSDoc for complex components |

---

## Resources

- [React Documentation](https://react.dev)
- [TypeScript React](https://www.typescriptlang.org/docs/handbook/react.html)
- [Tailwind CSS](https://tailwindcss.com)
- Project: Next.js 15+ with TypeScript, Tailwind CSS, React Hook Form

---

**Last Updated**: May 2026
