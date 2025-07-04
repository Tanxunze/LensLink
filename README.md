# LensLink - Photography Trading Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue.svg)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)](https://laravel.com)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.3-purple.svg)](https://getbootstrap.com)

## Project Overview

**LensLink** is a comprehensive web-based photography trading platform that connects professional photographers with clients, developed as part of the CS4116 Software Development Project. The platform facilitates the entire photography business workflow from service discovery to booking completion, featuring real-time communication, portfolio management, and integrated payment processing.

## Key Features

- **Dual-Role Authentication System**: Separate registration and login flows for photographers and clients
- **Service Management**: Photographers can create, edit, and manage multiple photography service packages
- **Advanced Booking System**: Intelligent scheduling with availability management and booking status tracking
- **Real-time Messaging**: WebSocket-based instant communication between photographers and clients
- **Review & Rating System**: Comprehensive feedback mechanism with photo attachments and response capabilities
- **Portfolio Showcase**: Dynamic portfolio management with image galleries and categorization
- **Responsive Design**: Mobile-first approach with Bootstrap-powered responsive UI
- **Search & Discovery**: Advanced filtering and search functionality for finding photographers

## Technology Stack

### Backend Architecture
- **Framework**: Laravel 11.x (PHP 8.2+)
- **Database**: MySQL 8.0+ with Eloquent ORM
- **Authentication**: Laravel Sanctum for API token management
- **API Design**: RESTful API following Laravel conventions
- **Testing Framework**: Pest PHP for feature and unit testing
- **File Storage**: AWS S3 integration via Laravel Flysystem

### Frontend Technologies
- **UI Framework**: Bootstrap 5.3.3 with custom CSS
- **JavaScript**: Vanilla ES6+ with modular architecture
- **HTTP Client**: jQuery 3.7.1 for AJAX requests
- **Build Tools**: Laravel Mix for asset compilation
- **Component Architecture**: Reusable HTML components with dynamic loading

## Project Architecture

```
LensLink/
├── backend/                 # Laravel application
│   ├── app/
│   │   ├── Http/Controllers/API/    # API controllers
│   │   └── Models/                  # Eloquent models
│   ├── database/
│   │   ├── migrations/              # Database schema
│   │   └── seeders/                 # Test data
│   ├── routes/api.php              # API routes
│   └── tests/                      # Feature and unit tests
├── frontend/               # Client-side application
│   ├── assets/
│   │   ├── css/           # Stylesheets
│   │   ├── js/            # JavaScript modules
│   │   └── images/        # Static assets
│   ├── components/        # Reusable HTML components
│   └── pages/            # Application pages
└── database-dump/        # Sample database structure
```

## Installation & Setup

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js & npm
- MySQL 8.0+
- Web server (Apache/Nginx) or Laravel development server

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd LensLink/backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate
php artisan db:seed

# Start development server
php artisan serve
```

### Frontend Setup
```bash
cd LensLink/frontend

# Install Node.js dependencies (if applicable)
npm install

# Start live server for development
# Use Live Server VS Code extension or similar
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout

### Core Business Logic
- `GET /api/photographers` - List photographers with filtering
- `GET /api/photographers/{id}` - Photographer profile details
- `GET /api/services` - Photography services
- `POST /api/bookings` - Create new booking
- `GET /api/conversations` - User conversations
- `POST /api/reviews` - Submit review

## Development Guidelines

### Code Standards
- Follow PSR-12 coding standards for PHP
- Use ESLint configuration for JavaScript
- Implement proper error handling and validation
- Write descriptive commit messages

### Git Workflow
```bash
# Feature development
git checkout -b feature/amazing-feature
git commit -m 'feat: Add amazing feature'
git push origin feature/amazing-feature

# Submit pull request to dev branch
```

### Testing
```bash
# Run PHP tests
php artisan test

# Run specific test file
php artisan test tests/Feature/AuthTest.php
```

## Database Schema

Key entities and relationships:
- **Users**: Base user authentication
- **PhotographerProfiles**: Extended photographer information
- **Services**: Photography service offerings
- **Bookings**: Appointment management
- **Conversations & Messages**: Communication system
- **Reviews**: Feedback and rating system

## Performance Considerations

- **Database Optimization**: Proper indexing on frequently queried columns
- **Image Handling**: Optimized image storage and delivery via CDN
- **Caching Strategy**: Redis integration for session and query caching
- **API Rate Limiting**: Throttling to prevent abuse

## Security Features

- **Input Validation**: Server-side validation for all user inputs
- **CSRF Protection**: Built-in Laravel CSRF token validation
- **SQL Injection Prevention**: Eloquent ORM parameterized queries
- **Authentication**: Secure token-based authentication with Sanctum

## Deployment

### Production Environment
- Configure proper environment variables
- Set up SSL certificates
- Implement proper backup strategies
- Monitor application performance and logs

## Contributing

1. Fork the repository
2. Create your feature branch
3. Follow coding standards and write tests
4. Submit a pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact & Support

For questions regarding this project:
- Course: CS4116 Software Development Project
- Institution: University of Limerick
- Documentation: See `/docs` directory for detailed API documentation
