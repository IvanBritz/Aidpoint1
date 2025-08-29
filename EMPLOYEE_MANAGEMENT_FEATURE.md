# Employee Management Feature

This document describes the complete employee management feature that allows project directors to add new employees and set their privileges.

## Overview

The employee management system provides project directors with the ability to:
- Create new employee accounts
- Assign positions (Caseworker or Finance)
- Grant specific privileges to employees
- Manage employee information and access controls

## Employee Positions

The system supports the following employee positions:

### Caseworker
- **Description**: Handles aid requests and beneficiary management
- **Primary Role**: Responsible for assessing and processing aid requests from beneficiaries
- **Typical Privileges**: Aid Request, Audit Log

### Finance
- **Description**: Manages financial operations, disbursements, and liquidations  
- **Primary Role**: Handles financial transactions, disbursements, and financial reporting
- **Typical Privileges**: Disbursement, Liquidation, Audit Log

## Employee Privileges

The system defines the following core privileges:

### Aid Request (`aid_request`)
- **Description**: Can view and process aid requests from beneficiaries
- **Category**: Operations
- **Typical Users**: Caseworkers, Project Directors

### Disbursement (`disbursement`)
- **Description**: Can handle cash disbursements and financial transactions
- **Category**: Finance
- **Typical Users**: Finance staff, Project Directors

### Liquidation (`liquidation`)
- **Description**: Can process liquidations and financial settlements
- **Category**: Finance
- **Typical Users**: Finance staff, Project Directors

### Audit Log (`auditlog`)
- **Description**: Can view audit logs and system activity records
- **Category**: Administration
- **Typical Users**: All employees (for transparency and accountability)

## Backend Implementation

### Models

#### User Model (`app/Models/User.php`)
- Contains `AVAILABLE_PRIVILEGES` constant with all available privileges
- Has relationships with Position and Privilege models
- Includes privilege management methods (`hasPrivilege`, `grantPrivilege`, etc.)
- Supports both JSON-based (legacy) and relational privilege systems

#### Position Model (`app/Models/Position.php`)
- Simple model for employee positions
- Has relationship with User model

#### Privilege Model (`app/Models/Privilege.php`)
- Stores available system privileges
- Has many-to-many relationship with User model through pivot table

### Controllers

#### EmployeeController (`app/Http/Controllers/EmployeeController.php`)
- **POST /api/employees**: Create new employee
- **GET /api/employees**: List all employees (paginated)
- **GET /api/employees/{id}**: Get specific employee
- **PUT /api/employees/{id}**: Update employee
- **DELETE /api/employees/{id}**: Deactivate employee
- **GET /api/employees/privileges/list**: Get available privileges

#### PositionController (`app/Http/Controllers/PositionController.php`)
- **GET /api/employees/positions/list**: Get available positions
- **POST /api/employees/positions**: Create new position
- **PUT /api/employees/positions/{id}**: Update position
- **DELETE /api/employees/positions/{id}**: Delete position

### API Endpoints

All employee management endpoints require authentication and project director role:

```
GET    /api/employees                      - List employees
POST   /api/employees                      - Create employee
GET    /api/employees/{id}                 - Show employee
PUT    /api/employees/{id}                 - Update employee  
DELETE /api/employees/{id}                 - Delete employee
GET    /api/employees/privileges/list      - List privileges
GET    /api/employees/positions/list       - List positions
POST   /api/employees/positions            - Create position
PUT    /api/employees/positions/{id}       - Update position
DELETE /api/employees/positions/{id}       - Delete position
```

### Database Schema

#### Users Table
```sql
- position_id (foreign key to positions table)
- privileges (JSON array for legacy support)
- role (project_director, employee, beneficiary)
- status (active, inactive, suspended)
- created_by (foreign key to users table)
- organization_id (foreign key to users table)
```

#### Positions Table
```sql
- id (primary key)
- name (string)
- description (text)
```

#### Privileges Table
```sql
- id (primary key)  
- name (string, unique)
- description (text)
- category (string)
```

#### User_Privileges Pivot Table
```sql
- user_id (foreign key)
- privilege_id (foreign key)
- granted_at (timestamp)
- granted_by (foreign key to users table)
```

## Frontend Implementation

### Components

#### EmployeeList (`src/components/EmployeeList.tsx`)
- Displays paginated list of employees
- Shows employee information, positions, and privileges
- Provides actions for viewing, editing, and deactivating employees
- Includes "Add Employee" button to open the creation form

#### EmployeeForm (`src/components/EmployeeForm.tsx`)
- Modal form for creating new employees
- Three-column layout: Basic Info, Security & Contact, Privileges
- Features:
  - Form validation using react-hook-form and yup
  - Position selection with ability to add custom positions
  - Privilege selection with search functionality
  - Password visibility toggle
  - Real-time form validation
  - Success/error message handling

### Services

#### EmployeeService (`src/services/employeeService.ts`)
- API service layer for employee management
- Methods for CRUD operations on employees
- Methods for fetching positions and privileges
- TypeScript interfaces for type safety

### Pages

#### Employees Page (`src/app/dashboard/employees/page.tsx`)
- Protected route (requires project director role)
- Integrates EmployeeList component within DashboardLayout
- Handles authentication and authorization checks

## Usage Flow

1. **Access**: Project director logs in and navigates to Employee Management
2. **View Employees**: Sees list of existing employees with their positions and privileges
3. **Add Employee**: Clicks "Add Employee" button to open creation form
4. **Fill Form**: 
   - Enters basic information (name, email, username)
   - Selects or creates a position
   - Sets password and optional contact information
   - Selects appropriate privileges based on position
5. **Submit**: Form validates and creates employee account
6. **Management**: Can later view, edit, or deactivate employees as needed

## Security Features

- **Authentication Required**: All endpoints require valid authentication token
- **Role-Based Access**: Only project directors can manage employees
- **Organization Isolation**: Directors can only manage their own employees
- **Subscription Limits**: Employee creation respects subscription plan limits
- **Input Validation**: Comprehensive validation on both frontend and backend
- **Secure Passwords**: Password hashing and confirmation requirements

## Example Employee Creation

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "username": "john.doe",
  "password": "securepassword123",
  "password_confirmation": "securepassword123",
  "position_id": 1,
  "phone": "+1-555-123-4567",
  "address": "123 Main St, City, State",
  "privileges": ["aid_request", "auditlog"]
}
```

## Testing the Feature

1. **Start Backend**: `cd backend && php artisan serve`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Login**: Use project director credentials
4. **Navigate**: Go to `/dashboard/employees`
5. **Create Employee**: Click "Add Employee" and test the form
6. **Verify**: Check that employee appears in list with correct privileges

## Database Seeding

The system includes seeders for initial data:

- **PositionsTableSeeder**: Creates default positions (Caseworker, Finance, etc.)
- **PrivilegeSeeder**: Creates all system privileges with descriptions
- **DatabaseSeeder**: Runs all seeders and creates test users

Run seeders with:
```bash
php artisan db:seed
```

## Future Enhancements

- Employee profile editing
- Bulk privilege assignment
- Role-based privilege templates
- Employee activity tracking
- Advanced permission management
- Employee import/export functionality
