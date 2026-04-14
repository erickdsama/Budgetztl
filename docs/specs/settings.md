# Feature: Settings

## Overview

User profile management, budget sharing configuration, appearance preferences, and account security. The settings screen is the control panel for personalizing the app experience and managing the shared budget membership. It also surfaces the invite code for partner onboarding.

## User Stories

- As a user, I want to edit my profile (name, avatar) so that my partner sees my real identity
- As a user, I want to see and share the budget invite code so that my partner can join
- As a user, I want to see who is in my shared budget so that I know my partner is connected
- As a user, I want to toggle dark mode so that I can use the app comfortably at night
- As a user, I want to change my password so that my account stays secure
- As a user, I want to sign out so that I can secure my session

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `78119b9b0da24c65be5145905e587fe6` — **Settings**: Profile section, budget settings (name, currency, shared members), preferences (dark mode, notifications), account (security, change password), support (help, privacy), sign out

## UI Components

### Profile Section
- Profile picture with edit/upload option
- Display name (e.g. "Julian Walters")
- Email (read-only, e.g. "julian.walters@harmony.app")

### Budget Settings
- **Budget Name**: Editable text (e.g. "Our New Home Fund")
- **Currency**: Display only (USD) — set during creation
- **Shared Members**: List showing:
  - "You" with "Owner" badge
  - Partner name (e.g. "Chloe Watkins")
  - "Invite Partner" button (shows invite code)

### Preferences
- **Dark Mode**: Toggle switch — "Switch between light and dark themes"
- **Notifications**: Link — "Manage budget alerts and updates"

### Account
- **Security**: Link to security settings
- **Change Password**: Link to password change form

### Support
- **Help Center**: External link
- **Privacy Policy**: External link

### Sign Out
- "Sign Out" button (destructive action)

### Footer
- App version (e.g. "Version 2.4.1")

## Data Model

No new tables. This feature reads/writes to existing tables:
- `profiles` — name, avatar_url
- `budgets` — name, invite_code
- `budget_members` — member list with roles

New column on profiles for preference storage:

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `profiles` | `preferences` | `jsonb` | DEFAULT '{}', stores dark_mode, notifications settings |

## Server Actions

### `updateProfile`
- **Input**: `{ fullName?: string, avatarUrl?: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required
- **Errors**: Name empty, invalid URL

### `updateBudgetName`
- **Input**: `{ budgetId: string, name: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (budget owner only)

### `getInviteCode`
- **Input**: `{ budgetId: string }`
- **Output**: `{ inviteCode: string }`
- **Auth**: Required (budget owner only)

### `regenerateInviteCode`
- **Input**: `{ budgetId: string }`
- **Output**: `{ inviteCode: string }`
- **Auth**: Required (budget owner only)
- **Flow**: Generate new 6-digit code → invalidate old code → return new code

### `removeMember`
- **Input**: `{ budgetId: string, userId: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (budget owner only, cannot remove self)

### `updatePreferences`
- **Input**: `{ darkMode?: boolean, notifications?: boolean }`
- **Output**: `{ success: boolean }`
- **Auth**: Required

### `changePassword`
- **Input**: `{ currentPassword: string, newPassword: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required
- **Errors**: Current password incorrect, new password too weak

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/settings` | Main settings page | Required |
| `/settings/security` | Security settings | Required |
| `/settings/password` | Change password form | Required |

## Acceptance Criteria

- [x] Profile section shows name, email, and avatar
- [x] Users can edit their display name
- [ ] Users can upload/change their profile picture
- [x] Email is displayed but not editable
- [x] Budget name is editable by the owner
- [x] Currency displays but is not editable (set at creation)
- [x] Member list shows all budget members with roles (Owner/Member)
- [x] Budget owner sees "Invite Partner" button showing the 6-digit code
- [x] Owner can regenerate the invite code
- [x] Owner can remove a member from the budget
- [x] Dark mode toggle switches the app theme
- [x] Dark mode preference persists across sessions
- [x] "Change Password" navigates to password change form
- [x] Password change requires current password and validates new password strength
- [x] "Sign Out" button signs out and redirects to `/login`
- [x] App version number displays in the footer
- [x] Non-owner members cannot edit budget name, invite code, or remove members

## Out of Scope

- Profile picture cropping/editing
- Notification preferences (push, email, in-app granularity)
- Account deletion
- Two-factor authentication setup
- Theme customization beyond dark/light
- Language/locale settings
