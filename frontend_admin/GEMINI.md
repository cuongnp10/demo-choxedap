# GEMINI.md - Admin Frontend (React)

## Project Overview
This is the **Admin Portal** for the **Cho Xe Dap** marketplace. It provides a secure management interface for administrators to moderate listings, handle reports, manage users, and monitor system metrics.

### Tech Stack
- **Framework:** React 18
- **Tooling:** Vite 6 + SWC
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Radix UI (Headless components)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router (v7)

### Key Features
- **Posting Moderation:** Approve / Request Info / Delete bicycle listings
- **Report Handling:** Review reports forwarded by Inspectors, issue warnings/bans
- **User Management:** View, suspend, or ban user accounts
- **Category & Brand Management:** Manage system-wide bicycle categories and brands
- **Dashboard:** System metrics and activity logs

---

## Building and Running
- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Run Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```

---

## Development Conventions
- **Components:** Functional components with hooks.
- **Styling:** Use Tailwind utility classes directly in JSX.
- **Environment:** Configure backend API URL in `.env.local`.
- **Quality Gate:** `npm run lint && npm run build` — both must pass.

---

## Agent Skill: Development Workflow

> **Workflow file:** Follow **`.agents/workflows/dev-workflow.md`** for the full step-by-step process.
> **Documentation:** Use GitHub MCP to read docs from `choxedap/documentation`.

**Trigger**: When a user says "Execute / Work on / Implement issue #X" (English or Vietnamese), activate the workflow in `.agents/workflows/dev-workflow.md`.
