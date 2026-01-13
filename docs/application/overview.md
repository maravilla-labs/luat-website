# Introduction to Routing

Luat uses **SvelteKit-style file-based routing** where your file structure in `src/routes/` defines your application's URL structure. This approach makes it intuitive to understand how URLs map to files and keeps your codebase organized.

## What is File-Based Routing?

Instead of configuring routes manually, you create files and directories that correspond to URLs:

```
src/routes/
├── +page.luat           →  /
├── about/
│   └── +page.luat       →  /about
├── blog/
│   ├── +page.luat       →  /blog
│   └── [slug]/
│       └── +page.luat   →  /blog/:slug
└── api/
    └── hello/
        └── +server.lua  →  /api/hello (JSON)
```

## File Conventions

Luat uses special file naming conventions borrowed from SvelteKit:

| File | Purpose |
|------|---------|
| `+page.luat` | Renders the page content for a route |
| `+layout.luat` | Wraps pages with shared UI (nav, footer) |
| `+page.server.lua` | Loads data on the server for the page |
| `+server.lua` | Handles API requests (returns JSON) |

## Quick Example

A simple blog with these routes:

```
src/routes/
├── +layout.luat         # Shared navigation
├── +page.luat           # Home page
├── about/+page.luat     # About page
├── blog/
│   ├── +page.luat       # Blog list
│   ├── +page.server.lua # Load blog posts
│   └── [slug]/
│       ├── +page.luat   # Single post
│       └── +page.server.lua
└── api/hello/+server.lua # API endpoint
```

### Layout (`+layout.luat`)

```html
<nav class="bg-slate-900 px-8 py-4">
    <a href="/" class="text-white">Home</a>
    <a href="/about" class="text-white">About</a>
    <a href="/blog" class="text-white">Blog</a>
</nav>

<main>
    {@html props.children}
</main>
```

### Page (`+page.luat`)

```html
<h1>Welcome to My Site</h1>
<p>This is the home page.</p>
```

### Data Loading (`+page.server.lua`)

```lua
function load(ctx)
    return {
        title = "Blog",
        posts = {
            { slug = "hello", title = "Hello World" },
            { slug = "intro", title = "Getting Started" }
        }
    }
end
```

### API Endpoint (`+server.lua`)

```lua
function GET(ctx)
    return {
        status = 200,
        body = { message = "Hello from the API!" }
    }
end
```

## Routing Modes

Luat supports two routing modes configured in `luat.toml`:

### Full Routing (Default)

SvelteKit-style routing with `+page.luat` conventions:

```toml
[routing]
simplified = false
routes_dir = "src/routes"
```

### Simplified Routing

Direct file-to-URL mapping for simpler projects:

```toml
[routing]
simplified = true
routes_dir = "templates"
```

In simplified mode:
- `templates/index.luat` → `/`
- `templates/about.luat` → `/about`

## What's Next?

- [Project Structure](/docs/application/structure) - Complete directory layout
- [Routing](/docs/application/routing) - Detailed routing guide
- [Data Loading](/docs/application/functions) - `+page.server.lua` patterns
- [API Routes](/docs/application/api-routes) - Building JSON APIs
- [Dynamic Routes](/docs/application/dynamic-routes) - URL parameters
