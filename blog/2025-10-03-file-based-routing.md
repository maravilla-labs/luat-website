---
slug: file-based-routing
title: "Introducing File-Based Routing for Luat"
authors: [labertasch]
tags: [luat, lua, routing, web-development]
description: Luat now supports file-based routing with layouts, dynamic routes, and server-side data loading.
date: 2025-10-03
---

# Introducing File-Based Routing for Luat

We're thrilled to announce one of our most requested features: **file-based routing** for Luat. Your file structure becomes your routes - intuitive, maintainable, and just makes sense.

<!-- truncate -->

## Why File-Based Routing?

Instead of manually configuring routes, your directory structure defines your application's URLs. It's the modern standard for web frameworks, and we've brought it to Luat with full support for layouts, dynamic parameters, and server-side data loading.

## How It Works

### File Conventions

Your routes live in `src/routes/` and follow these conventions:

- **`+page.luat`** - Page components that render for a route
- **`+layout.luat`** - Layouts that wrap pages and persist across navigation
- **`+page.server.lua`** - Server-side data loading
- **`+server.lua`** - API endpoints

### Example Structure

```
src/routes/
├── +layout.luat           # Root layout (wraps everything)
├── +page.luat             # Homepage (/)
├── about/
│   └── +page.luat         # /about
├── blog/
│   ├── +layout.luat       # Blog-specific layout
│   ├── +page.luat         # /blog (list)
│   ├── +page.server.lua   # Load blog posts
│   └── [slug]/
│       ├── +page.luat     # /blog/:slug (individual post)
│       └── +page.server.lua
└── api/
    └── posts/
        └── +server.lua    # /api/posts endpoint
```

### Dynamic Routes

Luat supports flexible dynamic route parameters:

- **`[slug]`** - Required dynamic parameter
- **`[[optional]]`** - Optional parameter
- **`[...rest]`** - Rest/catch-all parameter

## Server-Side Data Loading

Load data before rendering with `+page.server.lua`:

```lua
-- src/routes/blog/[slug]/+page.server.lua
function load(ctx)
    local slug = ctx.params.slug
    local post = db.findPost(slug)

    return {
        title = post.title,
        post = post
    }
end
```

The returned data is available as `props` in your template:

```html
<!-- src/routes/blog/[slug]/+page.luat -->
<script>
    local title = props.title
    local post = props.post
</script>

<article class="prose">
    <h1>{title}</h1>
    <div>{post.content}</div>
</article>
```

## Nested Layouts

Layouts automatically nest, so you can have:

- A root layout with your main navigation
- A blog layout with sidebar
- Pages that inherit both

```html
<!-- src/routes/+layout.luat -->
<nav class="bg-slate-900 px-8 py-4 flex gap-6">
    <a href="/" class="text-white font-medium">Home</a>
    <a href="/about" class="text-white font-medium">About</a>
    <a href="/blog" class="text-white font-medium">Blog</a>
</nav>
<main class="max-w-3xl mx-auto px-4 py-8">
    {@html props.children}
</main>
<footer class="text-center py-8 text-gray-500 text-sm">
    Built with Luat
</footer>
```

The `{@html props.children}` is where child content (pages or nested layouts) renders.

## What's Next

This is just the beginning. We're working on:

- Development server with live reload
- Integrated frontend toolchain (Tailwind, TypeScript)
- CLI for project scaffolding

Stay tuned for more updates!

---

Questions or feedback? Reach out [@thelabertasch](https://x.com/thelabertasch) on X.
