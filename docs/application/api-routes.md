# API Routes

API routes in Luat are created using `+server.lua` files. These files handle HTTP requests and return JSON responses, making it easy to build APIs alongside your pages.

## Basic API Route

Create a `+server.lua` file in your routes directory:

```lua
-- src/routes/api/hello/+server.lua

function GET(ctx)
    return {
        status = 200,
        body = {
            message = "Hello, World!"
        }
    }
end
```

This creates an endpoint at `/api/hello` that responds to GET requests.

## HTTP Methods

Export functions named after HTTP methods to handle different request types:

```lua
-- src/routes/api/users/+server.lua

-- GET /api/users - List all users
function GET(ctx)
    return {
        status = 200,
        body = {
            users = {
                { id = 1, name = "Alice" },
                { id = 2, name = "Bob" }
            }
        }
    }
end

-- POST /api/users - Create a new user
function POST(ctx)
    local data = ctx.body
    -- Create user logic here
    return {
        status = 201,
        body = {
            id = 3,
            name = data.name,
            created = true
        }
    }
end

-- PUT /api/users - Update a user
function PUT(ctx)
    local data = ctx.body
    return {
        status = 200,
        body = { updated = true }
    }
end

-- DELETE /api/users - Delete a user
function DELETE(ctx)
    return {
        status = 204,
        body = nil
    }
end

-- PATCH /api/users - Partially update a user
function PATCH(ctx)
    return {
        status = 200,
        body = { patched = true }
    }
end
```

## Response Format

API route functions return a table with:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | number | Yes | HTTP status code |
| `body` | table/nil | No | Response body (auto-serialized to JSON) |
| `headers` | table | No | Additional response headers |

### Setting Custom Headers

```lua
function GET(ctx)
    return {
        status = 200,
        body = { data = "example" },
        headers = {
            ["Cache-Control"] = "max-age=3600",
            ["X-Custom-Header"] = "value"
        }
    }
end
```

## Context Object

The `ctx` parameter provides access to request information:

```lua
function GET(ctx)
    -- URL parameters from dynamic routes
    local userId = ctx.params.id

    -- Query string parameters (?name=value)
    local search = ctx.query.search

    -- Request headers
    local authHeader = ctx.headers["Authorization"]

    -- Request URL
    local url = ctx.url

    return {
        status = 200,
        body = { userId = userId }
    }
end

function POST(ctx)
    -- Request body (parsed JSON)
    local data = ctx.body
    local name = data.name
    local email = data.email

    return {
        status = 201,
        body = { received = data }
    }
end
```

## Dynamic API Routes

Use dynamic route parameters for resource-specific endpoints:

```lua
-- src/routes/api/users/[id]/+server.lua

function GET(ctx)
    local userId = ctx.params.id

    -- Fetch user by ID
    local user = { id = userId, name = "User " .. userId }

    if not user then
        return {
            status = 404,
            body = { error = "User not found" }
        }
    end

    return {
        status = 200,
        body = user
    }
end

function DELETE(ctx)
    local userId = ctx.params.id

    -- Delete user logic

    return {
        status = 204,
        body = nil
    }
end
```

## Error Handling

Return appropriate status codes for errors:

```lua
function GET(ctx)
    local id = ctx.params.id

    -- Validate input
    if not id or id == "" then
        return {
            status = 400,
            body = { error = "ID is required" }
        }
    end

    -- Check authorization
    local token = ctx.headers["Authorization"]
    if not token then
        return {
            status = 401,
            body = { error = "Unauthorized" }
        }
    end

    -- Resource not found
    local resource = findResource(id)
    if not resource then
        return {
            status = 404,
            body = { error = "Resource not found" }
        }
    end

    -- Server error
    local success, err = pcall(function()
        -- risky operation
    end)
    if not success then
        return {
            status = 500,
            body = { error = "Internal server error" }
        }
    end

    return {
        status = 200,
        body = resource
    }
end
```

## Common Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating a resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected errors |

## API Route Organization

Organize your API routes logically:

```
src/routes/api/
├── auth/
│   ├── login/+server.lua      # POST /api/auth/login
│   └── logout/+server.lua     # POST /api/auth/logout
├── users/
│   ├── +server.lua            # GET, POST /api/users
│   └── [id]/
│       └── +server.lua        # GET, PUT, DELETE /api/users/:id
└── posts/
    ├── +server.lua            # GET, POST /api/posts
    └── [slug]/
        └── +server.lua        # GET, PUT, DELETE /api/posts/:slug
```
