# API Faker

> Get a full fake REST API with **zero coding** in **less than 30 seconds** (seriously)

Created with ❤️ for front-end developers who need a quick back-end for prototyping and mocking.

[![CI](https://github.com/hamidmayeli/rest_api_faker/actions/workflows/ci.yml/badge.svg)](https://github.com/hamidmayeli/rest_api_faker/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/hamidmayeli/rest_api_faker/branch/main/graph/badge.svg)](https://codecov.io/gh/hamidmayeli/rest_api_faker)
[![Tests](https://img.shields.io/badge/tests-223%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![npm version](https://img.shields.io/npm/v/rest_api_faker.svg)](https://www.npmjs.com/package/rest_api_faker)

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [CLI Options](#cli-options)
  - [Routes](#routes)
  - [Query Parameters](#query-parameters)
  - [Relationships](#relationships)
- [Configuration](#configuration)
- [Custom Routes & Middlewares](#custom-routes--middlewares)
- [Examples](#examples)
- [Programmatic Usage](#programmatic-usage)
- [Development](#development)
- [License](#license)

## Features

- ✨ **Zero coding required** - Start with a JSON file
- 🚀 **Quick setup** - Get an API running in < 30 seconds
- 🔄 **Full REST API** - Complete CRUD operations (GET, POST, PUT, PATCH, DELETE)
- 🔍 **Advanced filtering** - Filter by any property, use operators like \_gte, \_lte, \_like
- 📊 **Sorting & Pagination** - Sort by multiple fields, paginate with \_page and \_limit
- 🔗 **Relationships** - Embed child resources and expand parent resources
- 📁 **Static file serving** - Serve your HTML, CSS, and JS files
- 🎨 **URL rewriting** - Create custom routes and aliases
- 🔧 **Highly customizable** - CLI options and config file support
- 💾 **Auto-save** - Changes are automatically saved to your data file
- 🌐 **CORS enabled** - Ready for cross-origin requests
- ⚡ **Fast & lightweight** - Built with Express and TypeScript
- 🧪 **Well tested** - 214 tests with comprehensive coverage

## Installation

```bash
# NPM
npm install -g rest_api_faker

# Yarn
yarn global add rest_api_faker

# PNPM
pnpm add -g rest_api_faker
```

## Getting Started

**1. Create a `db.json` file:**

```json
{
  "posts": [
    { "id": 1, "title": "Hello World", "author": "John Doe" },
    { "id": 2, "title": "API Faker is awesome", "author": "Jane Smith" }
  ],
  "comments": [
    { "id": 1, "body": "Great post!", "postId": 1 },
    { "id": 2, "body": "Thanks for sharing", "postId": 1 }
  ],
  "profile": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**2. Start the server:**

```bash
rest_api_faker db.json
```

Or with watch mode to auto-reload on file changes:

```bash
rest_api_faker --watch db.json
```

**3. Access your API:**

```bash
# Get all posts
curl http://localhost:3000/posts

# Get a single post
curl http://localhost:3000/posts/1

# Get profile
curl http://localhost:3000/profile
```

That's it! 🎉 You now have a fully functional REST API.

## Usage

### CLI Options

```bash
rest_api_faker [options] <source>

Options:
  -c, --config <path>          Path to config file (default: "rest_api_faker.json")
  -p, --port <number>          Set port (default: 3000)
  -H, --host <string>          Set host (default: "localhost")
  -w, --watch                  Watch file(s) for changes
  -r, --routes <path>          Path to routes file (URL rewrite rules)
  -m, --middlewares <path>     Path to middleware file
  -s, --static <path>          Set static files directory (default: "./public")
  --no-static                  Disable static file serving
  --ro, --read-only            Allow only GET requests
  --nc, --no-cors              Disable Cross-Origin Resource Sharing
  --ng, --no-gzip              Disable GZIP Content-Encoding
  -S, --snapshots <path>       Set snapshots directory (default: ".")
  -d, --delay <ms>             Add delay to responses (ms)
  -i, --id <field>             Set database id property (default: "id")
  --fks <suffix>               Set foreign key suffix (default: "Id")
  -q, --quiet                  Suppress log messages
  -h, --help                   Show help
  -v, --version                Show version number

Examples:
  rest_api_faker db.json                    Start with db.json
  rest_api_faker --watch db.json            Start with auto-reload
  rest_api_faker --port 4000 db.json        Start on port 4000
  rest_api_faker file.js                    Use a JavaScript file
  rest_api_faker --routes routes.json       Use custom routes
```

### Routes

Based on your `db.json`, API Faker automatically creates the following routes:

#### Plural Resources

```
GET    /posts          # List all posts
GET    /posts/1        # Get post with id=1
POST   /posts          # Create a new post
PUT    /posts/1        # Replace post with id=1
PATCH  /posts/1        # Update post with id=1
DELETE /posts/1        # Delete post with id=1
```

#### Singular Resources

```
GET    /profile        # Get profile
POST   /profile        # Create/replace profile
PUT    /profile        # Replace profile
PATCH  /profile        # Update profile
```

#### Special Routes

```
GET    /db             # Get the full database
GET    /               # Homepage (serves index.html or shows available routes)
```

### Query Parameters

#### Filtering

Filter by any property:

```bash
# Posts with specific title
GET /posts?title=Hello World

# Multiple values (OR)
GET /posts?id=1&id=2

# Deep property access
GET /posts?author.name=John
```

#### Pagination

```bash
# Get page 2 with 10 items per page
GET /posts?_page=2&_limit=10

# Default limit is 10
GET /posts?_page=1
```

Returns `Link` header with `first`, `prev`, `next`, and `last` links.

#### Sorting

```bash
# Sort by title (ascending)
GET /posts?_sort=title

# Sort by title (descending)
GET /posts?_sort=title&_order=desc

# Sort by multiple fields
GET /posts?_sort=author,title&_order=desc,asc
```

#### Slicing

```bash
# Get items 20-30
GET /posts?_start=20&_end=30

# Get 10 items starting from 20
GET /posts?_start=20&_limit=10
```

Returns `X-Total-Count` header with the total number of items.

#### Operators

```bash
# Greater than or equal
GET /posts?views_gte=1000

# Less than or equal
GET /posts?views_lte=100

# Not equal
GET /posts?author_ne=John

# Like (supports RegExp)
GET /posts?title_like=server
```

#### Full-Text Search

```bash
# Search across all string fields
GET /posts?q=awesome
```

### Relationships

#### Embed Children

Use `_embed` to include child resources (based on foreign keys):

```bash
# Get post with embedded comments
GET /posts/1?_embed=comments

# Result:
{
  "id": 1,
  "title": "Hello World",
  "comments": [
    { "id": 1, "body": "Great post!", "postId": 1 }
  ]
}
```

#### Expand Parent

Use `_expand` to include parent resource:

```bash
# Get comment with expanded post
GET /comments/1?_expand=post

# Result:
{
  "id": 1,
  "body": "Great post!",
  "postId": 1,
  "post": { "id": 1, "title": "Hello World" }
}
```

#### Nested Routes

```bash
# Get all comments for post 1
GET /posts/1/comments

# Create a comment for post 1
POST /posts/1/comments
{
  "body": "New comment"
}
# postId will be automatically set to 1
```

## Configuration

You can use a configuration file instead of CLI options. Create an `rest_api_faker.json` file:

```json
{
  "port": 3000,
  "host": "localhost",
  "watch": true,
  "routes": "routes.json",
  "middlewares": "middleware.js",
  "static": "./public",
  "readOnly": false,
  "noCors": false,
  "noGzip": false,
  "delay": 0,
  "id": "id",
  "foreignKeySuffix": "Id",
  "quiet": false
}
```

Then simply run:

```bash
rest_api_faker db.json
```

**Using a custom config file:**

```bash
rest_api_faker db.json --config my-config.json
```

**Note:** CLI arguments override config file values.

## Custom Routes & Middlewares

### Custom Routes (URL Rewriting)

Create a `routes.json` file with URL rewrite rules:

```json
{
  "/api/*": "/$1",
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category",
  "/me": "/profile"
}
```

Use it:

```bash
rest_api_faker db.json --routes routes.json
```

Now you can access:

- `/api/posts` → `/posts`
- `/posts/1/show` → `/posts/1`
- `/posts/tech` → `/posts?category=tech`
- `/me` → `/profile`

### Custom Middlewares

Create a `middleware.js` file:

```javascript
module.exports = function (req, res, next) {
  // Add custom header
  res.setHeader('X-Custom-API', 'API Faker');

  // Log request
  console.log(`${req.method} ${req.url}`);

  // Continue
  next();
};
```

Use it:

```bash
rest_api_faker db.json --middlewares middleware.js
```

See [examples/README.md](examples/README.md) for more examples.

## Examples

### Basic Usage

```bash
# Start with default settings
rest_api_faker db.json

# Start with watch mode
rest_api_faker --watch db.json

# Start on a different port
rest_api_faker --port 4000 db.json

# Read-only mode (only GET requests)
rest_api_faker --read-only db.json

# Add delay to all responses (useful for testing loading states)
rest_api_faker --delay 1000 db.json
```

### Using JavaScript for Dynamic Data

Create a `db.js` file:

```javascript
module.exports = function () {
  const data = {
    users: [],
    posts: [],
  };

  // Generate 100 users
  for (let i = 1; i <= 100; i++) {
    data.users.push({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    });
  }

  // Generate 500 posts
  for (let i = 1; i <= 500; i++) {
    data.posts.push({
      id: i,
      title: `Post ${i}`,
      userId: Math.ceil(Math.random() * 100),
    });
  }

  return data;
};
```

Start the server:

```bash
rest_api_faker db.js
```

**Tip:** Use libraries like [Faker.js](https://fakerjs.dev/) for more realistic data.

### Authentication Example

Create an authentication middleware:

```javascript
// auth-middleware.js
module.exports = function (req, res, next) {
  // Allow all GET requests
  if (req.method === 'GET') {
    return next();
  }

  // Check for authorization token
  const token = req.headers.authorization;

  if (!token || token !== 'Bearer secret-token') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Please provide a valid authorization token',
    });
  }

  next();
};
```

Use it:

```bash
rest_api_faker db.json --middlewares auth-middleware.js
```

Now all POST, PUT, PATCH, DELETE requests require the `Authorization: Bearer secret-token` header.

### Deployment

**Vercel:**

Create a `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

Create a `server.js`:

```javascript
const jsonServer = require('rest_api_faker');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

module.exports = server;
```

Deploy:

```bash
vercel
```

**Heroku:**

Create a `Procfile`:

```
web: node server.js
```

Create a `server.js`:

```javascript
const jsonServer = require('rest_api_faker');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);
server.listen(port, () => {
  console.log(`API Faker is running on port ${port}`);
});
```

Deploy:

```bash
git init
git add .
git commit -m "Initial commit"
heroku create
git push heroku main
```

## Programmatic Usage

You can also use API Faker programmatically in your Node.js applications:

```javascript
const jsonServer = require('rest_api_faker');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(router);

server.listen(3000, () => {
  console.log('API Faker is running');
});
```

**Note:** Full programmatic API is coming in a future release.

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

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © 2026

## Acknowledgments

Inspired by [json-server](https://github.com/typicode/json-server) by [typicode](https://github.com/typicode).

---

**Happy Mocking! 🚀**
