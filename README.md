# Secure Chat Application

A real-time chat application built with **Node.js**, **Express**, **WebSockets**, and **PostgreSQL**. The project implements user authentication, session management, secure password storage, and persistent chat history.

---

## Features

- User registration
- User login/logout
- Password hashing using bcrypt
- Session-based authentication
- Protected routes
- Real-time messaging using WebSockets
- Message persistence in PostgreSQL
- Session validation for WebSocket connections
- Cross-device support on the local network
- Custom 404 and 500 error pages

---

## Technologies

- Node.js
- Express
- WebSocket (ws)
- PostgreSQL
- express-session
- bcrypt
- dotenv

---

## Project Structure

```
project/
│
├── public/
│   ├── homepage.html
│   ├── login.html
│   ├── register.html
│   ├── chat.html
│   ├── app.js
│   ├── login.js
│   ├── register.js
│   ├── 404.html
│   └── 500.html
│
├── index.js
├── package.json
├── .env
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chat_app

SESSION_SECRET=your_session_secret
```

---

## Database

Create the required tables.

### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
```

### Messages

```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    sender_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Running the Project

Using Node:

```bash
node server.js
```

or with Nodemon:

```bash
npx nodemon server.js
```

Open your browser:

```
http://localhost:3000
```

---

## Authentication

The application uses **server-side sessions**.

After a successful login:

- the server creates a session
- the browser receives a session cookie
- subsequent requests automatically include the cookie
- protected routes verify the session before allowing access

Passwords are never stored in plain text. They are hashed using **bcrypt** before being saved to the database.

---

## WebSocket Authentication

WebSocket connections are authenticated by:

1. validating the request origin
2. loading the Express session during the WebSocket handshake
3. rejecting connections without a valid authenticated session

Each WebSocket connection stores:

- authenticated user ID
- authenticated username

Messages are therefore always associated with the authenticated user instead of trusting client-provided information.

---

## Security

Implemented:

- bcrypt password hashing
- parameterized SQL queries
- session authentication
- protected routes
- origin validation for WebSocket connections
- HttpOnly session cookies
- SameSite cookies
- server-side sender verification

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/register` | Register a new account |
| POST | `/api/login` | Authenticate user |
| POST | `/api/logout` | Destroy current session |

### Messages

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/messages` | Retrieve chat history (authenticated) |

---

## Pages

- `/` — Home
- `/register` — Registration
- `/login` — Login
- `/chat` — Protected chat page

---

## Future Improvements

- Remember Me functionality
- CSRF protection
- Persistent session store (PostgreSQL or Redis)
- Rate limiting
- Password reset
- User profile pictures
- Private messaging
- Message editing and deletion
- Online user list
- Typing indicators
- HTTPS deployment

---

## License

This project is intended for educational purposes.