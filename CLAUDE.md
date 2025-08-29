# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AidPoint is a comprehensive financial aid management system with a Laravel backend (PHP 8.2) and Next.js frontend (TypeScript). It manages three user roles: project directors, employees, and beneficiaries, with a sophisticated subscription and privilege system.

## Development Commands

### Backend (Laravel)
```bash
cd backend
composer install                    # Install dependencies
php artisan serve                   # Start development server (port 8000)
php artisan migrate                 # Run database migrations
php artisan db:seed                 # Seed database with initial data
php artisan test                    # Run tests
php artisan config:clear            # Clear configuration cache

# Development with all services (preferred for full development)
composer dev                        # Runs server + queue + logs + frontend vite
```

### Frontend (Next.js)
```bash
cd frontend
npm install                         # Install dependencies
npm run dev                         # Start development server (port 3000)
npm run build                       # Build for production
npm run lint                        # Run ESLint
npm start                          # Start production server
```

### Backend Assets (Vite integration)
```bash
cd backend
npm install                         # Install frontend dependencies
npm run dev                         # Start Vite dev server for assets
npm run build                       # Build assets for production
```

## Architecture

### Backend Architecture
- **Framework**: Laravel 12 with Sanctum authentication
- **Database**: SQLite (database.sqlite)
- **Authentication**: Bearer token-based with role middleware
- **Key Models**: User, Position, Privilege, Plan, Subscription, Beneficiary
- **Role System**: Three primary roles with hierarchical privileges:
  - `project_director`: Full access, can manage employees/beneficiaries
  - `employee`: Limited access based on assigned privileges
  - `beneficiary`: Basic access to personal profile

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **State Management**: React Context (AuthContext) + TanStack Query
- **Styling**: TailwindCSS 4
- **Components**: Functional components in `src/components/`
- **Services**: API abstraction layer in `src/services/`
- **Authentication**: Token-based with auto-retry and logout on 401

### User Management System
The system implements a dual privilege system:
1. **Role-based**: Core roles (project_director, employee, beneficiary)
2. **Privilege-based**: Granular permissions stored in `user_privileges` pivot table
3. **Available Privileges**: aid_request, disbursement, liquidation, audit_log, beneficiary_management, report_generation

Project directors have automatic access to all privileges. Employee privileges are managed through both legacy JSON arrays and the new relational system.

### API Architecture
- **Base URL**: `http://localhost:8000/api`
- **Authentication**: `Authorization: Bearer {token}` header
- **Public Routes**: `/auth/login`, `/auth/register`
- **Protected Routes**: All under `auth:sanctum` middleware
- **Role-Restricted**: Employee management requires `role:project_director`

### Database Relationships
- Users belong to Positions and have many Privileges
- Project Directors have Subscriptions (with Plans) and create Beneficiaries/Employees  
- Employees and Beneficiaries belong to a Project Director (organization_id)
- Audit trail through created_by relationships

## Key Files to Understand

### Backend
- `routes/api.php`: All API endpoints and middleware
- `app/Models/User.php`: Core user model with privilege system (lines 67-363)
- `app/Http/Middleware/RoleMiddleware.php`: Role authorization
- `app/Http/Controllers/AuthController.php`: Authentication logic
- `composer.json`: Development scripts including `composer dev`

### Frontend  
- `src/context/AuthContext.tsx`: Global authentication state
- `src/lib/api.ts`: Axios configuration with interceptors
- `src/components/DashboardLayout.tsx`: Protected route wrapper
- `src/services/`: API service abstractions

## Testing

### Backend Tests
```bash
cd backend
php artisan test                    # Run all tests
php artisan test --filter UserTest  # Run specific test
```

### Frontend Testing
No specific test framework configured yet - relies on TypeScript checking and ESLint.

## Database Management

The project uses SQLite stored in `backend/database/database.sqlite`. Key migrations create the user privilege system and subscription models.

**Seeding**: Run `php artisan db:seed` to create:
- Default positions (Caseworker, Finance)
- System privileges with descriptions
- Test users for each role

## Environment Setup

### Backend (.env)
- Database configured for SQLite
- Sanctum configured for SPA authentication
- Default to localhost:8000 for API

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Development Workflow

1. **Backend**: Use `composer dev` to start all services simultaneously
2. **Database**: Migrate and seed on first setup
3. **Frontend**: Run `npm run dev` in separate terminal
4. **API Testing**: Use `/api/test` endpoint to verify backend connectivity

## Common Patterns

### Privilege Checking (Backend)
```php
$user->hasPrivilege('aid_request')          // Check single privilege
$user->hasAnyPrivilege(['aid_request'])     // Check any of multiple
$user->isProjectDirector()                  // Role shortcuts
```

### API Calls (Frontend)
```typescript
import api from '@/lib/api';                // Auto-includes auth headers
const response = await api.get('/employees'); // Bearer token automatic
```

### Role-Based Rendering (Frontend)
```typescript
const { isProjectDirector, isEmployee } = useAuth();
if (isProjectDirector) { /* show admin UI */ }
```

## Important Notes

- Project directors automatically have all privileges
- Employee creation respects subscription limits
- Beneficiaries can register but need director approval
- All employee management requires project director role
- The system supports both legacy JSON privileges and new relational privileges
- SQLite database file must exist before first migration