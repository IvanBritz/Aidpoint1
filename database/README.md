# Database Setup Guide

## Prerequisites

1. **MySQL 8.0+** installed and running
2. **PHP** with MySQL extension enabled
3. **Composer** installed

## Setup Steps

### 1. Create MySQL Database

Run the following command to create the database:

```bash
mysql -u root -p < database/setup.sql
```

Or manually in MySQL:
```sql
CREATE DATABASE financial_aid_app;
```

### 2. Configure Environment

Make sure your `.env` file has the correct database configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=financial_aid_app
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

### 3. Run Migrations

```bash
cd backend
php artisan migrate
```

### 4. Seed Database

```bash
php artisan db:seed
```

## Database Schema

### Tables

1. **users** - User accounts (Project Directors, Employees, Beneficiaries)
2. **plans** - Subscription plans
3. **subscriptions** - User subscriptions to plans
4. **beneficiaries** - Beneficiary profiles
5. **personal_access_tokens** - API tokens (Sanctum)

### Relationships

- Users can have one active subscription
- Project Directors can create multiple beneficiary profiles
- Beneficiaries can be linked to user accounts
- Employees are linked to their Project Director

## Default Data

The seeder creates:
- 3 subscription plans (Basic, Professional, Enterprise)
- Test Project Director account
- Test Beneficiary account

### Test Accounts

- **Project Director**: `director@example.com`
- **Beneficiary**: `beneficiary@example.com`
- **Password**: `password` (default Laravel factory)
