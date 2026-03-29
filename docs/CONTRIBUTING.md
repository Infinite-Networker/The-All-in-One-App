# Contributing to The All-in-One App
**Cherry Computer Ltd.** | Dr. Ahmad Mateen Ishanzai

Thank you for your interest in contributing to The All-in-One App. This project is developed and maintained by Cherry Computer Ltd. We welcome thoughtful contributions that align with the project's vision and code quality standards.

---

## 🚦 Before You Start

1. **Read the architecture docs**: `docs/concepts/ARCHITECTURE.md`
2. **Understand the design system**: `docs/design/DESIGN_SYSTEM.md`
3. **Familiarise yourself with the component library**: `design/components/COMPONENT_LIBRARY.md`
4. **Open an issue first**: For significant changes, discuss before implementing

---

## 🔧 Development Setup

### Frontend
```bash
git clone https://github.com/Infinite-Networker/The-All-in-One-App.git
cd The-All-in-One-App
npm install
cp .env.example .env  # Fill in your credentials
npx react-native run-ios  # or run-android
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

---

## 📏 Code Standards

### General
- **No console.log** in production code — use proper logging
- **TypeScript-friendly** — add JSDoc types where possible
- **Error handling** — always handle promise rejections
- **Comments** — explain *why*, not *what*

### React Native
- Functional components only (no class components)
- `useCallback` for all event handlers
- `useMemo` for expensive computations
- `StyleSheet.create` for all styles (never inline)
- Follow the theme system — never hardcode colours

### Backend
- Use `async/await` not raw Promises
- All routes must have auth middleware unless explicitly public
- All request bodies must be validated with Joi schemas
- Log errors but never expose stack traces in production responses

---

## 🌿 Git Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make focused, atomic commits
4. Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`
5. Push and open a Pull Request against `main`

### Commit Message Format
```
type(scope): brief description

Longer explanation if needed.

Fixes #issue-number
```

---

## 🧪 Testing Requirements

All new features must include tests:
- **Unit tests** for utility functions and hooks
- **Integration tests** for API endpoints
- **Component tests** for complex UI components

Run tests: `npm test`

---

## 🔐 Security Policy

- **Never commit credentials** — use `.env` files
- **Never log sensitive data** — tokens, passwords, personal info
- Report security vulnerabilities privately to: security@cherrycomputer.ltd

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

All contributions remain subject to the intellectual property rights of Cherry Computer Ltd.

---

*Cherry Computer Ltd. · Dr. Ahmad Mateen Ishanzai*
