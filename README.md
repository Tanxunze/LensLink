# CS4116 - SOFTWARE DEVELOPMENT PROJECT 

## *LensLink* - Photography trading website

A platform connecting photographers with clients, built for CS4116 project.

---

## Project Setup

### Prerequisites
- Web server supporting PHP 8.0+
- MySQL 8.0+
- Bootstrap 5.3.3
- jQuery 3.7.1 min
- Live Server or similar development server

### Directory Structure

```
LensLink/
├── backend/                           # Laravel backend
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── API/               # API controllers
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── PhotographerController.php
│   │   │   │   │   └── ...
│   │   │   ├── Middleware/
│   │   │   └── ...
│   │   ├── Models/                    # Data models
│   │   │   ├── User.php
│   │   │   ├── PhotographerProfile.php
│   │   │   ├── Category.php
│   │   │   ├── PortfolioItem.php
│   │   │   ├── Service.php
│   │   │   ├── ServiceFeature.php
│   │   │   └── ...
│   │   └── ...
│   ├── config/                        # Configuration files
│   ├── database/
│   │   ├── migrations/                # Database migrations
│   │   └── ...
│   ├── public/                        # Public assets
│   │   └── storage/                   # Symlink to storage/app/public
│   ├── resources/
│   ├── routes/
│   │   ├── api.php                    # API routes
│   │   └── ...
│   ├── storage/
│   │   └── app/
│   │       └── public/                # Storage for uploaded files
│   └── ...
│
├── frontend/                          # Frontend
│   ├── index.html                     # Home page
│   ├── assets/                        # Static assets
│   │   ├── css/                       # Stylesheets
│   │   │   ├── style.css
│   │   │   ├── dashboard-common.css
│   │   │   ├── customer-dashboard.css
│   │   │   └── photographer-dashboard.css
│   │   ├── js/                        # JavaScript files
│   │   │   ├── api.js                 # API calls wrapper
│   │   │   ├── config.js              # Configuration
│   │   │   ├── customer-dashboard.js
│   │   │   ├── dashboard-common.js
│   │   │   ├── photographer-dashboard.js
│   │   │   └── loadComponents.js      # Component loader
│   │   └── images/                    # Image resources
│   │       ├── default-avatar.jpg
│   │       ├── default-photographer.jpg
│   │       └── placeholder.jpg
│   ├── components/                    # Reusable HTML components
│   │   ├── header.html
│   │   └── footer.html
│   └── pages/                         # HTML pages
│       ├── photographers.html         # Photographers listing
│       ├── photographer-detail.html   # Photographer details
│       ├── auth/                      # Authentication pages
│       │   ├── login.html
│       │   └── register.html
│       └── dashboard/                 # Dashboard pages
│           ├── customer.html          # Customer dashboard
│           └── photographer.html      # Photographer dashboard
```

## Development Guidelines

### 1. Branch Management
- **main**: Production-ready code
- **dev**: Development branch for feature integration
- Feature branches should branch from `dev`

### 2. Commit Guidelines
- For **important or disruptive changes**, please commit to the **dev branch** and submit a **pull request**
- Use clear commit messages following this format:
  - feat: (new feature)
  - fix: (bug fix)
  - docs: (documentation changes)
  - style: (formatting, missing semi colons, etc)
  - refactor: (refactoring code)

### 3. Pull Request Process
1. Create your feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request to the `dev` branch

### 4. Frontend Development
- Use Bootstrap 5.3.3 classes where possible
- Follow component-based structure
- Test across different browsers

### 5. API Integration
- All API endpoints are documented in `/docs/api-documentation.md`
- The api except dashboard is definied in `/assets/js/api.js`
- The api of dashboard is defined in `/assets/js/xxxx-dashboard.js` & `dashboard-common.js`

## Resources
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Project Requirements Document](https://ulcampus-my.sharepoint.com/:b:/g/personal/24247472_studentmail_ul_ie/EVHfRbct3y5DlZOnXN3_kwEBfWAbnMBU5nFpdV2scdzdIg?e=Ecgm9h)

