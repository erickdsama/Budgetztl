# Feature: Authentication

## Overview

User authentication for the Couple Budget Tracker app ("Our Sanctuary"). Supports email/password login and registration with optional Google and Apple OAuth. Includes session persistence ("remember device") and password recovery. This is the entry gate — all other features require authentication.

## User Stories

- As a new user, I want to create an account with email and password so that I can start using the app
- As a new user, I want to sign up with Google or Apple so that I can get started quickly without creating a new password
- As a returning user, I want to sign in with my credentials so that I can access my shared budget
- As a returning user, I want to check "remember device" so that I stay logged in
- As a user who forgot their password, I want to reset it via email so that I can regain access

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `19498aee47544d6fbac8367795335b37` — **Login & Register**: Sign-in form with email/password, Google/Apple OAuth, "Forgot?" link, "Remember device" checkbox, link to registration
- `70aff842ccce481a8e16ba2d948f86b8` — **Create Account**: Registration form with Google/Apple OAuth, Full Name, Email, Password, Confirm Password
- `7ab85b004a3e424d972eade2f709bc44` — **Create Account (variant)**: Alternative registration layout

## Data Model

Supabase Auth handles user accounts natively. We add a `profiles` table for app-specific user data.

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `profiles` | `id` | `uuid` | PK, references `auth.users(id)` ON DELETE CASCADE |
| `profiles` | `full_name` | `text` | NOT NULL, user's display name |
| `profiles` | `avatar_url` | `text` | NULL, profile picture URL |
| `profiles` | `created_at` | `timestamptz` | NOT NULL DEFAULT now() |
| `profiles` | `updated_at` | `timestamptz` | NOT NULL DEFAULT now() |

**RLS Policies (profiles)**:
- SELECT: Users can read their own profile (`auth.uid() = id`)
- INSERT: Users can insert their own profile (`auth.uid() = id`)
- UPDATE: Users can update their own profile (`auth.uid() = id`)
- SELECT: Users can read profiles of members in the same budget (via `budget_members` join)

## Server Actions

### `signUp`
- **Input**: `{ fullName: string, email: string, password: string }`
- **Output**: `{ success: boolean, error?: string }`
- **Auth**: Public
- **Flow**: Create user via Supabase Auth → insert `profiles` row → redirect to `/onboarding`
- **Errors**: Email already registered, password too weak (min 8 chars), invalid email format

### `signIn`
- **Input**: `{ email: string, password: string, rememberDevice: boolean }`
- **Output**: `{ success: boolean, error?: string }`
- **Auth**: Public
- **Flow**: Sign in via Supabase Auth → if user has no budget, redirect to `/onboarding`, else redirect to `/dashboard`
- **Errors**: Invalid credentials, account not found

### `signInWithOAuth`
- **Input**: `{ provider: "google" | "apple" }`
- **Output**: Redirects to OAuth provider
- **Auth**: Public
- **Flow**: Initiate Supabase OAuth flow → on callback, create/update profile → redirect based on budget membership

### `signOut`
- **Input**: None
- **Output**: Redirects to `/login`
- **Auth**: Required

### `resetPassword`
- **Input**: `{ email: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Public
- **Flow**: Send password reset email via Supabase Auth

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/login` | Login page | Public |
| `/register` | Registration page | Public |
| `/auth/callback` | OAuth callback handler | Public |
| `/auth/reset-password` | Password reset form | Public |

## Acceptance Criteria

- [x] Users can register with email, password, and full name
- [x] Users can sign in with email and password
- [x] Google OAuth sign-in/sign-up works end-to-end
- [x] Apple OAuth sign-in/sign-up works end-to-end
- [x] "Remember device" persists session across browser restarts
- [x] "Forgot?" link sends a password reset email
- [x] After registration, user is redirected to `/onboarding`
- [x] After login (with existing budget), user is redirected to `/dashboard`
- [ ] After login (without budget), user is redirected to `/onboarding`
- [x] Profile row is created automatically on sign-up
- [x] Form validation: email format, password minimum 8 chars, passwords match on register
- [x] Error messages display inline on form fields
- [ ] RLS policies prevent users from accessing other users' profiles (except budget members)

## Out of Scope

- Two-factor authentication (2FA)
- Email verification flow (can be added later via Supabase config)
- Social login beyond Google and Apple
- Account deletion
