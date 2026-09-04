# Cho Xe Dap - Demo Portfolio

This repository contains the front-end applications for the **Cho Xe Dap** project, tailored for portfolio demonstration.

Because the original backend services have been shut down, this version is configured to use **Mock Data** entirely. It intercepts API calls at the HTTP client level and returns local JSON data, allowing the user interface to be fully explorable without requiring a live server.

## Projects Included

1. **Main Frontend (`/frontend`)**
   - The user-facing eCommerce application (React, Vite, Tailwind CSS).
   - Simulates browsing bikes, viewing details, and user dashboard areas.

2. **Admin Frontend (`/frontend_admin`)**
   - The management portal for administrators and inspectors (React, Vite, Tailwind CSS).
   - Simulates user management, order overviews, and moderation dashboards.

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Running the Main Frontend
```bash
cd frontend
npm install
npm run dev
```
Then open `http://localhost:5173` in your browser.

### Running the Admin Frontend
```bash
cd frontend_admin
npm install
npm run dev
```
Then open `http://localhost:5174` (or whatever port Vite assigns) in your browser.

## Deployment

This repository is set up to automatically deploy to **GitHub Pages** via GitHub Actions whenever changes are pushed to the `main` branch.

- **Main App**: Will be available at the root URL.
- **Admin App**: (Deploy strategy depends on your configuration, typically built as a separate artifact or deployed to a subpath).
