# Advanced Routing

Luat supports dynamic route segments, optional parameters, and catch-all routes for flexible URL handling.

## Dynamic Parameters

Use square brackets `[param]` to create dynamic route segments:

```
src/routes/blog/[slug]/+page.luat
```

This matches any URL like `/blog/hello-world`, `/blog/my-first-post`, etc.

### Accessing Parameters

Parameters are available via `ctx.params` in `+page.server.lua`:

```lua
-- src/routes/blog/[slug]/+page.server.lua
function load(ctx)
    local slug = ctx.params.slug

    -- Fetch post by slug
    local post = {
        slug = slug,
        title = "Post: " .. slug,
        content = "Content for " .. slug
    }

    return {
        title = post.title,
        post = post
    }
end
```

Then use the data in your template:

```html
<!-- src/routes/blog/[slug]/+page.luat -->
<article>
    <h1>{props.post.title}</h1>
    <p>{props.post.content}</p>
</article>
```

### Multiple Parameters

You can have multiple dynamic segments:

```
src/routes/users/[userId]/posts/[postId]/+page.luat
```

Matches `/users/123/posts/456`:

```lua
function load(ctx)
    local userId = ctx.params.userId   -- "123"
    local postId = ctx.params.postId   -- "456"

    return {
        userId = userId,
        postId = postId
    }
end
```

## Optional Parameters

Use double brackets `[[param]]` for optional segments:

```
src/routes/blog/[[page]]/+page.luat
```

This matches:
- `/blog` (page is nil)
- `/blog/1` (page is "1")
- `/blog/2` (page is "2")

```lua
-- src/routes/blog/[[page]]/+page.server.lua
function load(ctx)
    local page = ctx.params.page or "1"
    local pageNum = tonumber(page)

    return {
        currentPage = pageNum,
        posts = fetchPosts(pageNum)
    }
end
```

## Catch-All Routes

Use `[...param]` to match any number of path segments:

```
src/routes/docs/[...path]/+page.luat
```

This matches:
- `/docs/intro` (path is "intro")
- `/docs/guide/routing` (path is "guide/routing")
- `/docs/api/v2/users` (path is "api/v2/users")

```lua
-- src/routes/docs/[...path]/+page.server.lua
function load(ctx)
    local path = ctx.params.path or ""
    local segments = {}

    -- Split path into segments
    for segment in string.gmatch(path, "[^/]+") do
        table.insert(segments, segment)
    end

    return {
        path = path,
        segments = segments,
        breadcrumbs = segments
    }
end
```

## Route Priority

When multiple routes could match, Luat uses this priority:

1. **Static routes** - Exact matches first
2. **Dynamic routes** - `[param]` segments
3. **Optional routes** - `[[param]]` segments
4. **Catch-all routes** - `[...param]` segments

Example with these routes:
```
src/routes/blog/new/+page.luat        # Static: /blog/new
src/routes/blog/[slug]/+page.luat     # Dynamic: /blog/:slug
src/routes/blog/[[page]]/+page.luat   # Optional: /blog or /blog/:page
```

- `/blog/new` matches the static route
- `/blog/hello-world` matches the dynamic route
- `/blog` matches the optional route

## Real-World Example

A blog with pagination and dynamic posts:

```
src/routes/blog/
├── +page.luat              # /blog (blog index)
├── +page.server.lua        # Load posts list
├── page/
│   └── [num]/
│       ├── +page.luat      # /blog/page/2, /blog/page/3
│       └── +page.server.lua
└── [slug]/
    ├── +page.luat          # /blog/my-post
    └── +page.server.lua
```

```lua
-- src/routes/blog/+page.server.lua
function load(ctx)
    return {
        title = "Blog",
        posts = fetchPosts(1, 10),  -- First page
        currentPage = 1,
        totalPages = 5
    }
end
```

```lua
-- src/routes/blog/page/[num]/+page.server.lua
function load(ctx)
    local page = tonumber(ctx.params.num) or 1

    return {
        title = "Blog - Page " .. page,
        posts = fetchPosts(page, 10),
        currentPage = page,
        totalPages = 5
    }
end
```

```lua
-- src/routes/blog/[slug]/+page.server.lua
function load(ctx)
    local slug = ctx.params.slug
    local post = fetchPostBySlug(slug)

    if not post then
        -- Return 404 data
        return {
            title = "Not Found",
            error = "Post not found"
        }
    end

    return {
        title = post.title,
        post = post
    }
end
```

## URL Encoding

Dynamic parameters are automatically URL-decoded:

- `/blog/hello%20world` → `ctx.params.slug = "hello world"`
- `/search?q=lua%2Brust` → `ctx.query.q = "lua+rust"`

## Parameter Validation

Always validate dynamic parameters in your server code:

```lua
function load(ctx)
    local id = ctx.params.id

    -- Check if ID is a valid number
    local numId = tonumber(id)
    if not numId or numId < 1 then
        return {
            error = "Invalid ID",
            status = 400
        }
    end

    -- Check if ID exists
    local item = findById(numId)
    if not item then
        return {
            error = "Not found",
            status = 404
        }
    end

    return { item = item }
end
```

## Fragments

Fragments are partial HTML templates that render without the full page wrapper. They're useful for HTMX-style partial updates where you want to swap just a portion of the page.

### The (fragments) Folder

Place fragment templates in a `(fragments)` subfolder of your route:

```
src/routes/todos/
├── +page.luat           # Full page
├── +page.server.lua     # load() + actions
└── (fragments)/         # Fragment templates
    ├── add.luat
    ├── delete.luat
    └── toggle.luat
```

### Triggering Fragments

Fragments are triggered using the `?/name` URL pattern:

| URL | Method | What happens |
|-----|--------|--------------|
| `GET /todos` | GET | Renders `+page.luat` (full page) |
| `GET /todos?/add` | GET | Runs `actions.add`, renders `(fragments)/add.luat` |
| `POST /todos?/add` | POST | Runs `actions.add`, renders `(fragments)/add.luat` |
| `POST /todos?/delete` | POST | Runs `actions.delete`, renders `(fragments)/delete.luat` |

Both GET and POST (and other methods) can trigger fragments. The action runs first, then the fragment renders with the action's return value as `props`.

### Fragment Naming

Fragments can be method-specific:

- `add.luat` - Renders for any method
- `POST-add.luat` - Renders only for POST requests (takes precedence)
- `GET-refresh.luat` - Renders only for GET requests

```
(fragments)/
├── add.luat           # Any method
├── POST-add.luat      # POST only (preferred over add.luat for POST)
├── delete.luat
└── GET-refresh.luat   # GET only
```

### Basic Example

```lua
-- +page.server.lua
actions = {
    add = function(ctx)
        local item = create_item(ctx.form.title)
        return { item = item }
    end,

    delete = function(ctx)
        delete_item(ctx.form.id)
        return { deleted = true }
    end
}
```

```html
<!-- (fragments)/add.luat -->
<li>{props.item.title}</li>
```

```html
<!-- (fragments)/delete.luat -->
<!-- Empty template removes the element -->
```

For a complete walkthrough with HTMX integration, see the [HTMX & Fragments Guide](/docs/advanced/htmx-and-fragments).

### Response Headers

The engine automatically sets `x-luat-fragment: true` on fragment responses. This tells adapters to return the HTML directly without wrapping it in `app.html`.

### No Fragment: JSON Response

If no matching fragment template exists, the action result is returned as JSON:

```json
{
    "todo": {
        "id": "123",
        "title": "Buy milk"
    }
}
```

This is useful for API-style responses or when you handle the response client-side with JavaScript.
