<!-- Poornasree Equipments Cloud Web Application -->

# Project Overview
Full-stack web application for Poornasree Equipments Cloud with role-based authentication hierarchy, MySQL Azure database integration, and responsive Material Design 3 UI.

## Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Material Design 3
- **Backend**: Node.js, Express.js, MySQL
- **Database**: Azure MySQL with SSL connection
- **Authentication**: JWT tokens with role-based hierarchy
- **Email**: SMTP integration with Gmail
- **Styling**: Material Design 3 with BTCBot24 inspired patterns

## User Hierarchy
1. Super Admin (admin/psr@2025)
2. Admin 
3. Dairy
4. BMC
5. Society
6. Farmer

## Key Features
- Role-based authentication and access control
- Dynamic MySQL schema creation for each admin
- OTP verification for registration
- Email notifications for all key actions
- Responsive design for all screen sizes
- Reusable UI components with Material Design 3
- Hierarchical data visibility and permissions

## Development Guidelines
- Use absolute paths for all file operations
- Follow Material Design 3 principles
- Implement responsive breakpoints for mobile, tablet, desktop
- Create reusable components for consistent UI
- Maintain strict role-based access control
- Use TypeScript for type safety