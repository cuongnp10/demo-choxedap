# GEMINI.md - Frontend (React)

## Project Overview
This is the primary user interface for the **Cho Xe Dap** marketplace (`choxedap.app`). It provides a responsive, modern experience for guests, buyers, and sellers to browse, list, and purchase sports bicycles.

### Tech Stack
- **Framework:** React 18
- **Tooling:** Vite 6 + SWC
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Radix UI (Headless components)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router (v7)

### Key Integrations
- **Bot Protection:** Cloudflare Turnstile
- **Chat:** SignalR (real-time buyer-seller messaging)
- **Payments:** SePay VietQR checkout (dynamic QR rendering)
- **Media:** Cloudinary (image/video upload for postings)

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
- **Naming:** Follows kebab-case for file names and PascalCase for components.
- **Components:** Functional components with hooks are preferred.
- **Styling:** Use Tailwind utility classes directly in JSX. Custom styles should go into `src/index.css`.
- **Environment:** Configure your backend API URL in `.env.local`.

---

## Agent Skill: Development Workflow

> **Workflow file:** Follow **`.agents/workflows/dev-workflow.md`** for the full step-by-step process.
> **Documentation:** Use GitHub MCP to read docs from `choxedap/documentation`.

**Trigger**: When a user says "Execute / Work on / Implement issue #X" (English or Vietnamese), activate the workflow in `.agents/workflows/dev-workflow.md`.
