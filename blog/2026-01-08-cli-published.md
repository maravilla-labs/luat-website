---
slug: luat-cli-published
title: "Luat CLI is Ready: Install and Start Building in Seconds"
authors: [labertasch]
tags: [luat, cli, release, npm, toolchain, rust]
description: The Luat CLI is ready and will be published soon. A Rust-powered development experience with live reload, integrated toolchain, and file-based routing.
date: 2026-01-08
---

# Luat CLI is Ready: Install and Start Building in Seconds

The moment we've been working towards is here: **the Luat CLI is ready and will be published soon**. Once available, you'll be able to install it, run `luat dev`, and start building.

<!-- truncate -->

## Built with Rust

The entire CLI is written in Rust, giving you native performance and reliability. Under the hood, we're using:

- **Axum** - A fast, ergonomic web framework for the development and production servers
- **Tokio** - Async runtime powering concurrent file watching and request handling
- **notify** - Cross-platform file system monitoring with 750ms debouncing to catch rapid saves
- **matchit** - Lightning-fast URL pattern matching for route resolution
- **mlua** - Lua runtime bindings that power the template engine

The result? A dev server that starts instantly and rebuilds in milliseconds.

## Install in Seconds

Once published, choose your preferred installation method:

### npm (Recommended)

```bash
npm install -g @maravilla-labs/luat
```

### Shell Script (Linux/macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/maravilla-labs/luat/main/scripts/install.sh | sh
```

### Cargo (Rust developers)

```bash
cargo install luat-cli
```

## Your First Project

Creating a new Luat project takes one command:

```bash
luat init my-app
cd my-app
luat dev
```

Your browser opens to `http://localhost:3000` with a starter template ready to customize.

## What's Included

The CLI brings everything we've been building together into five commands:

| Command | Description |
|---------|-------------|
| `luat init [name]` | Create a new project with SvelteKit-style structure |
| `luat dev` | Start development server with live reload |
| `luat build` | Bundle templates for production deployment |
| `luat serve` | Run optimized production server |
| `luat watch` | Watch files and rebuild without HTTP server |

### Development Server

```bash
luat dev --port 3000
```

The dev server is where we spent the most time polishing the experience:

- **WebSocket Live Reload** - Changes trigger instant browser refresh via a lightweight WebSocket connection at `/__livereload`. The client auto-reconnects if the connection drops.
- **Smart File Watching** - Only `.luat` and `.lua` files trigger rebuilds. We debounce rapid saves (750ms window) to avoid unnecessary work.
- **Error Overlay** - When something breaks, you see the error in the browser with syntax-highlighted context.
- **Hot CSS Updates** - Tailwind and Sass changes apply without full page refresh when possible.

### Production Build

```bash
luat build
luat serve --port 8080
```

The build command runs your frontend tools in production mode and bundles all templates. The serve command runs an optimized server with a larger template cache (1000 entries vs 100 in dev mode) and no live reload overhead.

### Integrated Toolchain

This is one of our favorite features. Zero configuration for:

- **Tailwind CSS** - Utility-first styling
- **Dart Sass** - CSS preprocessing
- **esbuild** - Fast TypeScript/JavaScript bundling

Here's the magic: **you don't need npm installed**. When you first run `luat dev`, we automatically download the right binaries for your platform:

- Linux (x64, ARM64)
- macOS (Intel, Apple Silicon)
- Windows (x64)

Downloads are cached in your system's cache directory (`~/.cache/luat/tools/` on Linux, `~/Library/Caches/com.maravilla-labs.luat/tools/` on macOS). We verify checksums (SHA256) and retry with exponential backoff if downloads fail.

The build orchestrator runs tools in sequence (Sass → Tailwind → esbuild) with a multi-progress display showing exactly what's happening.

### File-Based Routing

The file-based routing we [announced in October](/blog/file-based-routing) is fully implemented:

```
src/routes/
├── +layout.luat         # Root layout
├── +page.luat           # Home page (/)
├── +page.server.lua     # Server-side data loading
├── blog/
│   ├── +page.luat       # /blog
│   └── [slug]/
│       ├── +page.luat   # /blog/:slug
│       └── +page.server.lua
└── api/
    └── posts/
        └── +server.lua  # /api/posts endpoint
```

**Route files explained:**
- `+page.luat` - The template to render
- `+page.server.lua` - Runs before rendering to load data (returns props)
- `+layout.luat` - Wraps pages and nested layouts
- `+server.lua` - API endpoint (define `GET`, `POST`, etc. functions)

**Dynamic routes** use bracket syntax: `[param]` for required, `[[optional]]` for optional, and `[...rest]` for catch-all.

The router automatically collects the layout chain from root to current route, executing load functions bottom-up and merging their props.

## How Rendering Works

When a request comes in, here's what happens:

1. **Route matching** - URL matched against routes using `matchit`
2. **Context building** - Route params, query strings, form data, and headers assembled
3. **Load functions** - Execute from layouts down to page, accumulating props
4. **Template rendering** - Page rendered with collected props
5. **Layout wrapping** - Content wrapped in layouts (innermost to outermost)
6. **Shell substitution** - Result inserted into `app.html` via `%luat.body%`
7. **Live reload injection** (dev only) - Script injected before `</body>`

Each request gets a fresh Lua instance for isolation - no state leaks between requests.

## Platform Support

The CLI runs everywhere:

| Platform | Architectures |
|----------|---------------|
| Linux | x86_64, ARM64 |
| macOS | Intel (x86_64), Apple Silicon (ARM64) |
| Windows | x86_64 |

## The Road Here

This release represents months of work:

- [October 2025](/blog/file-based-routing) - File-based routing design
- [December 2025](/blog/luat-wasm-playground) - WASM playground for interactive docs
- **Now** - CLI ready for release

We've tested extensively, iterated on developer experience, and polished every interaction.

## What's Next

Once the CLI is public, we're focusing on:

- **Project Templates** - Starters for common use cases (blog, dashboard, API)
- **Plugin System** - Extensibility for custom build steps and tools
- **Performance** - Even faster rebuilds with incremental compilation
- **VS Code Extension** - Syntax highlighting and LSP support for `.luat` files

## Get Started

Once published:

```bash
npm install -g @maravilla-labs/luat
luat init my-app
cd my-app
luat dev
```

That's it. You'll be building with Luat.

Check out our [getting started guide](/docs/getting-started) for a complete walkthrough, or dive into the [documentation](/docs/templating/intro) to explore everything Luat can do.

---

We can't wait to see what you build. Follow [@thelabertasch](https://x.com/thelabertasch) on X for the release announcement!
