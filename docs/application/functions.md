# Loading Data

Luat provides server-side data loading through `+page.server.lua` files. These files run on the server before rendering and pass data to your templates.

## Basic Data Loading

Create a `+page.server.lua` file next to your `+page.luat`:

```lua
-- src/routes/+page.server.lua
function load(ctx)
    return {
        title = "Home",
        message = "Welcome to my site!"
    }
end
```

The returned data is available as `props` in your template:

```html
<!-- src/routes/+page.luat -->
<h1>{props.title}</h1>
<p>{props.message}</p>
```

## The load() Function

Every `+page.server.lua` must export a `load()` function that receives a context object and returns data.

### Context Object (ctx)

The `ctx` parameter provides access to request information:

```lua
function load(ctx)
    -- URL parameters from dynamic routes
    local slug = ctx.params.slug

    -- Query string parameters (?search=term)
    local searchTerm = ctx.query.search

    -- Request URL
    local url = ctx.url

    -- Request headers
    local authToken = ctx.headers["Authorization"]

    return {
        slug = slug,
        searchTerm = searchTerm
    }
end
```

### Return Value

Return a Lua table with any data your template needs:

```lua
function load(ctx)
    return {
        title = "Blog",
        posts = {
            { id = 1, title = "First Post", slug = "first-post" },
            { id = 2, title = "Second Post", slug = "second-post" }
        },
        pagination = {
            page = 1,
            totalPages = 5
        }
    }
end
```

## Fetching Data

### From External APIs

```lua
local http = require("http")
local json = require("json")

function load(ctx)
    local response = http.get("https://api.example.com/posts")
    local posts = json.decode(response.body)

    return {
        title = "Posts",
        posts = posts
    }
end
```

### From Databases

```lua
local db = require("db")

function load(ctx)
    local posts = db.query("SELECT * FROM posts ORDER BY created_at DESC LIMIT 10")

    return {
        title = "Recent Posts",
        posts = posts
    }
end
```

### Dynamic Route Data

For routes with parameters like `[slug]`:

```lua
-- src/routes/blog/[slug]/+page.server.lua
function load(ctx)
    local slug = ctx.params.slug

    -- Fetch the specific post
    local post = fetchPostBySlug(slug)

    if not post then
        return {
            error = "Post not found",
            status = 404
        }
    end

    return {
        title = post.title,
        post = post
    }
end
```

## Data Flow

1. Request comes in for `/blog/hello-world`
2. Luat matches to `src/routes/blog/[slug]/+page.luat`
3. Runs `+page.server.lua` with `ctx.params.slug = "hello-world"`
4. `load()` returns data
5. Data is passed to template as `props`
6. Template renders with the data

```
Request → Route Match → load() → Template → HTML Response
```

## Using Data in Templates

### Basic Access

```html
<script>
    local title = props.title
    local posts = props.posts
</script>

<h1>{title}</h1>

{#each posts as post}
    <article>
        <h2>{post.title}</h2>
    </article>
{/each}
```

### With Default Values

```html
<script>
    local title = props.title or "Untitled"
    local posts = props.posts or {}
</script>
```

### Conditional Rendering

```html
{#if props.error}
    <p class="error">{props.error}</p>
{:else}
    <h1>{props.post.title}</h1>
    <div>{props.post.content}</div>
{/if}
```

## Error Handling

### Returning Errors

```lua
function load(ctx)
    local id = ctx.params.id
    local item = findItemById(id)

    if not item then
        return {
            error = "Item not found",
            status = 404
        }
    end

    return { item = item }
end
```

### Try/Catch Pattern

```lua
function load(ctx)
    local success, result = pcall(function()
        return fetchDataFromAPI()
    end)

    if not success then
        return {
            error = "Failed to load data",
            status = 500
        }
    end

    return { data = result }
end
```

## Shared Data Loading

### Using lib/ Modules

Create reusable data fetching functions:

```lua
-- src/lib/data.lua
local function fetchPosts(page, limit)
    -- Fetch logic here
    return posts
end

local function fetchPostBySlug(slug)
    -- Fetch logic here
    return post
end

return {
    fetchPosts = fetchPosts,
    fetchPostBySlug = fetchPostBySlug
}
```

Use in server files:

```lua
-- src/routes/blog/+page.server.lua
local data = require("data")

function load(ctx)
    local page = tonumber(ctx.query.page) or 1
    local posts = data.fetchPosts(page, 10)

    return {
        title = "Blog",
        posts = posts,
        currentPage = page
    }
end
```

## Common Patterns

### Pagination

```lua
function load(ctx)
    local page = tonumber(ctx.query.page) or 1
    local perPage = 10
    local offset = (page - 1) * perPage

    local posts = fetchPosts(offset, perPage)
    local total = countPosts()
    local totalPages = math.ceil(total / perPage)

    return {
        posts = posts,
        pagination = {
            current = page,
            total = totalPages,
            hasNext = page < totalPages,
            hasPrev = page > 1
        }
    }
end
```

### Search/Filter

```lua
function load(ctx)
    local query = ctx.query.q or ""
    local category = ctx.query.category

    local filters = {}
    if query ~= "" then
        filters.search = query
    end
    if category then
        filters.category = category
    end

    local results = searchItems(filters)

    return {
        query = query,
        category = category,
        results = results
    }
end
```

### Authentication Check

```lua
function load(ctx)
    local token = ctx.headers["Authorization"]
    local user = validateToken(token)

    if not user then
        return {
            error = "Unauthorized",
            status = 401,
            redirect = "/login"
        }
    end

    return {
        user = user,
        dashboard = fetchDashboardData(user.id)
    }
end
```
