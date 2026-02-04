# Shattak.Web

![Shattak.Web](https://og.sznm.dev/api/generate?heading=Shattak.Web&text=Next.js+template+with+Chakra-UI+and+TypeScript+setup.&template=color&center=true&height=330)

Shattak.Web is web application built using **Next.js**, **TypeScript**, and **Chakra UI**. It is designed as a template to facilitate rapid development within the organization, leveraging modern React-based tools and UI libraries.

## Features

- **Next.js**: A React framework for server-side rendering and static site generation.
- **TypeScript**: Strongly typed JavaScript for improved code quality and developer experience.
- **Chakra UI**: A simple, modular, and accessible component library for building responsive UIs.
- **PWA Support**: Configured as a Progressive Web Application using `next-pwa`.
- **ESLint & Prettier**: Integrated for linting and code formatting.
- **Husky & Commitlint**: Enforces commit message conventions and automates git hooks.
- **Turbo Repo**: Utilized for efficient builds and monorepo handling.

## Table of Contents

- [Pre-requisites](#pre-requisites)
- [Getting Started](#getting-started)
- [Netlify Deploy (CLI)](#netlify-deploy-cli)
- [Available Scripts](#available-scripts)
- [Technologies Used](#technologies-used)

## Pre-requisites

Ensure the following tools are installed before proceeding:

1. [Node.js](https://nodejs.org/en/) v20.17.0 or later (tested with Node 22.16.0). The repository ships with `.nvmrc` set to `20.*`.
2. `npm` v11.x (package manager pinned to `npm@11.7.0`).

## Getting Started

1. Clone the repository and navigate to the project directory:

   ```bash
   git clone https://github.com/shattak/Shattak.Web
   cd Shattak.Web
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

Access the application at [http://localhost:3000](http://localhost:3000).

## Netlify Deploy (CLI)

This project uses the Netlify Next.js plugin, so deploys must run through the CLI (or a connected repo) to generate the required serverless output. Drag-and-drop of `out/` will not work for SSR.

1. Log in and link the site once:

   ```bash
   npm run netlify:login
   npm run netlify:link
   ```

2. Add credentials to `.env` or `.env.local` (do not commit these):

   ```bash
   NETLIFY_SITE_ID=your-site-id
   NETLIFY_AUTH_TOKEN=your-personal-access-token
   ```

   - `NETLIFY_SITE_ID`: in `.netlify/state.json` as `siteId`, or Netlify site settings.
   - `NETLIFY_AUTH_TOKEN`: Netlify user settings → Applications → Personal access tokens.

3. Deploy:

   ```bash
   npm run netlify:deploy:prod
   ```

Notes:
- Keep only the root `netlify.toml`. Remove `.netlify/netlify.toml` if it exists.
- The deploy scripts load `.env`/`.env.local` and pass the variables to the Netlify CLI.

## Available Scripts

The following scripts are available for common development tasks:

- **`npm run dev`**: Starts the development server with Turbopack.
- **`npm run build`**: Builds the application for production (Webpack enforced via `--webpack`).
- **`npm run start`**: Starts the production server.
- **`npm run type-check`**: Checks TypeScript types.
- **`npm run format`**: Formats code using Prettier.
- **`npm run release`**: Automates the release process.
- **`npm run push-release`**: Pushes the latest release to the main branch.
- **`npm run build:turbo`**: Builds the project using Turbo Repo.
- **`npm run postbuild`**: Generates a sitemap after the build.
- **`npm run check:turbo`**: Runs linting and type-checking using Turbo Repo.
- **`npm run up-interactive`**: Updates dependencies interactively.
- **`npm run up-latest`**: Updates dependencies to their latest versions.
- **`npm run sanity-check`**: Runs TypeScript checks, linting, and Prettier checks.
- **`npm run checkTs`**: Runs TypeScript compiler and strict checks.
- **`npm run eslint`**: Lints the codebase with ESLint.
- **`npm run lint`**: Lints the codebase with ESLint for the source directory.
- **`npm run lint:fix`**: Fixes linting issues in the codebase.
- **`npm run prettier:check`**: Checks code formatting with Prettier.
- **`npm run prettify`**: Formats code with Prettier, ignoring unknown file types
- **`npm run netlify:login`**: Logs into Netlify CLI.
- **`npm run netlify:link`**: Links the repo to a Netlify site.
- **`npm run netlify:deploy`**: Deploys a draft build to Netlify using local `.env` credentials.
- **`npm run netlify:deploy:prod`**: Deploys a production build to Netlify using local `.env` credentials.
- **`npm run netlify:env:import`**: Imports env vars from `.env` into Netlify.

## Technologies Used

- **Next.js**: v16.1.1 (Webpack build enforced)
- **React**: v19.2.3
- **Chakra UI**: v3.30.0 (default system; custom theme removed)
- **TypeScript**: v5.9.3
- **Framer Motion**: v12.23.26 for animations
- **NextAuth**: v4.24.13 for auth scaffolding
- **ESLint & Prettier**: ESLint v8.57.1 (with `@next/eslint-plugin-next@15.x` for eslintrc support) and Prettier v3.7.4
- **Husky & Commitlint**: Git hooks and commit message validation
- **Turbo Repo**: Efficient build handling

---
