# KV Store

Luat includes a built-in Key-Value store with a familiar, industry-standard API. The KV store is only available in server-side contexts (`+page.server.lua`, `+server.lua`).

## Overview

The KV store provides persistent data storage for your Luat applications:

- **CLI**: SQLite-backed storage (persists across restarts)
- **WASM**: In-memory storage (persists within the browser session)

## Basic Usage

```lua
-- Get a namespace
local kv = KV.namespace("my-namespace")

-- Store a value
kv:put("user:123", "Alice")

-- Retrieve a value
local name = kv:get("user:123")
print(name)  -- "Alice"

-- Delete a value
kv:delete("user:123")
```

## API Reference

### KV.namespace(name)

Creates or retrieves a KV namespace. Namespaces isolate data between different parts of your application.

```lua
local users = KV.namespace("users")
local posts = KV.namespace("posts")

-- Data in "users" namespace doesn't affect "posts" namespace
users:put("key", "value1")
posts:put("key", "value2")
```

### kv:get(key, type?)

Retrieves a value by key.

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | string | The key to retrieve |
| `type` | string? | Optional type hint: `"text"` (default), `"json"`, or `"arrayBuffer"` |

```lua
-- Get as text (default)
local value = kv:get("key")

-- Get and parse as JSON
local data = kv:get("config", "json")
print(data.setting)

-- Non-existent keys return nil
local missing = kv:get("nonexistent")  -- nil
```

### kv:getWithMetadata(key, type?)

Retrieves a value along with its metadata.

```lua
local value, meta = kv:getWithMetadata("key")

if value then
    print(value)
    print(meta.expiration)  -- Unix timestamp or nil
    print(meta.metadata)    -- Custom metadata table or nil
end
```

### kv:put(key, value, options?)

Stores a value with optional expiration and metadata.

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | string | The key to store |
| `value` | string/table | The value (tables are JSON-serialized) |
| `options` | table? | Optional settings |

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `expiration` | number | Unix timestamp when entry expires |
| `expirationTtl` | number | Seconds from now until expiration |
| `metadata` | table | Arbitrary JSON metadata |

```lua
-- Simple put
kv:put("key", "value")

-- Put with TTL (expires in 1 hour)
kv:put("session:abc", "data", {
    expirationTtl = 3600
})

-- Put with specific expiration
kv:put("token:xyz", "secret", {
    expiration = os.time() + 86400  -- Tomorrow
})

-- Put with metadata
kv:put("post:123", json.encode(post), {
    metadata = {
        author = "alice",
        created = os.time()
    }
})
```

### kv:delete(key)

Deletes a key. No error is raised if the key doesn't exist.

```lua
kv:delete("key")
```

### kv:list(options?)

Lists keys with optional filtering and pagination.

| Option | Type | Description |
|--------|------|-------------|
| `prefix` | string | Only return keys starting with prefix |
| `limit` | number | Maximum keys to return (default: 1000) |
| `cursor` | string | Pagination cursor from previous call |

Returns a table with:
- `keys`: Array of key info objects
- `list_complete`: Boolean indicating if all keys returned
- `cursor`: Pagination cursor (if more keys exist)

```lua
-- List all keys
local result = kv:list()
for _, key in ipairs(result.keys) do
    print(key.name)
end

-- List with prefix
local posts = kv:list({ prefix = "post:" })
for _, key in ipairs(posts.keys) do
    print(key.name)       -- e.g., "post:123"
    print(key.expiration) -- Unix timestamp or nil
    print(key.metadata)   -- Metadata table or nil
end

-- Pagination
local page1 = kv:list({ limit = 100 })
if not page1.list_complete then
    local page2 = kv:list({
        limit = 100,
        cursor = page1.cursor
    })
end
```

## Examples

### Session Storage

```lua
-- src/lib/session.lua
local kv = KV.namespace("sessions")

local M = {}

function M.create(user_id)
    local session_id = generate_id()
    kv:put("session:" .. session_id, json.encode({
        user_id = user_id,
        created = os.time()
    }), {
        expirationTtl = 86400  -- 24 hours
    })
    return session_id
end

function M.get(session_id)
    return kv:get("session:" .. session_id, "json")
end

function M.destroy(session_id)
    kv:delete("session:" .. session_id)
end

return M
```

### Caching API Responses

```lua
-- src/routes/api/posts/+server.lua
local kv = KV.namespace("cache")

function GET(ctx)
    -- Check cache first
    local cached = kv:get("posts:all", "json")
    if cached then
        return {
            status = 200,
            body = cached,
            headers = { ["X-Cache"] = "HIT" }
        }
    end

    -- Fetch from database
    local posts = fetch_posts_from_db()

    -- Cache for 5 minutes
    kv:put("posts:all", json.encode(posts), {
        expirationTtl = 300
    })

    return {
        status = 200,
        body = posts,
        headers = { ["X-Cache"] = "MISS" }
    }
end
```

### Blog with Persistent Storage

```lua
-- src/lib/blog.lua
local kv = KV.namespace("blog")

local M = {}

function M.get_posts()
    local result = kv:list({ prefix = "post:" })
    local posts = {}

    for _, key in ipairs(result.keys) do
        local post = kv:get(key.name, "json")
        if post then
            table.insert(posts, post)
        end
    end

    return posts
end

function M.get_post(slug)
    return kv:get("post:" .. slug, "json")
end

function M.create_post(post)
    post.created = os.time()
    kv:put("post:" .. post.slug, json.encode(post), {
        metadata = {
            author = post.author,
            created = post.created
        }
    })
    return post
end

function M.update_post(slug, data)
    local existing = M.get_post(slug)
    if not existing then
        return nil, "Post not found"
    end

    for k, v in pairs(data) do
        existing[k] = v
    end
    existing.updated = os.time()

    kv:put("post:" .. slug, json.encode(existing))
    return existing
end

function M.delete_post(slug)
    kv:delete("post:" .. slug)
end

return M
```

### Using with Form Actions

```lua
-- src/routes/blog/[slug]/edit/+page.server.lua
local blog = require("blog")

function load(ctx)
    local post = blog.get_post(ctx.params.slug)
    if not post then
        return { error = "Post not found", status = 404 }
    end
    return { post = post }
end

actions = {
    default = function(ctx)
        local result, err = blog.update_post(ctx.params.slug, {
            title = ctx.form.title,
            content = ctx.form.content
        })

        if err then
            return fail(400, { error = err })
        end

        return { saved = true }
    end,

    delete = function(ctx)
        blog.delete_post(ctx.params.slug)
        return { redirect = "/blog" }
    end
}
```

## Storage Location

### CLI

Data is stored in SQLite at `.luat/data/kv.db` relative to your project root. You can configure this in `luat.toml`:

```toml
[routing]
data_dir = ".luat/data"
```

### WASM

Data is stored in memory and persists for the duration of the WasmEngine instance. In browser environments, data is lost on page refresh.

## Best Practices

1. **Use namespaces** to organize data logically (e.g., `"sessions"`, `"cache"`, `"posts"`)

2. **Set expiration** for cache entries to prevent stale data:
   ```lua
   kv:put("cache:key", data, { expirationTtl = 3600 })
   ```

3. **Use prefixes** for related keys to enable efficient listing:
   ```lua
   kv:put("user:123:profile", ...)
   kv:put("user:123:settings", ...)
   kv:list({ prefix = "user:123:" })
   ```

4. **Store metadata** for debugging and auditing:
   ```lua
   kv:put("doc:abc", content, {
       metadata = { author = user_id, version = 1 }
   })
   ```

5. **Handle missing keys** gracefully:
   ```lua
   local data = kv:get("key", "json") or {}
   ```
