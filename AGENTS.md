# AI Agent Instructions

## Project Overview

Real-time chat application built with React, Firebase, and AWS CDK.

## Structure

```
apps/web/       # React SPA with Firebase Auth & Firestore
infra/          # AWS CDK (CloudFront, S3, Route53)
packages/ui/    # Shared UI components (shadcn/ui)
```

## Commands

```bash
pnpm dev:web        # Start dev server
pnpm build:web      # Build for production
pnpm test           # Run all tests
pnpm test:web       # Run web tests only
pnpm check          # Lint with Biome
pnpm check:fix      # Auto-fix lint issues
```

## Key Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend**: Firebase Auth, Firestore
- **Infra**: AWS CDK, CloudFront, S3
- **Testing**: Vitest, React Testing Library
- **Linting**: Biome
- **Node**: 24.15.0 (pinned in `.nvmrc`)

## Data Model (Firestore)

- **`users/{userId}`**: `nickname` (string), `email` (string), `createdAt` (timestamp)
- **`channels/{channelId}`**: `name` (string), `createdBy` (string), `createdAt` (timestamp)
- **`channels/{channelId}/messages/{messageId}`**: `text` (string), `userId` (string), `userNickname` (string), `createdAt` (timestamp), `channelId` (string)

## Code Style

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use Zustand for global state (`stores/`)
- Use custom hooks for data fetching (`hooks/`)
- Follow Biome formatting (tabs, double quotes)

## Firebase/Firestore

- Security rules are in `firestore.rules`
- Always validate data on both client AND in security rules
- Use `serverTimestamp()` for timestamps, never client-side dates
- Use `hasAll()` AND `hasOnly()` in rules to prevent field injection

## Testing

- Place tests in `src/__tests__/` directory
- Use `@testing-library/react` for component tests
- Mock Firebase in tests

## Infrastructure

- CDK stacks are in `infra/lib/`
- Deploy with `cd infra && cdk deploy --profile <profile>`
- Firebase rules deployed separately via `firebase deploy --only firestore:rules`
- Security headers (CSP, HSTS, X-Frame-Options) configured in `website-stack.ts`

## CI/CD

- **Pull requests**: Runs QA (lint, test, CDK diff)
- **Push to main**: Runs QA, then deploys (CDK deploy + Firebase rules)
- AWS credentials via OIDC, Firebase via service account secret

## Important Patterns

1. **Auth state**: Managed in `authStore.ts`, initializes on app load
2. **Real-time data**: Use `onSnapshot` with error callbacks
3. **Error handling**: Global `ErrorBoundary` wraps the app in `main.tsx`
4. **UI components**: Import from `@workspace/ui/components/*`

## Rules

- Don't commit `.env` files
- Don't use `any` type
- Don't bypass Firestore security rules
- Don't use `npm` (use `pnpm`)
- Don't use `dangerouslySetInnerHTML`
- Don't use hacks or workarounds — fix the root cause
