# Routing

Luat uses SvelteKit-style file-based routing where your file structure defines your URL structure. Each file in the `src/routes/` directory becomes a route in your application.

## File Conventions

### +page.luat

Page components render the main content for a route.

```
src/routes/+page.luat          → /
src/routes/about/+page.luat    → /about
src/routes/blog/+page.luat     → /blog
```

Example page:
```html
<script>
    local title = props.title or "Welcome"
</script>

<h1>{title}</h1>
<p>This is the page content.</p>
```

### +layout.luat

Layouts wrap page content with shared UI elements like navigation and footers.

```html
<!-- src/routes/+layout.luat -->
<nav class="bg-slate-900 px-8 py-4">
    <a href="/" class="text-white">Home</a>
    <a href="/about" class="text-white">About</a>
    <a href="/blog" class="text-white">Blog</a>
</nav>

<main class="max-w-3xl mx-auto px-4 py-8">
    {@html props.children}
</main>

<footer class="bg-slate-100 px-8 py-4">
    <p>Built with Luat</p>
</footer>
```

Layouts apply to all routes in the same directory and subdirectories.

### +page.server.lua

Server-side data loading for pages. Exports a `load()` function that returns data for the template.

```lua
-- src/routes/blog/+page.server.lua
function load(ctx)
    return {
        title = "Blog",
        posts = {
            { slug = "hello-world", title = "Hello World" },
            { slug = "getting-started", title = "Getting Started" }
        }
    }
end
```

The returned data becomes available as `props` in your template:

```html
<!-- src/routes/blog/+page.luat -->
<h1>{props.title}</h1>

{#each props.posts as post}
    <a href="/blog/{post.slug}">{post.title}</a>
{/each}
```

### +server.lua

API endpoints that handle HTTP requests and return JSON responses.

```lua
-- src/routes/api/hello/+server.lua
function GET(ctx)
    return {
        status = 200,
        body = { message = "Hello, World!" }
    }
end

function POST(ctx)
    local data = ctx.body
    return {
        status = 201,
        body = { created = true }
    }
end
```

## Route Hierarchy

Routes are nested based on directory structure:

```
src/routes/
├── +layout.luat        # Root layout (applies to all)
├── +page.luat          # Home page (/)
├── about/
│   └── +page.luat      # About page (/about)
├── blog/
│   ├── +layout.luat    # Blog layout (applies to /blog/*)
│   ├── +page.luat      # Blog index (/blog)
│   └── [slug]/
│       └── +page.luat  # Blog post (/blog/:slug)
└── api/
    └── hello/
        └── +server.lua # API endpoint (/api/hello)
```

### Layout Nesting

Layouts cascade down the route tree:
- `/` uses only the root layout
- `/blog` uses root layout + blog layout
- `/blog/my-post` uses root layout + blog layout

Each nested layout wraps its children via `{@html props.children}`.

## URL to File Mapping

| URL | File |
|-----|------|
| `/` | `src/routes/+page.luat` |
| `/about` | `src/routes/about/+page.luat` |
| `/blog` | `src/routes/blog/+page.luat` |
| `/blog/hello-world` | `src/routes/blog/[slug]/+page.luat` |
| `/api/hello` | `src/routes/api/hello/+server.lua` |

## Simplified Routing Mode

For simpler projects, enable simplified routing:

```toml
[routing]
simplified = true
routes_dir = "templates"
```

In simplified mode, files map directly to URLs without the `+page` convention:

```
templates/index.luat     → /
templates/about.luat     → /about
templates/blog.luat      → /blog
```

## Private Routes

Files and directories starting with `_` are ignored by the router:

```
src/routes/
├── _components/        # Not routable
│   └── Card.luat       # Import with require()
├── _helpers.lua        # Not routable
└── +page.luat          # Routable (/)
```

Use private directories for shared components and utilities.
