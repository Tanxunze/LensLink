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
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── customer-dashboard.css
│   │   │   ├── dashboard-common.css
│   │   │   ├── photographer-dashboard.css
│   │   │   ├── photographer-detail.css
│   │   │   ├── photographers.css
│   │   │   ├── services.css
│   │   │   └── style.css
│   │   ├── images/
│   │   │   ├── hero-image.jpg
│   │   │   ├── logo.jpg
│   │   │   ├── logo.png
│   │   │   ├── logo.svg
│   │   │   └── service-hero.jpg
│   │   └── js/
│   │       ├── api.js
│   │       ├── config.js
│   │       ├── customer-dashboard.js
│   │       ├── dashboard-common.js
│   │       ├── loadComponents.js
│   │       ├── photographer-dashboard.js
│   │       ├── photographer-detail.js
│   │       ├── photographers.js
│   │       └── services.js
│   ├── components/
│   │   ├── footer.html
│   │   └── header.html
│   └── pages/
│       ├── auth/
│       │   ├── login.html
│       │   └── register.html
│       ├── dashboard/
│       │   ├── customer.html
│       │   └── photographer.html
│       ├── index.html
│       ├── photographers.html
│       ├── photographer-detail.html
│       └── services.html
├── backend/
│   ├── .idea/
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── API/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── BookingController.php
│   │   │   │   │   ├── ConversationController.php
│   │   │   │   │   ├── PhotographerController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   ├── ServiceController.php
│   │   │   │   │   └── UserController.php
│   │   │   │   └── Controller.php
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   │   ├── Booking.php
│   │   │   ├── Category.php
│   │   │   ├── Conversation.php
│   │   │   ├── ConversationParticipant.php
│   │   │   ├── Message.php
│   │   │   ├── PhotographerProfile.php
│   │   │   ├── PortfolioItem.php
│   │   │   ├── Review.php
│   │   │   ├── Service.php
│   │   │   ├── ServiceCategory.php
│   │   │   ├── ServiceFeature.php
│   │   │   └── User.php
│   │   └── Providers/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── public/
│   ├── resources/
│   ├── routes/
│   │   ├── api.php
│   │   ├── console.php
│   │   └── web.php
│   ├── storage/
│   ├── tests/
│   ├── vendor/
│   ├── .editorconfig
│   ├── .env
│   ├── composer.json
│   └── artisan
├── README.md
└── .gitignore
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

