Below is an updated Product Development Specification Document that now includes support for optional expiration dates for shortened URLs.

---

# URL Shortener Service  
**Product Development Specification Document**

---

## 1. Project Overview

The URL Shortener Service is a RESTful API that converts long URLs into compact, shareable links. In addition to URL shortening, redirection, authentication, subscription-based authorization, and analytics tracking, the service now allows users to optionally specify expiration dates for shortened URLs. This feature enables enhanced control over link lifespan, catering to both temporary and permanent use cases.

---

## 2. Business Objectives

- **Improve Shareability:** Enable users to convert long URLs into concise, easily shareable links.
- **Enhance User Engagement:** Provide detailed click analytics and tracking information.
- **Drive Revenue:** Introduce subscription-based premium features to monetize advanced functionalities.
- **Ensure Security & Control:** Implement secure authentication and enforce authorization based on user subscription levels.
- **Flexible URL Lifespan:** Allow users to define an expiration date for their shortened URLs, ensuring time-sensitive content can be managed effectively.
- **Maintain High Performance:** Utilize caching, rate limiting, and modular architecture to ensure scalability and reliability.

---

## 3. Functional Requirements

### 3.1. URL Shortening & Redirection
- **URL Creation:**  
  - Endpoint to accept a long URL with an optional custom alias and optional expiration date.
  - Validate input and ensure uniqueness of custom aliases.
  - If an expiration date is provided, ensure that it is a valid future date.
- **Redirection:**  
  - Resolve the short URL by first checking a Redis cache, then querying the database.
  - If the URL has an expiration date, verify that the current date is before the expiration.
  - Log each click for analytics and issue HTTP 302 redirects.

### 3.2. User Authentication & Authorization
- **User Authentication:**  
  - Secure registration and login endpoints using JWT for session management.
  - Encrypt passwords and manage user sessions.
- **Subscription Plans & Authorization:**  
  - Allow users to subscribe to various plans (e.g., Free, Premium, Enterprise).
  - **Free Tier:** Basic URL shortening and redirection.
  - **Premium Tiers:** Access to features such as custom alias creation, detailed analytics, and the ability to set optional expiration dates.
  - Authorization middleware to enforce access controls based on the user's subscription plan.

### 3.3. Analytics & Tracking
- **Click Tracking:**  
  - Log details (timestamp, visitor IP, user-agent) for every click.
- **Analytics Retrieval:**  
  - Provide endpoints for retrieving click counts and detailed usage statistics per URL.
  - Enhanced reporting for premium users, including trend analysis and additional metrics.

### 3.4. Rate Limiting & Error Handling
- **Rate Limiting:**  
  - Implement limits per IP to prevent abuse of the API.
- **Error Handling:**  
  - Standardized error responses and comprehensive logging for troubleshooting.

### 3.5. API Documentation
- Auto-generated, interactive API documentation using Swagger (OpenAPI) to ensure developers have clear, up-to-date references.

---

## 4. Technical Requirements

### 4.1. Tech Stack
- **Backend Framework:** NestJS  
- **Language:** TypeScript  
- **Database:** PostgreSQL or MongoDB (based on performance and scalability needs)  
- **Caching:** Redis  
- **API Documentation:** Swagger via NestJS Swagger module  
- **Authentication:** JWT for secure session handling  
- **Testing:** Jest for unit and integration testing  

### 4.2. Development Environment
- **Node.js:** Version 14 or higher  
- **Package Manager:** npm or yarn  
- **Environment Variables:** Managed via a `.env` file (e.g., PORT, DATABASE_URL, REDIS_HOST, REDIS_PORT, JWT_SECRET)

---

## 5. System Architecture Overview

The system is built using a modular architecture for maintainability and scalability:

- **URL Module:**  
  - Manages URL shortening, redirection logic, input validation, and optional expiration date handling.
  
- **Analytics Module:**  
  - Handles logging and retrieval of click data for each URL.
  
- **User & Subscription Module:**  
  - **Authentication Submodule:** Manages user registration, login, and JWT-based session management.
  - **Subscription Submodule:** Manages subscription plans, billing integrations, and enforces authorization rules based on the active plan.
  
- **Middleware:**  
  - **Caching:** Uses Redis to reduce database load.
  - **Rate Limiting:** Applies request limits via NestJS interceptors or third-party libraries.

### Request Flow
1. **User Authentication:**  
   - A new user registers or logs in to obtain a secure token.
2. **URL Creation:**  
   - Authenticated users submit a POST request with the long URL, optional custom alias, and optional expiration date.
   - The service validates the input, processes the expiration date if provided, and stores the mapping.
3. **Redirection:**  
   - A GET request with the short URL alias triggers a Redis cache lookup, falls back to the database if necessary, checks for expiration, logs the click, and then issues a 302 redirect.
4. **Analytics & Subscription Management:**  
   - Dedicated endpoints provide detailed analytics for premium users.
   - Subscription endpoints allow users to view, update, or change their subscription plans, with authorization rules controlling access to premium features.

---

## 6. API Endpoints

### 6.1. User Authentication & Subscription
- **User Registration/Login:**  
  - **URL:** `/api/auth/register` and `/api/auth/login`  
  - **Methods:** POST  
  - **Details:** Accepts user credentials and returns a JWT token for session management.
  
- **Subscription Management:**  
  - **URL:** `/api/subscriptions`  
  - **Method:** GET, POST, PATCH  
  - **Details:** Endpoints to subscribe, upgrade, or manage subscription plans, ensuring authorization is applied based on the plan type.

### 6.2. Create Short URL
- **URL:** `/api/urls`
- **Method:** POST  
- **Body Parameters:**
  - `longUrl` (string): The original URL.
  - `customAlias` (optional, string): Requested alias (only for authorized/premium users).
  - `expirationDate` (optional, string in ISO 8601 format): The date and time when the URL should expire.
- **Response Example:**
  ```json
  {
    "id": "uuid",
    "shortUrl": "http://localhost:3000/abc123",
    "longUrl": "https://example.com/some-long-url",
    "expirationDate": "2025-03-01T00:00:00.000Z",
    "createdAt": "2025-02-19T12:34:56.789Z"
  }
  ```

### 6.3. Redirect to Long URL
- **URL:** `/:alias`
- **Method:** GET  
- **Behavior:**
  - Lookup the alias in Redis cache; if not found, query the database.
  - Check if an expiration date exists and ensure the URL is still valid.
  - Log click details.
  - Issue a 302 redirect to the original URL if valid, otherwise return an appropriate error (e.g., 410 Gone if expired).

### 6.4. Retrieve URL Analytics
- **URL:** `/api/urls/:alias/analytics`
- **Method:** GET  
- **Response Example:**
  ```json
  {
    "alias": "abc123",
    "clickCount": 150,
    "analytics": [
      {
        "timestamp": "2025-02-19T12:34:56.789Z",
        "ip": "192.168.0.1",
        "userAgent": "Mozilla/5.0..."
      }
    ]
  }
  ```
- **Access:** Detailed analytics are gated behind subscription-based authorization.

### 6.5. Additional Endpoints
- **Admin Operations:**  
  - For monitoring system usage and managing service configurations.
- **User Dashboard:**  
  - An optional front-end integration to allow users to view their URLs, analytics, and manage their subscriptions.

---

## 7. Data Model & Database Design

### 7.1. URL Entity/Table
- **id:** UUID/Auto Increment (Primary Key)
- **longUrl:** VARCHAR/Text (Original URL)
- **alias:** VARCHAR (Unique short alias)
- **expirationDate:** TIMESTAMP (Optional expiration date for the shortened URL)
- **createdAt:** TIMESTAMP (Creation timestamp)

### 7.2. Analytics Entity/Table
- **id:** UUID/Auto Increment (Primary Key)
- **urlId:** UUID (Foreign key referencing the URL entity)
- **timestamp:** TIMESTAMP (Time of click)
- **ip:** VARCHAR (Visitor IP)
- **userAgent:** VARCHAR (Browser/User-Agent information)

### 7.3. User & Subscription Tables
- **User Table:**  
  - **id:** UUID/Auto Increment (Primary Key)
  - **email:** VARCHAR (Unique user email)
  - **passwordHash:** VARCHAR (Encrypted password)
  - **createdAt:** TIMESTAMP (Registration timestamp)
- **Subscription Table:**  
  - **id:** UUID/Auto Increment (Primary Key)
  - **userId:** UUID (Foreign key referencing User)
  - **planType:** ENUM ('Free', 'Premium', 'Enterprise')
  - **activeUntil:** TIMESTAMP (Subscription expiry/renewal date)
  - **status:** ENUM ('Active', 'Canceled', 'Expired')

---

## 8. Performance & Scalability Considerations

- **Caching:**  
  - Redis is used to cache URL mappings, significantly reducing database calls.
- **Rate Limiting:**  
  - Implement global and endpoint-specific limits to mitigate abuse.
- **Scalability:**  
  - The modular architecture and containerization enable horizontal scaling.
- **Subscription & Authorization:**  
  - Efficiently query and enforce access controls based on user subscription status.
- **Expiration Handling:**  
  - Implement background tasks or scheduled jobs to periodically clear expired URLs, optimizing database performance.

---

## 9. Testing & Quality Assurance

- **Unit Testing:**  
  - Use Jest to test individual modules including URL logic (with expiration validation), authentication, and subscription management.
- **Integration Testing:**  
  - Validate API endpoints using Supertest to ensure end-to-end functionality, especially around expiration behavior.
- **Continuous Integration:**  
  - Set up CI pipelines to run automated tests on every commit and pull request.

---

## 10. Deployment & DevOps

- **Containerization:**  
  - Build a Dockerfile for the NestJS application and use Docker Compose for orchestrating services (database, Redis).
- **Environment Variables:**  
  - Securely manage configuration details via environment variables.
- **Deployment Options:**  
  - Deploy on cloud platforms (Heroku, AWS, DigitalOcean) with CI/CD pipelines for streamlined deployments.
- **Monitoring & Logging:**  
  - Integrate Prometheus and Grafana for real-time monitoring and use centralized logging for production troubleshooting.

---

## 11. Future Enhancements

- **Custom Domain Support:**  
  - Enable users to use their own domains for shortened URLs.
- **QR Code Generation:**  
  - Automatically generate QR codes for each shortened URL.
- **Advanced Analytics:**  
  - Offer enhanced visualization such as heatmaps and geographic data analytics.
- **User Dashboard:**  
  - Provide a comprehensive front-end for managing URLs, subscriptions, and viewing detailed analytics.
- **Additional Expiration Options:**  
  - Introduce more flexible expiration settings such as temporary access windows or auto-renewal options for premium users.

---

## 12. Project Timeline & Milestones

A high-level timeline includes:
- **Phase 1:** Requirements Analysis & Architecture Design  
- **Phase 2:** API and Module Development (URL, Analytics, User/Subscription)  
- **Phase 3:** Integration of Caching, Rate Limiting, Authorization, and Expiration Handling  
- **Phase 4:** Comprehensive Testing (Unit & Integration)  
- **Phase 5:** Deployment & Monitoring Setup  
- **Phase 6:** Beta Launch and Iterative Feedback  
- **Phase 7:** Final Release and Documentation Handoff

---

## 13. Risks & Mitigations

- **Scalability Concerns:**  
  - Mitigation: Leverage containerization and cloud scaling solutions.
- **Security Vulnerabilities:**  
  - Mitigation: Implement best practices in encryption, input validation, and JWT-based authentication.
- **Subscription Management Complexity:**  
  - Mitigation: Thoroughly test subscription flows and authorization logic.
- **Expiration Management:**  
  - Mitigation: Ensure robust validation and periodic cleanup processes to handle expired URLs without impacting system performance.

---

This updated document outlines the comprehensive vision and technical specifications for the URL Shortener Service, now enhanced with optional expiration dates for shortened URLs. Please review and provide feedback or additional requirements as needed before development begins.

---