# 🚀 QAITECH - Web Application Testing Automation Platform

<div align="center">

![QAITECH Logo](https://img.shields.io/badge/QAITECH-Automation-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue?style=for-the-badge)

**Modern web application testing automation platform without coding**

[Features](#-main-features) • [Advantages](#-advantages) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## 📖 Description

**QAITECH** is a powerful web application testing automation platform that allows you to create, run, and manage tests through an intuitive visual interface. The application uses modern technologies, including Playwright for test execution and artificial intelligence for generating test scenarios.

With QAITECH you can:

- ✅ Create tests without writing code
- ✅ Automatically parse web page elements
- ✅ Generate tests using AI
- ✅ Run tests in various browsers and resolutions
- ✅ Get detailed reports with screenshots
- ✅ Integrate tests into CI/CD pipeline
- ✅ Work in teams on projects

---

## 🎯 Main Features

### 🔍 Automatic Web Element Parsing
- Automatic detection and extraction of page elements
- Support for various selectors (CSS, XPath)
- Intelligent element type detection
- Element storage for reuse

### 🤖 AI-Powered Test Generation
- Automatic generation of test scenarios based on descriptions
- Integration with LLM for creating smart tests
- Support for various language models (OpenAI, Anthropic)
- Test generation for complex user scenarios

### 🎨 Visual Test Creation
- Intuitive drag-and-drop interface
- Visual test step constructor
- Test scenario preview
- Real-time test editing

### 🌐 Multi-Browser Testing
- Support for Chromium, Firefox, and WebKit
- Running tests in headless and headed modes
- Parallel test execution
- Custom viewport configuration

### 📱 Responsive Testing
- Testing on various screen resolutions (viewport)
- Pre-configured device profiles (Desktop, Tablet, Mobile)
- Custom resolution creation
- Automatic test adaptation for different devices

### 📊 Detailed Reporting
- Automatic test execution report generation
- Screenshots at each test step
- Detailed error information
- Test execution history
- Report export in HTML format
- Email notifications about test results

### 📦 Test Export and Import
- Test export in JSON format
- Test import between projects
- Preview before import
- Data validation during import
- Test structure preservation

### 📈 Analytics and Statistics
- Test execution statistics
- Test success rate graphs
- Performance analysis
- Reports for various periods
- Quality trends and metrics

### 🤖 Telegram Bot Integration
- Test execution via Telegram
- Receiving notifications in Telegram
- Viewing reports in the bot
- Test management through the bot

### 🔐 Security and Authentication
- User authentication system
- Password recovery
- Email verification
- Session management

---

## ✨ Advantages

### 🎯 For Testers
- **No programming required** — create tests through a visual interface
- **Fast test creation** — automatic element parsing and AI generation reduce test creation time
- **Detailed reporting** — get complete information about test execution with screenshots
- **Easy maintenance** — visual editor simplifies test updates

### 💼 For Development Teams
- **Team collaboration** — collaborative work on projects with access control system
- **CI/CD integration** — automatic test execution in pipeline
- **Scalability** — support for large projects with many tests
- **Flexibility** — customization to team needs

### 🏢 For Business
- **Time savings** — automation of routine testing tasks
- **Quality improvement** — early bug detection
- **Cost reduction** — less need for manual testing
- **Metrics and analytics** — product quality tracking

### 🚀 Technical Advantages
- **Modern stack** — React, Node.js, Playwright, Prisma
- **Performance** — parallel test execution with queue management
- **Reliability** — stable operation with modern web applications
- **Extensibility** — modular architecture for adding new features
- **Cross-platform** — works on Windows, macOS, Linux

---

## 🛠 Technologies

### Frontend
- **React** — modern UI framework
- **Tailwind CSS** — utility-first CSS framework
- **React Router** — routing
- **React Hot Toast** — notifications
- **Material-UI** — component library

### Backend
- **Node.js** — server platform
- **Express** — web framework
- **Prisma** — ORM for database work
- **Playwright** — browser automation
- **SQLite** — database

### Automation
- **Playwright** — test execution in browsers
- **AI/LLM** — test scenario generation
- **Web Parser** — web element parsing

### Infrastructure
- **REST API** — API for integrations
- **Telegram Bot API** — Telegram integration
- **Nodemailer** — email notifications

---

## 🚀 Quick Start

### Requirements

- Node.js 18+
- npm or yarn
- Windows 10/11, macOS or Linux

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd qaitech
```

2. **Install dependencies**

```bash
# Install backend dependencies
cd qaitech_server
npm install

# Install frontend dependencies
cd ../qaitech_client
npm install
```

3. **Configure environment variables**

#### Backend Configuration

Create a `.env` file in the `qaitech_server` directory:

```env
# Server Configuration
PORT=3000

# Database
DATABASE_URL="file:./prisma/dev.db"

# Session Secret
SESSION_SECRET=your-secret-key-here

# Email Configuration (for sending test reports)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# LLM Configuration (for AI test generation)
OPENAI_API_KEY=your-openai-api-key
# or
ANTHROPIC_API_KEY=your-anthropic-api-key

# Test Execution Settings
MAX_CONCURRENT_TESTS=5
HIGHLIGHT_BOXSHADOW_COLOR=rgba(255, 0, 0, 0.5)
HIGHLIGHT_BORDER_STYLE=solid

# Subscription Plan (optional)
SUBSCRIPTION_PLAN=pro
```

#### Frontend Configuration

Create a `.env` file in the `qaitech_client` directory:

```env
REACT_APP_API_URL=http://localhost:3000
PORT=5000
```

4. **Initialize the database**

```bash
cd qaitech_server
npx prisma generate
npx prisma db push
```

5. **Install Playwright**

```bash
cd qaitech_server
npx playwright install
npx playwright install-deps
```

6. **Run the application**

#### Development Mode

**Start the Backend Server:**

```bash
cd qaitech_server
npm start
```

The backend server will start on `http://localhost:3000`

**Start the Frontend Application:**

Open a new terminal window:

```bash
cd qaitech_client
npm start
```

The frontend application will start on `http://localhost:5000`

**Note**: On first run, Playwright will automatically install browser binaries (Chromium, Firefox, WebKit). This may take a few minutes.

#### Production Mode

**Build the Frontend:**

```bash
cd qaitech_client
npm run build
```

**Start the Backend:**

```bash
cd qaitech_server
npm start
```

---

## 📚 Usage

### 1. Create an Account

- Navigate to `http://localhost:5000`
- Click "Sign Up" to create a new account
- Verify your email address (if email verification is enabled)

### 2. Create a Workspace

- After logging in, create a new workspace
- Workspaces help organize your tests and pages

### 3. Create a Page

- Within a workspace, create a page
- A page represents a URL or web application you want to test

### 4. Create Tests

You can create tests in two ways:

**Manual Creation:**
- Use the visual test builder to add test steps
- Configure actions, assertions, and web elements

**AI Generation:**
- Use the AI test generator to automatically create tests
- Provide a description of what you want to test
- The AI will generate test steps based on your description

### 5. Run Tests

- Select the tests you want to run
- Choose the browser and viewport
- Click "Run" to execute the tests
- View detailed reports with screenshots and execution logs

---

## 🏗 Project Architecture

```
qaitech/
├── qaitech_client/             # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Application pages
│   │   ├── layouts/            # Layout components
│   │   └── server/             # API clients
│   ├── public/                 # Public assets
│   └── package.json
│
└── qaitech_server/              # Node.js backend
    ├── src/
    │   ├── api/                # API routes
    │   ├── services/           # Business logic
    │   ├── controllers/        # Controllers
    │   ├── db/                 # Database utilities
    │   └── utils/              # Utilities
    ├── prisma/                 # Database schema
    └── package.json
```

---

## 🛠️ Available Scripts

### Backend Scripts

```bash
npm start              # Start the server
npm run migrate        # Run database migrations
npm run db:push        # Push schema changes to database
npm run reset-running-tests  # Reset stuck test executions
```

### Frontend Scripts

```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
```

---

## 🗄️ Database

The application uses **SQLite** as the database with **Prisma ORM** for database management.

### Database Schema

Key models include:
- **User**: User accounts and authentication
- **Project**: Test projects
- **Page**: Web pages/URLs to test
- **Test**: Test cases
- **Step**: Individual test steps
- **Report**: Test execution reports
- **WebElement**: Web elements for test actions

### Database Management

```bash
# View database in Prisma Studio
cd qaitech_server
npx prisma studio

# Reset database (WARNING: This will delete all data)
npx prisma migrate reset
```

---

## 🔌 API

QAITECH provides REST API for integration with external systems:

- **Authentication**: `/api/auth/*`
- **Projects**: `/api/projects/*`
- **Pages**: `/api/pages/*`
- **Tests**: `/api/tests/*`
- **Reports**: `/api/reports/*`
- **Web Elements**: `/api/web-elements/*`

For detailed API documentation, refer to the API documentation files in the server directory.

---

## 📝 Environment Variables Reference

### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `DATABASE_URL` | Database connection string | Yes | - |
| `SESSION_SECRET` | Session encryption secret | Yes | - |
| `SMTP_HOST` | SMTP server host | No | - |
| `SMTP_PORT` | SMTP server port | No | 587 |
| `SMTP_USER` | SMTP username | No | - |
| `SMTP_PASS` | SMTP password | No | - |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | No | - |
| `OPENAI_API_KEY` | OpenAI API key | No | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | No | - |
| `MAX_CONCURRENT_TESTS` | Maximum concurrent tests | No | 5 |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API URL | Yes | - |
| `PORT` | Frontend port | No | 5000 |

---

## 🐛 Troubleshooting

### Playwright Browser Installation Issues

If Playwright browsers fail to install:

```bash
cd qaitech_server
npx playwright install
npx playwright install-deps
```

### Database Connection Issues

- Ensure the `prisma/dev.db` file exists
- Run `npx prisma generate` to regenerate the Prisma Client
- Check file permissions for the database directory

### Port Already in Use

If port 3000 or 5000 is already in use:

- Backend: Change `PORT` in `.env` file
- Frontend: Change `PORT` in `.env` file or use `PORT=5001 npm start`

---

## 🔒 Security Considerations

- Change the default `SESSION_SECRET` in production
- Use strong passwords for database connections
- Keep API keys secure and never commit them to version control
- Enable HTTPS in production
- Regularly update dependencies for security patches

---

## 🤝 Contributing

We welcome contributions to QAITECH development! Please read the contribution guide before submitting a Pull Request.

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

AGPL-3.0 is a copyleft license that requires anyone who distributes the software or modifications to it to make the source code available under the same license. This ensures that improvements to the software remain open source.

For more information about AGPL-3.0, see: https://www.gnu.org/licenses/agpl-3.0.html

---

## 👥 Authors

**QAITECH Team**

- **Arslan Akhmetzhanov** (Арслан Ахметжанов)
- **Danil Kabirov** (Данил Кабиров)
- **Aidar Iskhakov** (Айдар Исхаков)

---

## 📞 Support

If you have questions or issues:

- 📧 Email: info.qaitech@gmail.com

---

<div align="center">

**Made with ❤️ by QAITECH Team**

⭐ Star the project if it was helpful!

</div>
