# CS4116 - SOFTWARE DEVELOPMENT PROJECT 

## *LensLink* - Photography trading website

A platform connecting photographers with clients, built for CS4116 project.

---

## Project Setup

### Prerequisites
- Web server supporting PHP 8.0+
- MySQL 8.0+
- Bootstrap 5.3.3
- Live Server or similar development server

### Directory Structure

```
LENSLINK/
├── frontend/               
│   ├── index.html         # Homepage
│   ├── assets/            # Static resources
│   │   ├── css/          # Style Files
│   │   │   ├── style.css
│   │   │   └── components/
│   │   ├── js/           # JavaScript Files
│   │   │   ├── api.js    # API calls
│   │   │   ├── config.js # URL config
│   │   │   └── loadComponents.js # Components Loading
│   │   └── images/       
│   ├── components/        # Reusable HTML components
│   │   ├── header.html
│   │   └── footer.html
│   └── pages/            
│       ├── photographers.html
│       ├── photographer-detail.html
│       ├── auth/         # Authentication Pages
│       │   ├── login.html
│       │   └── register.html
│       └── dashboard/    # Dashboard
│           ├── customer.html
│           └── photographer.html
└── backend/              # All backend codes（Laravel）
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
- All API endpoints are documented in `/docs/interfaces.md`
- Use the API class in `assets/js/api.js` for all backend communication

## Resources
- [Bootstrap Documentation](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Project Requirements Document](https://ulcampus-my.sharepoint.com/:b:/g/personal/24247472_studentmail_ul_ie/EVHfRbct3y5DlZOnXN3_kwEBfWAbnMBU5nFpdV2scdzdIg?e=Ecgm9h)

