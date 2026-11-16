# BDC Data Portal - Cohort Builder Component

This repository contains the Cohort Builder component for the BDC Data Portal. It enables users to build cohorts from data available in the BDC Ecosystem.

The component library is built with Vite and TypeScript. It runs on its own as a standalone app for local development, and it builds into a package that the host app consumes.

## Requirements

- Node.js 22 or later

## Getting started

```bash
git clone <repo-url>
cd bdc-data-portal-cohort-builder
npm install
```

## Deployment

The standalone app is hosted on UNC Cloudapps Openshift environment (see link in About).

**Rebuilding the app:**

- Rebuilds are self-service.
- In the Cloudapps web console, open **Topology → `<pod>`** and click **Start Build**

The build pulls from the `main` branch. Once it succeeds, the new version rolls out automatically.

## Embedding in a Host App

### What the host app must provide

The component does not set up routing or theming itself. The host is responsible for three things:

| Requirement            | Details                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Router v7 router | Mount the component under a **splat route** (e.g. `path="/cohort-builder/*"`). Without the trailing `/*`, the Cohort Builder's internal routes will not match. |
| MUI `ThemeProvider`    | Wrap the component in an MUI `ThemeProvider`. The Cohort Builder uses the host's theme and does not supply its own.                                            |
| `apiBaseUrl` prop      | Base URL for API requests. See the props table below.                                                                                                          |

## Migration

Please refer to MIGRATE.md

## Scripts

| Command             | What it does                                                 |
| ------------------- | ------------------------------------------------------------ |
| `npm run dev`       | Starts the standalone app on the Vite dev server (port 3000) |
| `npm run test`      | Runs unit tests and coverage report                          |
| `npm run build`     | Builds both the standalone app and the library               |
| `npm run build:app` | Builds the standalone app into `dist/`                       |
| `npm run build:lib` | Builds the library into `lib/`                               |
| `npm start`         | Serves the built standalone app on port 8080                 |
