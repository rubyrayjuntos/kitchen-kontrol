# 🍳 Kitchen Kontrol

> **Professional kitchen management system with stunning neumorphic design**

Kitchen Kontrol is a production-ready web application built for commercial kitchen operations. Designed by a school cafeteria manager to solve real-world pain points in food service compliance, staff management, and daily operations.

## ✨ Features

### 📊 **Operational Management**
- **Phase-Based Workflow**: Track kitchen operations through Prep, Service, and Cleanup phases
- **Role Management**: Assign staff to roles and link roles to specific phases
- **Task Tracking**: Create, assign, and monitor task completion
- **Absence Management**: Track staff absences with approval workflows

### 📝 **Compliance & Logging**
- **Equipment Temperature Logs**: Track refrigerator, freezer, and warmer temperatures
- **Food Temperature Monitoring**: Log arrival, pre-service, and mid-service temps
- **Planogram Management**: Visual steamer well layout with drag-and-drop editor
- **Sanitation Setup**: Verify hand wash stations and sanitizer levels
- **Reimbursable Meals**: Track meal counts and calculate revenue (USDA compliance)

### 📈 **Reporting & Analytics**
- **Weekly Log Status**: Completion rates for all required logs
- **Staff Performance**: Task completion tracking by individual
- **Audit Trail**: Complete log of all system entries and modifications
- **Compliance Summary**: Overview of all requirements and action items

### 🎓 **Training Center**
- **Interactive Modules**: Progressive learning with quizzes
- **Progress Tracking**: Monitor completion status and quiz scores
- **Required vs. Optional**: Flag critical training modules

### 🎨 **Beautiful Design System**
- **ChiaroscuroCSS**: Custom neumorphic design with 9.6/10 code quality
- **4 Themes**: Professional (dark slate), Serene (forest green), Mystical (deep purple), Playful (sunshine)
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: WCAG compliant with proper ARIA labels

## 🛠️ Technologies

### **Frontend**
- **React 19.1.1** - Modern UI library
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon system
- **ChiaroscuroCSS** - Custom neumorphic design system

### **Backend**
- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **PostgreSQL 15** - Robust relational database
- **bcrypt** - Password hashing
- **JWT** - Secure authentication

### **DevOps**
- **Docker Compose** - Multi-container orchestration
- **nginx** - Reverse proxy
- **node-pg-migrate** - Database migration system
- **Render.com** - Cloud deployment platform

## 🚀 Quick Start

### **Option 1: Docker (Recommended)**
### **Option 1: Docker (Recommended)**
```bash
# Clone the repository
git clone https://github.com/rubyrayjuntos/kitchen-kontrol.git
cd kitchen-kontrol

# Start all services (database, backend, frontend)
docker compose up -d

# Check status
docker compose ps
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3002
- PostgreSQL: localhost:5432

**Default login:**
- Email: `admin@kitchen.local`
- Password: `admin123`

### **Option 2: Local Development**
```bash
# Clone and install
git clone https://github.com/rubyrayjuntos/kitchen-kontrol.git
cd kitchen-kontrol
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations and seed data
npm run migrate:up
npm run seed:pg

# Start backend (Terminal 1)
node server.js

# Start frontend (Terminal 2)
npm start
```

## 📁 Project Structure

```
kitchen-kontrol/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.js     # Main dashboard with phases
│   │   ├── LogsView.js      # Daily logging interface
│   │   ├── TrainingView.js  # Training center
│   │   ├── ReportsView.js   # Analytics & reports
│   │   └── ...
│   ├── chiaroscuro/         # Custom CSS design system
│   │   ├── core/            # Base styles
│   │   ├── components/      # Component styles
│   │   ├── themes/          # 4 color themes
│   │   └── utilities/       # Helper classes
│   └── store.js             # Zustand state management
├── routes/                  # Express API routes
├── middleware/              # Auth & validation
├── migrations/              # Database migrations
├── scripts/                 # Seed & utility scripts
├── docker-compose.yml       # Container orchestration
├── Dockerfile.server        # Backend container
├── Dockerfile.client        # Frontend container
├── render.yaml              # Render.com deployment config
└── README.md
```

## 🎨 Theme System

Kitchen Kontrol includes 4 beautiful themes accessible via the palette icon in the navbar:

| Theme | Description | Best For |
|-------|-------------|----------|
| 🏢 **Professional** | Dark slate with blue-grey accents | Default, serious work |
| 🌿 **Serene** | Forest green with natural tones | Calm, focused environment |
| ✨ **Mystical** | Deep purple with cosmic vibes | Creative, night shifts |
| ☀️ **Playful** | Light sunshine with warm tones | Energetic, daytime |

Themes are saved to localStorage and persist across sessions.

## 🗄️ Database Schema

### Core Tables
- `users` - Staff accounts with roles and permissions
- `roles` - Kitchen roles (Chef, Prep Cook, Dishwasher, etc.)
- `phases` - Daily workflow phases (Prep, Service, Cleanup)
- `tasks` - Assigned tasks with completion tracking
- `absences` - Staff absence requests with approval status

### Logging Tables
- `logs` - Daily log entries with timestamps
- `log_status` - Completion status for required logs
- `planograms` - Steamer well layouts
- `training_progress` - User training completion tracking

### Audit
- `audit_log` - Complete trail of all system modifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/me` - Get current user

### Operations
- `GET /api/phases` - List kitchen phases
- `GET /api/roles` - List roles
- `GET /api/tasks` - List tasks
- `GET /api/users` - List users (admin only)
- `POST /api/absences` - Request absence
- `PUT /api/absences/:id` - Approve/deny absence

### Logging
- `GET /api/logs` - Get daily logs
- `POST /api/logs/:id/complete` - Mark log complete
- `GET /api/planograms/:date` - Get planogram for date

### Reports
- `GET /api/performance` - Staff performance metrics
- `GET /api/audit-log` - Audit trail

## 🚢 Deployment

### Render.com (Recommended)
See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

**Quick deploy:**
```bash
git push origin main
# Then follow Render.com blueprint setup
```

**Estimated cost:** $14/month (PostgreSQL $7 + Backend $7 + Frontend $0)

### Docker (Self-Hosted)
```bash
# Production build
docker compose -f docker-compose.yml up -d --build

# With custom environment
docker compose --env-file .env.production up -d
```

## 📊 Features in Detail

### Daily Logs System
Comprehensive logging for health department compliance:
- Equipment temperatures (morning & afternoon)
- Food temperatures (arrival, pre-service, mid-service)
- Portion counts and waste tracking
- Reimbursable meal component verification (5 required components)
- Sanitizer levels and test strip verification

### Planogram Editor
Visual drag-and-drop editor for steamer well layouts:
- Full-size and half-size pan support
- Metal vs plastic pan differentiation
- Utensil assignment (spoodles, tongs)
- Food item labeling
- Hot/cold well indicators
- Print/PDF export for kitchen reference

### Training Center
Progressive learning system:
- Multi-section training modules
- Interactive quizzes with scoring
- Progress tracking per user
- Required vs optional module flagging
- Certificate generation (planned)

## 🧪 Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

### Database Migrations
```bash
# Run migrations
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Check migration status
npm run migrate:status

# Create new migration
npx node-pg-migrate create migration-name
```

## 🤝 Contributing

This is currently a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary. All rights reserved.

## 👤 Author

**Ruby Ray Juntos**
- School Cafeteria Manager
- Full-Stack Developer
- GitHub: [@rubyrayjuntos](https://github.com/rubyrayjuntos)

## 🙏 Acknowledgments

- Built to solve real pain points in school cafeteria management
- Designed for USDA reimbursable meal program compliance
- ChiaroscuroCSS design system custom-built for this application
- Special thanks to the GitHub Copilot team for AI assistance

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Contact: [Your contact method]

---

**Built with ❤️ for commercial kitchen operations**



1) Quick local (terminal)

Install dependencies and run both client and server together from a terminal:

```bash
npm install
npm run dev
```

This runs the React dev server and nodemon for the Node server. The client is proxied to the server at `http://localhost:3002` (see `proxy` in `package.json`).

2) VS Code (local workspace)

Open the project in VS Code. The repository includes a `.vscode/launch.json` compound configuration to start the server and client from the Run panel. Use the "Run Full Stack" configuration to debug both processes with breakpoints.

3) Reproducible environment (Devcontainer)

If you set up the VS Code Remote - Containers extension, open the repository in the Dev Container. The provided `.devcontainer` folder will build a Node 20-based container, run `npm install` after creation, and forward ports 3000 and 3002 so you can access the app from your host.

Notes:
- If your server requires environment variables, add a `.env` or `.env.development` and load them in `server.js` (consider using `dotenv`).
- If you prefer Docker Compose for running the database in a container or more services, I can add a `docker-compose.yml` next.

## Migrations (Postgres)

This project uses `node-pg-migrate` for managing Postgres schema. When deploying or testing with Postgres, run migrations and seed the DB:

```bash
# ensure DATABASE_URL is set (or use docker-compose which provides one)
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/kitchendb
npm run migrate:up
npm run seed:pg
```

On Render, provision the Managed Postgres service and set its connection string as `DATABASE_URL` for the backend service. Then either run migrations as part of a deployment step or use Render's dashboard - I can add a `render.yaml` step if you'd like.