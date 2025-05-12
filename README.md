# <img src="https://upload.wikimedia.org/wikipedia/commons/f/f5/Capx-logo-redux.svg" alt="logo of the Capacity Exchange" width="50" title="Capacity Exchange" style="transform:translateY(5px)"> The Capacity Exchange

The Capacity Exchange (CapX) is a project focusing on [Global Approaches to Local Skills Development](https://meta.wikimedia.org/wiki/Movement_Strategy/Initiatives/Global_Approach_for_Local_Skill_Development) within and for the Wikimedia Movement. It establishes a sociotechnical platform for peer-to-peer connection and knowledge sharing to sustainably enable community-based capacity-building.

The aim is to create a methodology and service, which will serve as the structure for initiating mutual skills development globally, regionally, and locally. An interactive, online platform, backed by a database, will enable wikimedians to publish information about themselves, their affiliates, and informal groups. They will also be able to conduct searches, access information and to connect with each other in a way that reflects the Wiki's spirit and the Wikimedia Movement Strategy.

The Capacity Exchange (CapX) is available in Toolforge at https://capx.toolforge.org

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

Before you begin, ensure you have met the following requirements:

- NodeJS >=18

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/WikiMovimentoBrasil/capx-frontend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd capx-frontend
   ```

3. Install project dependencies:

   ```bash
   yarn install
   ```

4. Rename the `.env.example` file to `.env` and comment the following lines in order to use the development server:

   ```bash
   LOGIN_STEP01_URL="https://capx-backend.toolforge.org/api/login/social/knox/mediawiki/"
   LOGIN_STEP02_URL="https://meta.wikimedia.org/wiki/Special:OAuth/authorize"
   LOGIN_STEP03_URL="https://capx-backend.toolforge.org/api/login/social/knox_user/mediawiki/"
   BASE_URL="https://capx-backend.toolforge.org"
   ```

5. Start the development server:

   ```bash
   yarn dev
   ```

You should now be able to access the project at http://localhost:3000/ in your web browser.

## Contributing

Contributions are welcome! To contribute to the Capacity Exchange, follow these steps:

1. Fork the repository
2. Create a new branch: git checkout -b feature/your-feature
3. Make your changes and commit them: git commit -m 'Add some feature'
4. Push to the branch: git push origin feature/your-feature
5. Create a pull request on GitHub against the 'dev' branch

## License

This project is licensed under the GNU AGPLv3 - see the LICENSE file for details.

## Project Structure

The project uses Next.js 14+ App Router and TypeScript for better type safety and modern routing patterns.

```
capx-frontend/
├── src/
│ ├── app/ # App Router directory
│ │ ├── (auth)/ # Authenticated routes group
│ │ │ ├── profile/ # Profile related pages
│ │ │ ├── capacity/ # Capacity related pages
│ │ │ └── report/ # Report related pages
│ │ ├── oauth/ # OAuth page
│ │ ├── api/ # API routes
│ │ └── layout.tsx # Root layout
│ ├── components/ # Shared components
│ ├── hooks/ # Custom hooks
│ ├── lib/ # Library of functions
│ ├── services/ # API services
│ └── types/ # TypeScript types
│ ├── middleware.ts # Middleware for authentication
├── public/ # Static files
└── locales/ # i18n files
```

## Authentication Flow

1. User authentication is handled through NextAuth.js
2. Session management uses server-side session tokens
3. Protected routes are grouped under the `(auth)` directory
4. API requests include authentication tokens in headers

```mermaid
sequenceDiagram
    participant User
    participant NextAuth
    participant API Routes
    participant Backend

    User->>NextAuth: Login attempt
    NextAuth->>Backend: Authenticate credentials
    Backend->>NextAuth: Return token
    NextAuth->>User: Set session cookie

    Note over User,Backend: Subsequent Requests
    User->>API Routes: Request with session
    API Routes->>Backend: Forward with token
    Backend->>API Routes: Response
    API Routes->>User: Protected data
```

## Data Flow

The data flow is managed through the following components:

```mermaid
graph TD
    A[Global State] --> B[NextAuth Session]
    A --> C[React Query Cache]

    B --> D[useSession Hook]
    C --> E[useQuery Hooks]

    F[Local State] --> G[Form State]
    F --> H[UI State]

    G --> I[useProfileForm]
    G --> J[useCapacityForm]

    H --> K[Dark Mode]
    H --> L[Language]
```

### State Management

1. React Query for server state
2. Local state managed through hooks
3. Form state handled by custom form hooks
4. Session state managed by NextAuth

### Profile Management

1. User data is fetched through `profileService`
2. State management uses custom hooks (`useProfileForm`)
3. Form updates are handled through controlled components
4. API requests are processed through Next.js API routes

### Capacity Management

1. Capacities are managed through `capacityService`
2. State handling uses `useCapacityForm` hook
3. Capacity data follows a hierarchical structure:
   - Known capacities
   - Available capacities (subset of known)
   - Wanted capacities

### API Structure and Requests flow

1. API routes are organized by feature:

   - `/api/profile` - User profile management
   - `/api/capacity` - Capacity operations
   - `/api/profile_image` - Image handling
   - `/api/login` - Login operations

2. Requests flow:

```mermaid
sequenceDiagram
    participant Component
    participant Service
    participant APIRoute
    participant Backend

    Component->>Service: Call service method
    Service->>APIRoute: Make request
    APIRoute->>Backend: Forward request
    Backend->>APIRoute: Response
    APIRoute->>Service: Processed response
    Service->>Component: Final data
```

## Key Features

- TypeScript integration for better type safety
- Modern App Router for improved routing
- Server and Client Components separation
- API route handlers with improved error handling
- Internationalization support
- Dark mode support
- Responsive design

## Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Type checking
yarn type-check

# Run Storybook
yarn storybook

# Build for production
yarn build
```

## Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
BASE_URL=http://localhost:8000
```

For more detailed information about specific features, check the documentation in the respective directories.

## Recent Bugfixes

### Resolving "Cannot read properties of undefined (reading 'length')" error in Capacity Handling

We've fixed a critical error that was occurring when accessing capacity data in both the Profile and Organization edit pages. The following improvements were made:

1. **Enhanced useCapacityDetails hook**:

   - Added comprehensive validation for capacity ID arrays
   - Improved type checking for each ID
   - Added better error handling in the getCapacityName function
   - Fixed edge cases for undefined values throughout the hook

2. **Created Utility Functions**:

   - Added `ensureArray`, `safeAccess`, `processIdArray` utilities in `safeDataAccess.ts`
   - Implemented `createSafeFunction` to wrap functions that might throw errors
   - Standardized the defensive programming approach across the codebase

3. **Improved Component Implementation**:

   - Replaced direct hook calls with effect-based implementations
   - Added proper initialization of state variables before hook usage
   - Used state caching to avoid hook errors during re-renders
   - Added comprehensive debugging tools

4. **Debugging Tools**:
   - Added `CapacityDebug` component in development mode to monitor capacity data
   - Used the existing `DebugPanel` for general data inspection
   - Added detailed tracking of hook errors and capacity values

These changes make the application more resilient to unexpected data formats and API responses, significantly improving stability when dealing with capacity data.

### Fixing "Rendered more hooks than during the previous render" error

We've resolved an issue where React was detecting inconsistent hook calls between renders, causing the error "Rendered more hooks than during the previous render". This occurred in several components and hooks, especially with the `useTerritories` hook.

The primary improvements were:

1. **Consistent Hook Execution**:

   - Ensured hooks are always called in the same order in every render
   - Moved hooks outside of conditional statements and loops
   - Used React refs to store hook results safely

2. **Safe Hook Pattern**:

   - Created pattern of using `useRef` + `useEffect` for conditional hook logic
   - Implemented try-catch blocks around hook calls to prevent render failures
   - Used state updates in useEffect rather than during render

3. **Hook Optimizations**:

   - Simplified hook implementation to reduce render cycles
   - Added proper state initialization before conditional logic
   - Implemented safe defaults when tokens or data are missing

4. **Related Components**:
   - Fixed `ProfileEditMainWrapper` and `OrganizationProfileEditMainWrapper` components
   - Enhanced `CapacityDebug` component to avoid hook-related crashes
   - Improved `useTerritories` hook to properly handle token changes

This approach ensures that React's Rules of Hooks are strictly followed, improving application stability and preventing crashes from inconsistent hook usage.
