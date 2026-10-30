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

## Scripts

| Command             | What it does                                                 |
| ------------------- | ------------------------------------------------------------ | --- |
| `npm run dev`       | Starts the standalone app on the Vite dev server (port 3000) |
| `npm run build`     | Builds the standalone app into `dist/`                       |
| `npm start`         | Serves the built standalone app on port 8080                 |
| `npm run build:lib` | Builds the library into `lib/`                               |     |
