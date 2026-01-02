# API Faker

> Get a full fake REST API with **zero coding** in **less than 30 seconds** (seriously)

Created with ❤️ for front-end developers who need a quick back-end for prototyping and mocking.

## Features

- ✨ Zero coding required
- 🚀 Quick setup (< 30 seconds)
- 🔄 Full REST API with CRUD operations
- 🔍 Advanced filtering, sorting, and pagination
- 🔗 Relationship support (embed and expand)
- 📁 Static file serving
- 🔧 Highly customizable via CLI and programmatic API
- 💾 Automatic data persistence
- 🌐 CORS and JSONP support
- ⚡ Fast and lightweight

## Installation

```bash
# NPM
npm install -g api-faker

# Yarn
yarn global add api-faker

# PNPM
pnpm add -g api-faker
```

## Quick Start

Create a `db.json` file:

```json
{
  "posts": [
    { "id": 1, "title": "Hello World", "author": "John Doe" }
  ],
  "comments": [
    { "id": 1, "body": "Great post!", "postId": 1 }
  ]
}
```

Start the server:

```bash
api-faker --watch db.json
```

Access your API at `http://localhost:3000/posts/1`

## Documentation

Coming soon! Check the [ROADMAP.md](ROADMAP.md) for implementation progress.

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint
pnpm lint

# Format code
pnpm format
```

## License

MIT
