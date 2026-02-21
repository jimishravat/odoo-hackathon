# FleetFlow - Modular Fleet & Logistics Management System

<div align="center">

**A comprehensive, role-based fleet management solution**

[Features](#features) • [Getting Started](#getting-started) • [Project Structure](#project-structure) • [Contributing](#contributing)

</div>

---

## 📋 Overview

FleetFlow is a modular fleet and logistics management system designed to streamline vehicle management, driver operations, trip planning, fuel tracking, maintenance scheduling, and expense management. Built with modern web technologies and designed for scalability, it provides a robust platform for fleet managers, dispatchers, drivers, safety officers, and financial analysts to collaborate efficiently.

The system integrates vehicle tracking, driver management, trip logistics, maintenance scheduling, fuel consumption monitoring, and comprehensive financial reporting in a single, unified interface.

---

## ✨ Features

### Core Module Features

#### 🚗 **Vehicle Management**
- Complete vehicle inventory tracking
- Vehicle status monitoring (Active, Maintenance, Retired, Inactive)
- Support for multiple fuel types (Diesel, Petrol, CNG, Electric)
- Vehicle documentation and specifications
- Real-time vehicle availability status

#### 👨‍💼 **Driver Management**
- Driver profile management with license details
- License category tracking (Truck, Van, Bike)
- Safety score monitoring
- Trip history and completion statistics
- Driver status management (On Duty, Off Duty, Suspended)
- License expiry tracking and alerts

#### 🛣️ **Trip Management**
- Complete trip lifecycle management (Scheduled, In Progress, Completed)
- Route optimization and distance tracking
- Driver and vehicle assignment
- Trip expense logging and tracking
- Cargo/shipment management
- Trip cost calculation and analysis

#### ⛽ **Fuel Management**
- Fuel log entry and tracking
- Fuel cost analysis
- Consumption per trip monitoring
- Multi-fuel type support
- Expense synchronization with trip data
- Fuel efficiency reports

#### 🔧 **Maintenance Management**
- Scheduled and completed maintenance tracking
- Service type categorization
- Maintenance cost monitoring
- Service history per vehicle
- Automated vehicle status updates during maintenance
- Preventive maintenance scheduling

#### 💰 **Expense Management**
- Multi-category expense tracking (Fuel, Maintenance, Other)
- Trip-linked expense logging
- Expense categorization and filtering
- Cost analytics and reporting
- Budget tracking capabilities

#### 📊 **Reporting & Analytics**
- Dashboard with KPIs and metrics
- Financial reports
- Fleet performance analytics
- Trip statistics and insights
- Fuel consumption trends
- Maintenance cost analysis
- Expense breakdowns

#### 🔐 **Role-Based Access Control (RBAC)**
- **Fleet Manager**: Full system access, user management, strategic decisions
- **Dispatcher**: Trip assignment, vehicle allocation, schedule management
- **Driver**: Personal trips, cargo tracking, fuel logs
- **Safety Officer**: Safety monitoring, driver performance, alerts
- **Financial Analyst**: Financial reports, expense analysis, cost optimization

#### 🔔 **Alerts & Notifications**
- License expiry alerts
- Maintenance due notifications
- Trip delay alerts
- Safety incidents reporting
- System notifications via snackbar

#### ⚙️ **Settings Management**
- User profile settings
- Preferences configuration
- System settings administration

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4** - UI library
- **React Router DOM 6.20.1** - Client-side routing
- **Material-UI (MUI) 5.14.13** - Component library
- **Axios 1.6.5** - HTTP client
- **Recharts 2.10.3** - Data visualization
- **date-fns 2.30.0** - Date manipulation
- **React Scripts 5.0.1** - Create React App scripts

### Backend
- **Node.js** - Runtime environment
- **Express 4.18.2** - Web framework
- **MySQL 2** - Database driver
- **JWT 9.0.0** - Authentication
- **bcryptjs 2.4.3** - Password hashing
- **Helmet 7.0.0** - Security middleware
- **Express Rate Limit 6.10.0** - Rate limiting
- **Express Validator 7.0.1** - Input validation
- **Nodemon 2.0.22** - Development hot reload

### Database
- **MySQL/MariaDB** - Relational database
- Structured schema with 11+ tables
- Triggers for automated workflows

---

## 📁 Project Structure

```
odoo-hackathon/
├── client/                          # React Frontend
│   ├── public/                      # Static assets
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js                  # Main app component
│   │   ├── App.css                 # App styles
│   │   ├── index.js                # Entry point
│   │   ├── index.css               # Global styles
│   │   ├── components/             # Reusable components
│   │   ├── constants/              # App constants
│   │   ├── contexts/               # React contexts
│   │   │   ├── AuthContext.js      # Authentication state
│   │   │   └── AppContext.js       # App-wide state
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuth.js          # Auth hook
│   │   │   ├── useApp.js           # App state hook
│   │   │   ├── useAsyncData.js     # Async data hook
│   │   │   └── usePermission.js    # Permission hook
│   │   ├── pages/                  # Page components
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   ├── Drivers.js          # Drivers management
│   │   │   ├── Vehicles.js         # Vehicles management
│   │   │   ├── Trips.js            # Trips management
│   │   │   ├── Fuel.js             # Fuel tracking
│   │   │   ├── Maintenance.js      # Maintenance logs
│   │   │   ├── Expenses.js         # Expense management
│   │   │   ├── Reports.js          # Analytics & reports
│   │   │   ├── Profile.js          # User profile
│   │   │   ├── Settings.js         # System settings
│   │   │   ├── Login.js            # Login page
│   │   │   └── Register.js         # Registration page
│   │   ├── routes/                 # Routing configuration
│   │   │   └── AppRoutes.js        # Route definitions
│   │   ├── services/               # API & data services
│   │   │   ├── api.js              # Mock API endpoints
│   │   ├── styles/                 # Theme configuration
│   │   │   └── theme.js            # MUI theme
│   │   ├── utils/                  # Utility functions
│   │   │   ├── helpers.js          # General helpers
│   │   │   ├── storageManager.js   # LocalStorage management
│   │   │   ├── tripCostCalculator.js
│   │   │   ├── fuelExpenseSync.js
│   │   │   ├── reportExporter.js
│   │   │   └── validationUtils.js
│   │   ├── data/                   # Initial data
│   │   │   └── initialData.json    # Seed data
│   │   └── setupTests.js
│   └── package.json                # Frontend dependencies
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.js                # Server entry point
│   │   ├── db.js                   # Database connection
│   │   ├── controllers/            # Controllers
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication
│   │   └── routes/                 # API routes
│   │       ├── index.js            # Routes entry
│   │       ├── auth.js             # Authentication routes
│   │       ├── users.js            # User routes
│   │       ├── drivers.js          # Driver routes
│   │       ├── vehicles.js         # Vehicle routes
│   │       ├── trips.js            # Trip routes
│   │       ├── fuel_logs.js        # Fuel routes
│   │       ├── maintenance_logs.js # Maintenance routes
│   │       ├── expenses.js         # Expense routes
│   │       ├── cargo.js            # Cargo routes
│   │       └── reports.js          # Report routes
│   └── package.json                # Backend dependencies
│
├── Database/
│   └── fleetflow.sql               # MySQL database schema
│
└── README.md                        # This file
```

---

## 🗄️ Database Schema

### Core Tables

#### `users`
- User authentication and profile management
- Stores user credentials, roles, and contact information

#### `drivers`
- Driver information (name, license, contact)
- License details (category, expiry date)
- Safety score and trip statistics
- Driver status tracking

#### `vehicles`
- Vehicle inventory
- Make, model, registration details
- Fuel type and capacity
- Vehicle status and maintenance history reference

#### `trips`
- Trip planning and execution
- Start/end locations, distance
- Driver and vehicle assignment
- Trip status and timestamps

#### `cargo`
- Shipment and cargo management
- Weight tracking
- Driver and trip assignment
- Cargo status management

#### `fuel_logs`
- Fuel entry tracking per vehicle
- Liters and cost recording
- Trip linkage
- Fuel efficiency calculation

#### `maintenance_logs`
- Maintenance history per vehicle
- Service type and description
- Cost and scheduled/completed status
- Triggers automatic vehicle status update

#### `expenses`
- Expense categorization (Fuel, Maintenance, Other)
- Amount and date tracking
- Trip and vehicle linkage
- Note documentation

#### Related Tables
- `roles` - User role definitions
- Additional lookup tables for status enums

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (v5.7 or higher) or **MariaDB**
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/odoo-hackathon.git
   cd odoo-hackathon
   ```

2. **Setup Database**
   ```bash
   # Create MySQL database
   mysql -u root -p

   # In MySQL prompt:
   CREATE DATABASE fleetflow;
   USE fleetflow;
   source Database/fleetflow.sql;
   ```

3. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Configure Environment Variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=4000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=fleetflow
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Start the Backend Server**
   ```bash
   npm run dev    # Using nodemon for development
   # or
   npm start      # For production
   ```
   The server will run on `http://localhost:4000`

### Frontend Setup

1. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Start the React Development Server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🔐 User Roles & Permissions

| Role | Permissions |
|------|---|
| **Fleet Manager** | Full access - manage users, vehicles, drivers, reports, settings |
| **Dispatcher** | Manage trips, assign drivers/vehicles, view resources |
| **Driver** | View personal trips, log fuel/cargo, view trip details |
| **Safety Officer** | Monitor driver safety, alerts, incident reports |
| **Financial Analyst** | View and generate financial reports, expense analysis |

### Test Login Credentials
```
Fleet Manager: manager@company.com / password
Dispatcher: dispatcher@company.com / password
Driver: driver@company.com / password
Safety Officer: safety@company.com / password
Financial Analyst: analyst@company.com / password
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Drivers
- `GET /api/drivers` - Get all drivers
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Trips
- `GET /api/trips` - Get all trips
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `GET /api/trips/:id` - Get trip details

### Fuel Logs
- `GET /api/fuel_logs` - Get all fuel entries
- `POST /api/fuel_logs` - Record fuel entry
- `GET /api/fuel_logs/:id` - Get fuel entry details

### Maintenance
- `GET /api/maintenance_logs` - Get maintenance history
- `POST /api/maintenance_logs` - Create maintenance record
- `GET /api/maintenance_logs/:id` - Get maintenance details

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/:id` - Get expense details

### Cargo
- `GET /api/cargo` - Get all cargo
- `POST /api/cargo` - Create cargo entry
- `PUT /api/cargo/:id` - Update cargo

### Reports
- `GET /api/reports/dashboard` - Dashboard metrics
- `GET /api/reports/financial` - Financial reports
- `GET /api/reports/fleet-performance` - Fleet performance metrics

---

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm test
```

### Running Build
```bash
cd client
npm run build
```

---

## 🤝 Contributing

We welcome contributions to FleetFlow!

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/odoo-hackathon.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add meaningful commit messages
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Description of your feature"
   ```

5. **Push to Your Branch**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure all tests pass

### Code Standards
- Use meaningful variable and function names
- Comment complex logic
- Follow existing formatting patterns
- Keep functions small and focused
- Use consistent indentation (2 spaces)

### Reporting Bugs
- Check existing issues first
- Create a new issue with detailed description
- Include steps to reproduce
- Add screenshots if applicable

---

## 🗂️ Key Utilities

### Storage Manager (`src/utils/storageManager.js`)
Manages browser localStorage for data persistence across sessions.

### Trip Cost Calculator (`src/utils/tripCostCalculator.js`)
Calculates trip costs based on distance, fuel consumption, and expenses.

### Fuel-Expense Sync (`src/utils/fuelExpenseSync.js`)
Synchronizes fuel logs with trip expenses for accurate cost tracking.

### Report Exporter (`src/utils/reportExporter.js`)
Exports reports to various formats for analysis and sharing.

### Validation Utils (`src/utils/validationUtils.js`)
Input validation for forms and API requests.

---

## 🎯 Current Features Status

- ✅ User Authentication & Authorization
- ✅ Vehicle Management
- ✅ Driver Management
- ✅ Trip Management
- ✅ Fuel Tracking
- ✅ Maintenance Logging
- ✅ Expense Management
- ✅ Dashboard & Analytics
- ✅ Role-Based Access Control
- ✅ Alert System
- 🔄 Backend API Integration (In Progress)

---

## 📞 Support & Contact

For questions or support, please:
- Open an issue on GitHub
- Review the documentation
- Check existing discussions

---

## 🙏 Acknowledgments

- Powered by React, Express, and MySQL
- UI Components by Material-UI
- Community contributions welcome

---

<div align="center">

[Back to Top](#fleetflow---modular-fleet--logistics-management-system)

</div>
