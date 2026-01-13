# Project Structure

Luat projects follow a SvelteKit-inspired structure that organizes routes, shared code, and assets in a predictable way.

## Directory Overview

```
my-app/
├── luat.toml              # Project configuration
├── src/
│   ├── app.html           # HTML shell template
│   ├── routes/            # File-based routing
│   │   ├── +layout.luat   # Root layout
│   │   ├── +page.luat     # Home page (/)
│   │   ├── +page.server.lua
│   │   ├── about/
│   │   │   └── +page.luat # /about
│   │   ├── blog/
│   │   │   ├── +page.luat # /blog
│   │   │   ├── +page.server.lua
│   │   │   └── [slug]/    # Dynamic route
│   │   │       ├── +page.luat
│   │   │       └── +page.server.lua
│   │   └── api/
│   │       └── hello/
│   │           └── +server.lua # API endpoint
│   └── lib/               # Shared modules
│       ├── components/    # Reusable components
│       └── utils.lua      # Utility functions
├── static/                # Static assets (copied as-is)
│   └── favicon.ico
└── public/                # Generated assets
    └── css/
        └── tailwind.css   # Compiled Tailwind
```

## Core Files

### luat.toml

Project configuration file:

```toml
[project]
name = "my-app"
version = "0.1.0"

[dev]
port = 3000
host = "127.0.0.1"

[routing]
simplified = false
routes_dir = "src/routes"
lib_dir = "src/lib"
static_dir = "static"
app_html = "src/app.html"

[frontend]
enabled = ["tailwind"]
tailwind_version = "4.0.5"
tailwind_output = "public/css/tailwind.css"
tailwind_content = ["src/**/*.luat", "src/**/*.html"]
```

### src/app.html

The HTML shell that wraps all pages. Uses placeholders for dynamic content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%luat.title%</title>
    <link rel="stylesheet" href="/css/tailwind.css">
    %luat.head%
</head>
<body>
    %luat.body%
    <script src="/js/app.js"></script>
</body>
</html>
```

**Placeholders:**

| Placeholder | Description |
|-------------|-------------|
| `%luat.title%` | Page title from `props.title` |
| `%luat.head%` | Additional head content (CSS, meta tags) |
| `%luat.body%` | Rendered page content |

### src/routes/

Contains all route files. The directory structure maps to URLs.

### src/lib/

Shared Lua modules accessible via `require()`:

```lua
-- src/lib/utils.lua
function formatDate(timestamp)
    return os.date("%Y-%m-%d", timestamp)
end

return {
    formatDate = formatDate
}
```

Use in templates:

```html
<script>
    local utils = require("utils")
    local formatted = utils.formatDate(props.date)
</script>

<p>Published: {formatted}</p>
```

### static/

Static files served as-is. Files are accessible at the root URL:

- `static/favicon.ico` → `/favicon.ico`
- `static/images/logo.png` → `/images/logo.png`

### public/

Generated assets from the frontend toolchain:

- Compiled Tailwind CSS
- Bundled JavaScript
- Processed images

## Route Files

### +page.luat

Renders the main content for a route:

```html
<!-- src/routes/about/+page.luat -->
<h1>About Us</h1>
<p>Learn more about our company.</p>
```

### +layout.luat

Wraps child routes with shared UI:

```html
<!-- src/routes/+layout.luat -->
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    {@html props.children}
</main>

<footer>
    <p>Copyright 2025</p>
</footer>
```

Layouts cascade - a layout applies to all routes in its directory and subdirectories.

### +page.server.lua

Server-side data loading:

```lua
-- src/routes/blog/+page.server.lua
function load(ctx)
    local posts = fetchBlogPosts()
    return {
        title = "Blog",
        posts = posts
    }
end
```

### +server.lua

API endpoints returning JSON:

```lua
-- src/routes/api/users/+server.lua
function GET(ctx)
    return {
        status = 200,
        body = { users = getAllUsers() }
    }
end

function POST(ctx)
    local data = ctx.body
    local user = createUser(data)
    return {
        status = 201,
        body = user
    }
end
```

## Shared Components

Create reusable components in `src/lib/components/`:

```html
<!-- src/lib/components/Card.luat -->
<script>
    local title = props.title
    local class = props.class or ""
</script>

<div class="bg-white rounded-lg shadow p-6 {class}">
    <h2 class="text-xl font-bold">{title}</h2>
    <div class="mt-4">
        {@render props.children?.()}
    </div>
</div>
```

Use in pages:

```html
<script>
    local Card = require("components/Card")
</script>

<Card title="Welcome">
    <p>Card content here</p>
</Card>
```

## Private Files

Files and directories starting with `_` are not routed:

```
src/routes/
├── _components/       # Not accessible via URL
│   └── Header.luat    # Use with require()
├── _helpers.lua       # Not accessible via URL
└── +page.luat         # Accessible at /
```

## Best Practices

### 1. Route Organization

Group related routes in directories:

```
src/routes/
├── (marketing)/       # Grouping without URL segment
│   ├── about/
│   ├── pricing/
│   └── contact/
├── (app)/
│   ├── dashboard/
│   └── settings/
└── api/
```

### 2. Component Location

- **Route-specific**: Keep in same directory as route
- **Shared across routes**: Put in `src/lib/components/`
- **Utilities**: Put in `src/lib/`

### 3. Data Colocation

Keep `+page.server.lua` next to its `+page.luat`:

```
src/routes/blog/
├── +page.luat         # Template
├── +page.server.lua   # Data loading
└── [slug]/
    ├── +page.luat
    └── +page.server.lua
```

### 4. Static Assets

- Small, frequently-used images: `static/`
- Large media files: External CDN recommended
- Generated assets: `public/` (don't commit to git)
