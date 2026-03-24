# Pacific Gamers - Elite 4K Gaming Universe

A professional Node.js web application for a premium gaming store. This project features a modular backend, secure administration, and an immersive user interface.

## 🚀 Features

- **Modular Backend**: Clean separation of routes, models, and controllers for high maintainability.
- **Security**:
  - `helmet` for secure HTTP headers.
  - `express-rate-limit` for DDoS and brute-force protection.
  - `compression` for optimized asset delivery.
- **Dynamic Shop**: Integrated SQLite database for real-time inventory management.
- **Admin Dashboard**: Full CRUD (Create, Read, Update, Delete) for products and order management.
- **Premium UI**: Immersive design with 4K video showcases and high-performance animations.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Dev Tools**: `dotenv`, `morgan`, `nodemon`, `bcryptjs`

## 📦 Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example` for reference).
4. Start the server:
   ```bash
   npm start
   ```

## 📂 Project Structure

```text
├── data/           # SQLite database
├── img/            # Optimized product images
├── src/            # Backend source code
│   ├── middleware/ # Custom Express middleware
│   ├── models/     # Database utilities
│   ├── routes/     # API route definitions
│   └── utils/      # Shared utilities (logger, etc.)
├── server.js       # Main entry point
└── package.json    # Project dependencies
```

## 📜 License

© 2026 Pacific Gamers. All rights reserved.
