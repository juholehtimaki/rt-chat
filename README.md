# rt-chat

A real-time chat application built with React, Firebase, and AWS CDK. Features channel-based messaging with live updates, user authentication, and a fully automated CI/CD pipeline.

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  CloudFront  │────▶│   S3 (Static)    │     │  Firebase    │
│  + ACM Cert  │     │   React SPA      │────▶│  Auth +      │
└─────────────┘     └──────────────────┘     │  Firestore   │
       ▲                                      └─────────────┘
       │
┌──────┴──────┐
│  Route 53   │
│  DNS        │
└─────────────┘
```

The frontend is a React SPA hosted on S3 behind CloudFront. All backend functionality — authentication, database, and real-time sync — is handled by Firebase. Infrastructure is defined as code with AWS CDK.

## Tech Stack

| Layer          | Technology                                       |
|----------------|--------------------------------------------------|
| Frontend       | React 19, TypeScript, Vite, Tailwind CSS, Zustand |
| UI Components  | shadcn/ui, Lucide React                          |
| Auth           | Firebase Authentication                          |
| Database       | Cloud Firestore (real-time)                      |
| Infrastructure | AWS CDK, CloudFront, S3, Route 53, ACM           |
| Testing        | Vitest, React Testing Library, jsdom             |
| Linting        | Biome                                            |
| CI/CD          | GitHub Actions                                   |
| Runtime        | Node.js 24.15.0                                  |

## Project Structure

```
rt-chat/
├── apps/web/              # React SPA
│   └── src/
│       ├── components/
│       │   ├── auth/      # Login, registration
│       │   ├── channels/  # Channel list, creation
│       │   ├── chat/      # Messages, input
│       │   └── layout/    # App shell, navigation
│       ├── hooks/         # Custom data-fetching hooks
│       ├── stores/        # Zustand state management
│       ├── __tests__/     # Unit & component tests
│       └── ErrorBoundary.tsx
├── infra/                 # AWS CDK stacks
│   └── lib/               # CloudFront, S3, Route53, ACM
├── packages/ui/           # Shared UI component library (shadcn/ui)
├── firestore.rules        # Firestore security rules
└── .github/workflows/     # CI/CD pipeline
```

## Getting Started

### Prerequisites

- [Node.js 24.15.0](https://nodejs.org/) (see `.nvmrc`)
- [pnpm](https://pnpm.io/)
- A [Firebase project](https://console.firebase.google.com/) with Auth and Firestore enabled
- (Optional) AWS account for infrastructure deployment

### Installation

```bash
nvm use
pnpm install
```

### Environment Variables

Create `apps/web/.env` from the provided example:

```bash
cp apps/web/.env.example apps/web/.env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

For infrastructure deployment, create `infra/.env` from the provided example:

```bash
cp infra/.env.example infra/.env
```

```env
DOMAIN_NAME=
HOSTED_ZONE_NAME=
FIREBASE_PROJECT_ID=
```

### Run Locally

```bash
pnpm dev:web
```

## Development

| Command          | Description              |
|------------------|--------------------------|
| `pnpm dev:web`   | Start development server |
| `pnpm build:web` | Production build         |
| `pnpm test`      | Run all tests            |
| `pnpm test:web`  | Run web tests only       |
| `pnpm check`     | Lint with Biome          |
| `pnpm check:fix` | Auto-fix lint issues     |

## Data Model

```
users/{userId}
├── nickname: string
├── email: string
└── createdAt: timestamp

channels/{channelId}
├── name: string
├── createdBy: string
├── createdAt: timestamp
└── messages/{messageId}
    ├── text: string
    ├── userId: string
    ├── userNickname: string
    ├── createdAt: timestamp
    └── channelId: string
```

## Security

Firestore security rules enforce:

- **Owner-only user profiles** — users can only read/write their own profile
- **Authenticated channel access** — only signed-in users can read/create channels
- **Anti-impersonation** — message `userNickname` is validated against the authenticated user's profile
- **Field injection prevention** — `hasAll()` and `hasOnly()` ensure no extra fields are written
- **Immutable field protection** — fields like `createdAt` and `userId` cannot be modified after creation
- **Server timestamps** — `createdAt` must equal `request.time`, never client-provided values

## Testing

Tests use Vitest with React Testing Library and jsdom. Firebase is mocked in tests.

```bash
pnpm test        # Run all tests
pnpm test:web    # Run web tests only
```

Test files are located in `apps/web/src/__tests__/`.

## CI/CD

The GitHub Actions pipeline runs on every push and pull request:

| Trigger       | Steps                                            |
|---------------|--------------------------------------------------|
| Pull request  | Lint → Test → CDK diff                           |
| Push to `main` | Lint → Test → CDK deploy → Firebase rules deploy |

- AWS credentials are provided via OIDC federation (no long-lived secrets)
- Firebase deployment uses a service account key stored as a GitHub secret

## Infrastructure

Infrastructure is defined with AWS CDK in `infra/`:

- **S3** — Static site hosting (private bucket, OAC)
- **CloudFront** — CDN with security headers (CSP, HSTS, X-Frame-Options)
- **Route 53** — DNS management
- **ACM** — TLS certificate

Deploy manually:

```bash
cd infra && cdk deploy --profile <aws-profile>
```

Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```
