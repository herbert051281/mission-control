# Mission Control Backend

Express.js + TypeScript REST API server for Mission Control.

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server will start on the port specified in `.env` (default: 3000).

### Testing

```bash
npm test              # Run tests once
npm run test:watch   # Run tests in watch mode
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── index.ts              # Express server entry point
└── __tests__/
    └── server.test.ts    # Server startup tests
dist/                     # Compiled JavaScript (after npm run build)
```

## Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Required variables:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_URL` - Database connection string
- `JWT_SECRET` - JWT signing secret

## API Endpoints

### Health Check
- `GET /health` - Returns server status

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript (strict mode)
- **Testing:** Jest
- **Type Safety:** @types/express, @types/node

## Development

TypeScript strict mode is enabled. All code must:
- Pass TypeScript type checking
- Pass Jest tests
- Follow proper typing with no implicit `any`

## Next Steps

See `/data/.openclaw/workspace/docs/plans/2026-03-25-mission-control-build.md` for the complete build plan.
