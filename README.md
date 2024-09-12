Chit Chat
---------

**A secure, end-to-end encrypted instant messaging app.**

### Features

-   **End-to-End Encryption:** Ensures your messages remain private and protected from unauthorized access.
-   **Instant Messaging:** Real-time communication with friends and family, allowing for quick and efficient conversations.
-   **Read Receipts:** Know when your messages have been delivered and read, providing confirmation and peace of mind.

### Technologies Used

-   **Redis:** A high-performance in-memory data structure store, used for caching user and socket IDs to improve response times.
-   **MongoDB:** A flexible and scalable NoSQL database, ideal for storing user and message data in a structured format.
-   **Docker:** A containerization platform that simplifies the deployment and management of applications across different environments.
-   **React:** A popular JavaScript library for building user interfaces, providing a rich and interactive experience for users.
-   **Node.js:** A JavaScript runtime environment that allows for efficient server-side development, enabling real-time communication and handling asynchronous operations.

### Setup

**1\. Manual Setup**

-   **Prerequisites:**
    -   MongoDB and MySQL installed locally.
-   **Environment Variables:**
    -   Create a `.env` file in the `server` directory with the following variables:

        ```
        PORT=5000
        LOG_LEVEL=info
        JWT_SECRET=your_jwt_secret
        REDIS_PORT=6379
        REDIS_HOST=127.0.0.1
        DATABASE_URI=mongodb://127.0.0.1:27017/chit-chat
        CLIENT_URL=http://127.0.0.1:3000
        ```

    -   Create a `.env.local` file in the `client` directory with the following variable:

        ```
        SERVER_URL=http://127.0.0.1:5000
        ```

-   **Run the application:**
    -   Navigate to the `server` directory and run `npm install && npm run start`.
    -   Navigate to the `client` directory and run `npm install && npm start`.

**2\. Docker Compose Setup**

-   **Prerequisites:** Docker installed.
-   **Run the application:**
    -   Navigate to the project's root directory and run `docker-compose up -d`.
    -   Access the application at `http://127.0.0.1:8080`.

**Additional Notes:**

-   For production environments, consider using a cloud-based database service like MongoDB Atlas or AWS RDS for scalability and reliability.
-   Implement appropriate security measures, such as input validation and rate limiting, to protect against potential vulnerabilities.
-   Regularly update dependencies and patch security vulnerabilities to ensure the application's integrity.
