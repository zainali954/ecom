# Engineering Rules

These rules are mandatory.

Failure to follow these rules is considered a failed implementation.

---

# Architecture

Use:

- Feature Based Architecture

Never:

- Dump everything in components folder
- Create giant files
- Create God Components

---

# UI Rules

Default UI Library:

- Shadcn UI

Priority:

1. Shadcn Component
2. Existing Project Component
3. New Custom Component

If creating a new component:

STOP

Explain why existing components cannot be used.

Request approval first.

---

# Design Rules

Design Inspiration:

- Stripe
- Vercel
- Linear
- Notion

Style:

- Modern
- Clean
- Minimal
- Premium

Requirements:

- Consistent spacing
- Responsive
- Accessible

---

# Component Rules

Maximum Responsibilities:

One component = One responsibility

Avoid:

- Massive components
- Repeated code

Extract reusable components.

---

# Data Fetching

Prefer:

Server Components

Use Client Components only when required.

---

# Authentication

Use:

NextAuth

Authentication Methods:

- Email + Password

Required Features:

- Registration
- Login
- Logout
- Forgot Password
- Reset Password
- Email Verification

---

# Email System

Use:

Resend

Required Templates:

- Welcome Email
- Verify Email
- Reset Password
- Order Confirmation
- Order Status Updated

Templates must:

- Be reusable
- Be responsive
- Support dark mode

---

# Validation

Use:

Zod

Never trust client-side validation.

Validate:

- Forms
- APIs
- Server Actions

---

# Database Rules

Use:

MongoDB + Mongoose

Every model must include:

- createdAt
- updatedAt

---

# Error Handling

Must Have:

- Error Boundaries
- Loading States
- Empty States
- Toast Notifications

---

# Security

Required:

- Password Hashing
- Rate Limiting
- CSRF Protection
- Input Validation
- XSS Prevention

Never expose:

- Secrets
- Tokens
- Internal IDs

---

# Forms

Use:

React Hook Form

Validation:

Zod

---

# API Rules

Response Structure:

{
success: boolean,
message: string,
data?: any,
error?: any
}

---

# Code Quality

Required:

- TypeScript Strict Mode
- ESLint
- Prettier

No:

- any types
- console logs
- dead code

---

# Performance

Must:

- Optimize Images
- Lazy Load Heavy Components
- Paginate Listings
- Cache Server Requests

---

# Folder Structure

src/

app/

features/

shared/

components/

lib/

services/

emails/

schemas/

models/

types/

hooks/

constants/
