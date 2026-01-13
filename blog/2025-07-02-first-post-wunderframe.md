---
slug: first-post
title: Introducing Luat
authors: [labertasch]
tags: [luat, lua, templating, svelte, rust]
description: A Svelte-inspired Lua templating system for Rust that brings the elegance of single-file components to server-side rendering.
date: 2025-07-02
---

# Introducing Luat: Game-Level Performance Meets Web Development

Today, we're excited to introduce **Luat** - a Svelte-inspired Lua templating system for Rust that brings the battle-tested performance of Lua to modern web development. This isn't just another templating engine; it's our vision for server-side rendering that's as reliable as the games you love.

<!-- truncate -->

## The Story Behind Luat

In a world dominated by complex JavaScript frameworks and endless configuration files, we asked ourselves: *What if we could build something as reliable as World of Warcraft, as simple as Svelte, and as fast as the games we love?* The answer came from our deep appreciation for Lua - the language that powers some of the most complex interactive experiences ever created.

Luat was born from the frustration of dealing with build tool nightmares and the complexity that has crept into modern web development. We wanted to create something that brings back the joy of building for the web while providing game-level performance.

## Inspired by Svelte and Vue: Single-File Components Done Right

We absolutely love Svelte and Vue for their single-file component approach. The beauty of having template, logic, and styles in one cohesive file is unmatched. Luat takes this philosophy and supercharges it with Lua's elegance.

At the heart of Luat lies **LUAT templating** - our single-file component system that feels familiar if you've used Svelte or Vue. Here's what a real Luat component looks like:

```html
<!-- UserCard.luat -->
<script>
    local user = props.user
    local showActions = props.showActions or false
    local cardClasses = "bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto"
</script>

<div class={cardClasses}>
    {#if user.avatar}
        <img class="w-24 h-24 rounded-full mx-auto mb-4"
             src={user.avatar}
             alt={user.name}>
    {/if}

    <h2 class="text-xl font-semibold text-center text-gray-800">
        {user.name}
    </h2>

    {#if user.role}
        <p class="text-gray-600 text-center mt-2">
            {user.role}
        </p>
    {/if}

    {#if showActions}
        <button class="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors">
            Follow
        </button>
    {/if}
</div>
```

## Powerful Template Syntax

Luat provides a rich set of control flow constructs that make building dynamic interfaces intuitive:

### Conditionals

```html
{#if user.isAdmin}
    <AdminPanel />
{:elseif user.isModerator}
    <ModeratorPanel />
{:else}
    <UserPanel />
{/if}
```

### Loops

```html
{#each posts as post, index}
    <article class="post">
        <span class="index">{index + 1}</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
    </article>
{:else}
    <p>No posts found.</p>
{/each}
```

### Components with Children

```html
<script>
    local Card = require("components/Card")
</script>

<Card title="Welcome">
    <p>This content is passed as children to the Card component.</p>
</Card>
```

## Server-Side Rendering with Modern Frontend Stack

Luat renders templates on the server with optional client-side hydration. This means perfect Lighthouse scores and SEO-friendly pages by default. Seamless integration with **HTMX** and **Alpine.js** gives you the interactivity you need.

```html
<!-- Interactive components with Alpine.js -->
<div x-data="{ open: false }" class="dropdown">
    <button @click="open = !open" class="btn btn-primary">
        Menu
    </button>
    <div x-show="open" class="dropdown-menu">
        <!-- Menu items -->
    </div>
</div>

<!-- Server interactions with HTMX -->
<button hx-post="/api/action"
        hx-target="#result"
        class="btn btn-secondary">
    Update Content
</button>
```

## The Power of Game-Proven Technology

Lua isn't just simple - it's **battle-tested**. The same language that powers complex systems in World of Warcraft, Roblox, and Angry Birds now powers your web applications. LUAT templates compile to blazing-fast Lua bytecode, giving you game-level performance from day one.

## Embed in Your Rust Application

Luat is designed to be embedded as a library in any Rust application. This gives you complete control over how templates are loaded, cached, and rendered.

```rust
use luat::{Engine, FileSystemResolver};

// Create an engine with filesystem-based template loading
let resolver = FileSystemResolver::new("templates/");
let engine = Engine::new(resolver);

// Render a template with context data
let context = serde_json::json!({
    "user": {
        "name": "Alice",
        "role": "Developer"
    }
});

let html = engine.render("pages/profile.luat", context)?;
```

### Flexible Caching Options

Choose the caching strategy that fits your needs:

```rust
// In-memory cache for development
let engine = Engine::with_memory_cache();

// Filesystem cache for production
let engine = Engine::with_fs_cache("./cache");

// Custom resolver for advanced use cases
let engine = Engine::new(MyCustomResolver::new());
```

### Bundle for Production

Compile all your templates into a single bundle for optimal production performance:

```rust
use luat::Bundle;

// Load a pre-compiled bundle
let bundle = Bundle::load("dist/templates.bin")?;
let engine = Engine::from_bundle(bundle);
```

## Zero Configuration Philosophy

Luat embraces simplicity. There's no complex configuration to wrestle with - just create your `.luat` files and start rendering. The templating engine handles escaping, caching, and optimization automatically.

## Join Our Journey

Luat is more than a templating system - it's a community of developers who believe in simplicity, performance, and joy in coding. We're building something special, and we want you to be part of it.

### How You Can Get Involved

- **Try Luat**: Add it to your Rust project with `cargo add luat`
- **Contribute**: Check out our GitHub repository
- **Share Feedback**: Let us know what you think
- **Spread the Word**: Help us grow by sharing Luat with fellow developers

### What's Next?

We're working hard on:
- CLI tooling for standalone projects
- Integrated frontend toolchain
- File-based routing system
- Growing the community

## The Philosophy

At its core, Luat embodies a simple philosophy:

> **Complexity is not a feature - it's a bug.**

We believe that powerful tools should be simple to use, that performance shouldn't come at the cost of developer experience, and that the web should be accessible to everyone.

---

*Ready to experience the future of Lua-powered web development? Join us on this journey and help shape the future of Luat. Together, we're building something extraordinary.*

**[Get Started with Luat →](/docs/getting-started)**

---

*Have thoughts, questions, or feedback? We'd love to hear from you! Connect with me [@thelabertasch](https://x.com/thelabertasch).*
