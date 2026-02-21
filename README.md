# Social Network

A full-stack social network application with real-time messaging, friend management, and post feeds.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite with Prisma ORM
- **Real-time:** Socket.IO

## Features

- User authentication (register / login)
- Create, like, and delete posts
- Comment on posts
- Friend requests (send, accept, decline, cancel)
- Real-time private messaging with read receipts
- User profiles with editable bio and profile picture
- Dark mode support
- Message notifications

## Screenshots

_Coming soon_

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd social-network

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install server dependencies
cd ../server
npm install
```

### Environment Setup

```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Server — create server/.env with your config
# DATABASE_URL and JWT_SECRET are required
```

### Database Setup

```bash
cd server
npx prisma migrate dev
```

### Running

```bash
# Start the backend (from server/)
cd server
npm run dev

# Start the frontend (from frontend/)
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and the API on `http://localhost:8000`.

## Project Structure

```
social-network/
├── frontend/               # Next.js frontend
│   ├── app/                # Pages (App Router)
│   │   ├── feed/           # Post feed
│   │   ├── friends/        # Friends management
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   ├── messages/       # Conversations & chat
│   │   └── profile/        # User profiles
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/                 # Express backend
│   ├── controllers/        # Route handlers
│   ├── routes/             # API route definitions
│   ├── middlewares/        # Express middleware
│   ├── prisma/             # Database schema & migrations
│   └── uploads/            # User-uploaded files
└── README.md
```

## License

MIT
