---
slug: luat-open-source
title: "Luat is Now Fully Open Source"
authors: [labertasch]
tags: [luat, open-source, apache-2.0, mit, maravilla-labs, announcement]
description: We're open-sourcing Luat under the MIT and Apache 2.0 licenses. The full codebase is now available on GitHub.
date: 2026-01-13
draft: true
---

# Luat is Now Fully Open Source

Today we're excited to announce that **Luat is fully open source** under the MIT and Apache 2.0 dual license. The complete codebase is now available on [GitHub](https://github.com/maravilla-labs/luat).

<!-- truncate -->

## The Story Behind Luat

Luat didn't start as an open source project. It began as part of a larger internal engineering platform at Maravilla Labs, where we've been using it for our own projects for quite a while now.

### Why We Built It

A key motivation for us was **running at the edge**. We wanted server-side rendering that could deploy anywhere - edge functions, containers, bare metal - without dragging along a Node.js runtime. Rust gave us that: a single binary that starts instantly and runs natively.

But we didn't want to sacrifice developer experience. Modern frontend frameworks like Svelte and SvelteKit have raised the bar for what building web UIs should feel like. File-based routing, component composition, reactive syntax - these aren't just nice-to-haves anymore, they're expected.

The problem? Most of these frameworks assume you're shipping JavaScript to the browser. For many of our projects, we don't want that. We use **htmx** extensively - letting the server render HTML and sending it over the wire. It's simple, fast, and works everywhere. But the templating options for this approach felt stuck in the past.

We wanted the best of both worlds:
- **Modern DX** - Svelte-like syntax, components, file-based routing
- **Server-side only** - No JavaScript bundles, no hydration
- **Native Rust** - No Node.js dependency, runs anywhere
- **Edge-ready** - Fast cold starts, minimal memory footprint

So we built Luat. No JavaScript bundles to ship, no hydration complexity, just fast HTML responses with a templating language that actually makes sense.

Over time, Luat became one of our favorite tools to work with. There's something satisfying about writing templates that compile in microseconds and render in milliseconds - and knowing you can deploy them anywhere.

## From Internal Tool to Open Source

Last year, we started the journey of making Luat available to others:

- We carved out the templating engine from our internal platform
- Gave it a proper name: **Luat** (Lua + Template)
- Started writing documentation and [blog posts](/blog)
- Built the [WASM playground](/blog/luat-wasm-playground) so anyone could try it without installing anything
- Prepared the [CLI](/blog/luat-cli-published) for public release

Today, we're taking the final step: **moving the entire codebase to our [maravilla-labs](https://github.com/maravilla-labs) organization on GitHub** and making it fully available under permissive open source licenses.

## License: MIT and Apache 2.0

Luat is dual-licensed under:

- **MIT License** - Simple and permissive
- **Apache License 2.0** - Patent protection included

You can choose whichever license works best for your project. This is the same licensing approach used by Rust itself and many other projects in the ecosystem.

## What's in the Repository

The [luat repository](https://github.com/maravilla-labs/luat) contains everything:

```
luat/
├── crates/
│   ├── luat/           # Core templating engine
│   ├── luat-cli/       # Command-line interface
│   └── luat-wasm/      # WebAssembly build
├── examples/           # Example projects
└── docs/               # Technical documentation
```

- **Parser** - Svelte-inspired template syntax
- **Compiler** - Template to Lua code generation
- **Engine** - Lua execution with mlua bindings
- **Router** - SvelteKit-style file-based routing
- **CLI** - Development server, build tools, project scaffolding
- **WASM** - Browser-based playground (the same one powering our docs)

## Why Open Source Now?

We've been having a lot of fun building and using Luat. The templating syntax feels right. The performance is excellent. The developer experience keeps getting better.

We'd be humbled if, by open-sourcing this, we can share some of that enjoyment with others. Maybe you'll find Luat useful for your projects. Maybe you'll have ideas for improvements we haven't thought of. Maybe you'll just enjoy reading through the codebase.

Whatever it is, we're excited to see what happens.

## The Road Ahead

Open-sourcing Luat doesn't mean we're done. We're actively improving it and will continue to do so. Our internal version has additional features that we'll migrate to the open source version over time:

- **More toolchain integrations** - Additional frontend tools and preprocessors
- **Enhanced routing** - More advanced patterns and middleware support
- **Performance optimizations** - Template caching improvements and faster compilation
- **Better error messages** - More helpful diagnostics during development
- **Editor support** - VS Code extension with syntax highlighting and completions

Our goal is to reach full feature parity between our internal tooling and the open source version. We use Luat daily, so every improvement benefits both.

## Get Involved

Here's how you can participate:

### Try It Out

```bash
npm install -g @maravilla-labs/luat
luat init my-app
cd my-app
luat dev
```

Or just play with it in your browser using the [interactive playground](/docs/getting-started).

### Explore the Code

```bash
git clone https://github.com/maravilla-labs/luat
cd luat
cargo build
```

The codebase is well-structured and (we think) readable. Start with `crates/luat/src/engine.rs` for the core templating logic.

### Report Issues

Found a bug? Have a feature request? [Open an issue](https://github.com/maravilla-labs/luat/issues) on GitHub.

### Contribute

Pull requests are welcome. Whether it's fixing a typo in the docs or implementing a new feature, we appreciate contributions of all sizes.

## Thank You

Building Luat has been a rewarding journey. Thank you for your interest in what we've built. We hope you enjoy using it as much as we do.

Here's to building great things together.

---

Follow [@thelabertasch](https://x.com/thelabertasch) on X for updates, or star the [repository](https://github.com/maravilla-labs/luat) on GitHub to stay in the loop.
