# AGENTS.md — social-app

This file describes the project for AI agents working on implementation issues.

## Project Context

## Stakeholders
- End Users: Individuals who will sign up, interact with the platform, create content, and communicate with others.
- Product Owner: Defines feature scope and validates deliverables against business goals.
- Development Team: Engineers responsible for implementing, testing, and deploying the application.
- Security Auditor: Ensures the system adheres to security best practices, especially around authentication and data protection.
- DevOps Engineer: Manages deployment, monitoring, and infrastructure for the application.

## User Stories (include acceptance criteria for each)

### Account System
- As a new user, I want to sign up with an email and password so that I can access the platform.
  - Acceptance Criteria: 
    - Must display a registration form with email and password fields.
    - Must validate email format and minimum password strength (e.g., 8 characters).
    - Must show an error if the email is already registered.
    - Must securely hash the password before storing.
    - Must redirect to login upon successful registration.

- As a user, I want to log in and log out so that I can control my session.
  - Acceptance Criteria:
    - Must authenticate using email and password.
    - Must issue a secure token or session upon successful login.
    - Must redirect to the home feed after login.
    - Must clear session data on logout.
    - Must redirect unauthenticated users attempting to access protected pages to the login page.

- As a user, I want to see clear error messages when login fails so that I know what went wrong.
  - Acceptance Criteria:
    - Must show "Invalid credentials" for wrong password.
    - Must show "Email already in use" during sign-up if duplicate.
    - Must not expose whether an email exists in the system during login (to prevent enumeration).

### User Profiles
- As a user, I want to view my profile so that I can see my information.
  - Acceptance Criteria:
    - Must display name, bio, and profile photo.
    - Must be accessible via a dedicated route (e.g., /profile or /users/:id).

- As a user, I want to edit my profile so that I can update my name, bio, and photo.
  - Acceptance Criteria:
    - Must allow editing of name, bio, and uploading a new profile photo.
    - Must persist changes to the database.
    - Must only allow editing of the current user’s profile.
    - Must support image upload with validation (file type, size).

- As a user, I want to view other users’ profiles so that I can learn about them.
  - Acceptance Criteria:
    - Must display the user's name, bio, and profile photo.
    - Must not show edit options for other users’ profiles.
    - Must return 404 if the user does not exist.

### Posts & Feed
- As a user, I want to publish text posts so that I can share thoughts with the community.
  - Acceptance Criteria:
    - Must provide a form to enter and submit a text post.
    - Must save the post with author reference and timestamp.
    - Must enforce non-empty content.
 

[... truncated for brevity ...]

## Architecture

## System Overview
The social-app is a full-stack web application enabling users to create accounts, manage profiles, publish and view posts, and exchange private messages. The system follows a client-server architecture with a RESTful API backend and a single-page application (SPA) frontend. The backend handles authentication, data persistence, and business logic, while the frontend provides an interactive user interface. Communication between components is stateless using JSON over HTTPS.

## Components
- **Auth Service**: Handles user registration, login, and logout. Validates credentials, issues JWT tokens, and manages session security.
  - Interfaces: REST endpoints for `/auth/register`, `/auth/login`, `/auth/logout`.

- **User Service**: Manages user profile data including name, bio, and profile photo. Handles CRUD operations with ownership validation.
  - Interfaces: REST endpoints for `/users/me`, `/users/:id`, `PUT /users/me`.

- **Post Service**: Manages creation, retrieval, and deletion of text posts. Enforces authorship rules and supports chronological feed generation.
  - Interfaces: REST endpoints for `POST /posts`, `GET /posts`, `DELETE /posts/:id`.

- **Message Service**: Handles private messaging between users with sender/receiver validation and message persistence.
  - Interfaces: REST endpoints for `POST /messages`, `GET /messages?with=:userId`.

- **Frontend Application**: Single-page React application that renders UI components, manages client state, and communicates with backend services via API calls.
  - Interfaces: HTTP calls to backend API, browser storage for JWT.

- **Database Layer**: Centralized data store for all application entities with defined schemas and relationships.
  - Interfaces: ORM-based queries from services.

## Data Model
- **User**: id (PK), email (unique), password_hash, name, bio, photo_url, created_at
- **Post**: id (PK), content, author_id (FK → User.id), created_at
- **Message**: id (PK), content, sender_id (FK → User.id), recipient_id (FK → User.id), created_at

Relationships:
- User (1) → (N) Post (one-to-many)
- User (1) → (N) as sender → Message (one-to-many)
- User (1) → (N) as recipient → Message (one-to-many)

## API Contracts

### Auth Service
- `POST /auth/register`
  - Request: {"email": "string", "password": "string", "name": "string"}
  - Response: 201 Created, {"id": "number", "email": "string", "name": "string"}

- `POST /auth/login`
  - Request: {"email": "string", "password": "string"}
  - Response: 200 OK, {"token": "string", "user": {"id", "email", "name"}}

- `POST /auth/logout`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, {}

### User Service
- `GET /users/me`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, {"id", "email", "name", "bio", "photo_url"}

- `GET /users/:id`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, {"id", "name", "bio", "photo_url"} or 404 Not Found

- `PUT /users/me`
  - Request: Authorization: Bearer <t

[... truncated for brevity ...]

## Working Guidelines

- Read this file and README.md before starting any work
- Follow existing code patterns and conventions
- Write clean, production-quality code with proper error handling
- Create or update tests if a testing setup exists
- Do NOT run git commands — the pipeline handles commits and pushes
- Do NOT ask questions — you are running in an automated pipeline