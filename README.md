# JSR Finance - Professional Lender Application

A comprehensive, production-ready loan management system built with Next.js 15, Prisma, and TypeScript.

## Features

### 🔐 Authentication & Authorization
- Secure JWT-based authentication
- Role-based access control (Admin, Manager, Staff)
- Protected routes with middleware
- Session management

### 👥 Customer Management
- Add and manage customers
- Document upload (Aadhar, PAN, Bank Details, Checkbook)
- Customer search and filtering
- Pagination support

### 💰 Loan Management
- Create and manage loans
- Loan status tracking (Pending, Active, Completed, Defaulted, Cancelled)
- Interest rate calculation
- EMI frequency (Daily/Monthly)
- Loan agreement and supporting documents
- Automatic total amount and daily payment calculation

### 💳 Payment Tracking
- Record payments for loans
- Payment status tracking (Due, Pending, Paid, Late)
- Payment method tracking
- Payment history

### 📊 Dashboard & Analytics
- Overview statistics
- Recent payments
- Overdue payments tracking

### 👨‍💼 User Management (Admin Only)
- Create and manage users
- Role assignment
- User activation/deactivation
- User search and pagination

### 📝 Audit Logging
- Track all important actions
- User activity logging
- IP address tracking

### 🔍 Advanced Features
- Pagination on all list views
- Search functionality
- Filtering and sorting
- Responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite (with Prisma ORM)
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jsr-finance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-in-production"
```

4. Set up the database:
```bash
npx prisma db push
```

5. Seed the admin user:
```bash
npm run seed
```

Default admin credentials:
- Username: `admin`
- Email: `admin@jsrfinance.com`
- Password: `admin123`

**⚠️ IMPORTANT: Change the default password immediately after first login!**

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
jsr-finance/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── admin/        # Admin-only endpoints
│   │   ├── customers/    # Customer endpoints
│   │   ├── loans/         # Loan endpoints
│   │   └── payments/     # Payment endpoints
│   ├── admin/            # Admin pages
│   ├── customers/       # Customer pages
│   ├── loans/           # Loan pages
│   ├── payments/        # Payment pages
│   └── login/           # Login page
├── components/          # React components
│   ├── ui/              # UI components
│   └── dashboard/       # Dashboard components
├── lib/                 # Utility libraries
│   ├── auth.ts         # Authentication utilities
│   ├── audit.ts        # Audit logging
│   ├── pagination.ts   # Pagination utilities
│   └── prisma.ts       # Prisma client
├── prisma/             # Prisma schema and migrations
└── scripts/            # Utility scripts
    └── seed-admin.ts   # Admin user seeding
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - List customers (with pagination)
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get customer details
- `GET /api/customers/[id]/loans` - Get customer loans

### Loans
- `GET /api/loans` - List loans (with pagination)
- `POST /api/loans` - Create loan
- `GET /api/loans/[id]` - Get loan details
- `PUT /api/loans/[id]/status` - Update loan status

### Payments
- `GET /api/payments` - List payments (with pagination)
- `POST /api/payments` - Create payment
- `GET /api/loans/[id]/payments` - Get loan payments

### Admin (Admin Only)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## User Roles

- **ADMIN**: Full access to all features including user management
- **MANAGER**: Access to all features except user management
- **STAFF**: Basic access to customers, loans, and payments

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- HTTP-only cookies for token storage
- Route protection middleware
- Role-based access control
- Audit logging for sensitive operations

## Production Deployment

### Environment Variables

Make sure to set these in your production environment:

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-random-secret-key"
NODE_ENV="production"
```

### Database

For production, consider using PostgreSQL or MySQL instead of SQLite:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // or "mysql"
  url      = env("DATABASE_URL")
}
```

2. Run migrations:
```bash
npx prisma migrate deploy
```

### Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Set secure cookie flags
- [ ] Use production database (PostgreSQL/MySQL)
- [ ] Enable rate limiting
- [ ] Set up proper CORS policies
- [ ] Regular security updates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues and questions, please contact the development team.
