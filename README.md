# social-app

## Overview
The social-app is a full-stack web application enabling users to create accounts, manage profiles, publish and view posts, and exchange private messages. The system follows a client-server architecture with a RESTful API backend and a single-page application (SPA) frontend. The backend handles authentication, data persistence, and business logic, while the frontend provides an interactive user interface. Communication between components is stateless using JSON over HTTPS.


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


---

This project is managed by the SDLC Pipeline. Implementation tasks are tracked as GitHub/GitLab issues.
Each issue is solved by an autonomous agent on its own branch with a pull request.