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
  - Request: Authorization: Bearer <token>, {"name"?: "string", "bio"?: "string", "photo_url"?: "string"}
  - Response: 200 OK, {"id", "name", "bio", "photo_url"}

### Post Service
- `POST /posts`
  - Request: Authorization: Bearer <token>, {"content": "string"}
  - Response: 201 Created, {"id", "content", "author": {"id", "name"}, "created_at"}

- `GET /posts?limit=10&offset=0`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, [{"id", "content", "author": {"id", "name"}, "created_at"}, ...]

- `DELETE /posts/:id`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, {} or 403 Forbidden (if not owner) or 404 Not Found

### Message Service
- `POST /messages`
  - Request: Authorization: Bearer <token>, {"recipient_id": "number", "content": "string"}
  - Response: 201 Created, {"id", "content", "sender_id", "recipient_id", "created_at"}

- `GET /messages?with=:userId`
  - Request: Authorization: Bearer <token>
  - Response: 200 OK, [{"id", "content", "sender_id", "created_at"}, ...]

## Technology Stack
- **Frontend**: React with TypeScript
  - Justification: Industry standard for SPAs, strong typing reduces bugs, large ecosystem.

- **Backend**: Node.js with Express
  - Justification: JavaScript full-stack consistency, non-blocking I/O for concurrent requests, mature framework.

- **Database**: PostgreSQL
  - Justification: Relational integrity for user/post/message relationships, JSON support, ACID compliance.

- **Authentication**: JWT (stateless tokens)
  - Justification: Stateless scaling, standard format, supports token expiration and refresh.

- **ORM**: Prisma
  - Justification: Type-safe database queries, auto-generated migrations, excellent TypeScript support.

- **Image Storage**: Cloudinary (external service)
  - Justification: Scalable media handling, CDN delivery, built-in transformation and optimization.

## Data Flow
1. User submits login form in Frontend Application.
2. Frontend sends POST /auth/login request with credentials to Auth Service.
3. Auth Service validates credentials against Database Layer using User model.
4. On success, Auth Service generates JWT and returns it in response.
5. Frontend stores JWT in memory and redirects to feed.
6. Frontend calls GET /posts with Authorization header.
7. Post Service retrieves posts with author data via Database Layer.
8. Post Service returns JSON response to Frontend.
9. Frontend renders posts in UI.
10. User creates a post via form; Frontend sends POST /posts with JWT.
11. Post Service validates JWT, creates Post record with author_id, saves to Database.
12. Success response triggers UI update.

## Security Considerations
- Passwords are hashed using bcrypt before storage.
- JWTs are signed and short-lived; refresh tokens can be implemented later.
- All endpoints require authentication via JWT (except registration/login).
- Authorization checks ensure users can only modify their own data.
- Input validation on all endpoints to prevent injection attacks.
- Rate limiting on authentication endpoints to prevent brute force.
- HTTPS enforced in production.
- Error messages avoid revealing system details (e.g., generic 'Invalid credentials').
- CORS configured to allow only trusted frontend origins.

## Scalability Notes
- Stateless services (using JWT) enable horizontal scaling.
- Database can be read-replicated; write master handles consistency.
- Redis cache can be added for frequent queries (e.g., user profiles, feed).
- Message queue (e.g., RabbitMQ) can decouple intensive operations like notifications.
- Static assets and images served via CDN.
- Microservices can split services by domain (auth, user, post, message) when load increases.
- Load balancer distributes traffic across multiple service instances.
- Database indexing on foreign keys (author_id, sender_id, etc.) ensures query performance.