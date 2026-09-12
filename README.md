# Unstuck API

Backend API for **Unstuck**, an AI-powered task unblocker designed to
reduce decision overload by breaking complex tasks into actionable steps
and guiding users through one executable step at a time.

## Overview

Unstuck uses a NestJS REST API to handle:

-   User registration and JWT authentication
-   Password reset
-   Task CRUD operations
-   Hierarchical task-step management
-   AI-powered task decomposition with Gemini
-   Step execution state
-   Park It / deferred steps
-   Estimated vs actual time tracking

The backend owns the application rules, authorization, AI integration,
and persistence.

## Tech Stack

-   **Node.js**
-   **NestJS**
-   **TypeScript**
-   **PostgreSQL**
-   **TypeORM**
-   **JWT / Passport**
-   **Argon2**
-   **Google Gemini API**
-   **Resend**

## Architecture

``` text
React Frontend
      |
      | HTTPS / REST API
      v
NestJS API
  |       |       |
  |       |       +---- Gemini API
  |       |
  |       +------------ Resend
  |
  +-------------------- PostgreSQL
```

## Core Design

### Hierarchical Task Steps

A task can contain nested `TaskStep` records using a self-referencing
relationship:

``` text
Task
 ├── Step A
 │    ├── Step A.1
 │    └── Step A.2
 └── Step B
      └── Step B.1
```

Each step stores:

-   `parentStepId`
-   `depth`
-   `position`
-   `status`
-   `estimatedSeconds`
-   `actualSeconds`
-   `aiDeconstructed`

The application limits decomposition depth to keep the workflow
manageable.

### Focus Mode

The backend stores step execution state, while the frontend builds the
hierarchy and selects executable leaf steps.

Only incomplete, non-parked leaf steps are considered actionable.

### AI Decomposition

Gemini receives a task or task step and returns structured JSON
containing actionable child steps and estimated durations.

The backend validates the request and owns the AI integration so the
Gemini API key is never exposed to the browser.

### Authorization

Protected resources are scoped to the authenticated user.

For example, task queries verify both:

``` text
userId + taskId
```

This prevents one user from accessing another user's tasks or steps.

## API Endpoints

### Authentication

``` text
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password
```

### Tasks

``` text
POST   /tasks
GET    /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
```

### Task Steps

``` text
POST   /tasks/:taskId/steps
GET    /tasks/:taskId/steps
PATCH  /tasks/:taskId/steps/:stepId
DELETE /tasks/:taskId/steps/:stepId
```

### AI

``` text
POST /ai/deconstruct-task
POST /ai/deconstruct
```

### Health

``` text
GET /health
```

## Environment Variables

Create a `.env` file in the project root:

``` env
NODE_ENV=development
PORT=3000

DATABASE_URL=your-postgresql-connection-string

JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=12h

GEMINI_API_KEY=your-gemini-api-key

RESEND_API_KEY=your-resend-api-key
MAIL_FROM=your-sender-email

FRONTEND_URL=http://localhost:5173
```

Never commit `.env` or API keys to GitHub.

## Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/Jayasuriya1/unstuck-api.git
cd unstuck-api
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure environment variables

Create `.env` using the variables above.

### 4. Start development server

``` bash
npm run start:dev
```

The API runs locally on:

``` text
http://localhost:3000
```

## Build

``` bash
npm run build
```

## Production

The API is deployed as a Node.js web service and connects to a managed
PostgreSQL database.

The server listens on the platform-provided `PORT` and binds to
`0.0.0.0`.

## Database

TypeORM is configured with:

``` text
autoLoadEntities: true
synchronize: true
```

`synchronize: true` is convenient for the current MVP deployment. A
production-hardened version should use TypeORM migrations and a
controlled schema-change process.

## Project Structure

``` text
src/
├── ai/
├── auth/
├── task-steps/
├── tasks/
├── users/
├── app.module.ts
└── main.ts
```

## Future Improvements

-   TypeORM migrations
-   Automated unit and integration tests
-   Rate limiting
-   Better AI failure handling and retries
-   Transactional AI step replacement
-   Observability and structured logging
-   Refresh-token/session management
-   Recovery flow for parked steps

## License

This project is currently maintained as a personal portfolio project.
