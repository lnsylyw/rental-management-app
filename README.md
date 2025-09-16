# Rental Management App

This is a rental management application built with Vite, React, and TypeScript.

## Project Structure

```
rental-management-app/
├── public/                     # Static assets folder
├── src/                        # Source code main directory
│   ├── app/                    # Next.js App Router directory
│   │   └── layout.tsx          # Application root layout file
│   ├── __tests__/              # Test files directory
│   │   ├── components/         # Component tests
│   │   ├── pages/              # Page tests
│   │   └── services/           # Service tests
│   ├── components/             # Reusable UI components
│   │   ├── auth/               # Authentication related components
│   │   ├── dashboard/          # Dashboard related components
│   │   ├── parking/            # Parking management related components
│   │   ├── properties/         # Property management related components
│   │   ├── tenants/            # Tenant management related components
│   │   ├── leases/             # Lease management related components
│   │   ├── finance/            # Financial management related components
│   │   ├── maintenance/        # Maintenance management related components
│   │   ├── ui/                 # Generic UI components
│   │   └── notifications/      # Notification related components
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── parking/            # Parking management pages
│   │   ├── properties/         # Property management pages
│   │   ├── tenants/            # Tenant management pages
│   │   ├── leases/             # Lease management pages
│   │   ├── finance/            # Financial management pages
│   │   ├── maintenance/        # Maintenance management pages
│   │   └── notifications/      # Notification pages
│   ├── services/               # API services and data fetching logic
│   ├── hooks/                  # Custom React Hooks
│   ├── config/                 # Configuration files
│   ├── lib/                    # Utility libraries and third-party libraries
│   ├── utils/                  # General utility functions
│   ├── styles/                 # Modular style system
│   │   ├── base/              # Base styles and variables
│   │   │   ├── variables.css # CSS custom variable system
│   │   │   └── base.css      # Base element styles
│   │   ├── components/        # Component styles (reserved)
│   │   ├── utilities/        # Utility styles
│   │   │   └── utilities.css # Custom utility classes
│   │   └── globals.css       # Global style entry file
│   ├── App.tsx                 # Application root component
│   └── main.tsx                # Application entry file
├── package.json                # Project dependencies and scripts configuration
├── vite-env.d.ts              # Vite environment variable type declaration file
└── README.md                   # Project documentation
```

## Getting Started

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`

## Building

To build the application for production: `npm run build`

## Linting

To lint the code: `npm run lint`

## Preview

To preview the production build: `npm run preview`