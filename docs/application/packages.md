---
sidebar_position: 9
title: Packages
---

# Packages

Packages share components, layouts, Lua modules and assets between Luat projects. Browse them on the [package registry](/packages).

## Add a package

```bash
luat add @acme/ui            # latest version
luat add @acme/ui@^1.2       # a version range
```

This records the dependency in `luat.toml`, pins the whole dependency graph in `luat.lock` and installs the packages into `.luat/packages/`. Commit `luat.toml` and `luat.lock`; add `.luat/` to `.gitignore` (new projects already do).

```toml
# luat.toml
[dependencies]
"@acme/ui" = "^1.2"
```

`luat install` installs exactly what `luat.lock` says — use `luat install --frozen` in CI to fail instead of changing the lockfile. `luat update [name]` moves to the newest versions the ranges allow; `luat remove @acme/ui` drops one. `luat build` and `luat dev` install missing packages on their own.

## Use it

Require a package by name. A component is a `.luat` file of the package:

```html
<script>
  local Card = require("@acme/ui/Card")
  local format = require("@acme/ui")      -- the package's init.lua
</script>

<Card title="Hello">{format.date(props.when)}</Card>
```

| You write | Loads (inside the package) |
|---|---|
| `require("@acme/ui")` | `src/init.lua` (or `src/init.luat`) |
| `require("@acme/ui/Card")` | `src/Card.luat`, else `src/Card.lua`, else `src/Card/init.lua` |
| `require("@acme/ui/forms/Field")` | `src/forms/Field.luat`, … |

Packages are compiled into your bundle, so production builds need no `.luat/` directory.

## Publish a package

A package is a Luat project with a `[package]` section; its modules live in `src/`.

```toml
[package]
name = "@acme/ui"
version = "1.2.0"
description = "Cards, buttons and layouts"
license = "MIT"
repository = "https://github.com/acme/ui"
luat = ">=0.1"                 # Luat versions it works with

[dependencies]
"@acme/icons" = "^2.0"
```

```bash
luat login                      # paste a token for the registry
luat pack                       # optional: see exactly what will be uploaded
luat publish
```

Versions are immutable: publishing an existing version fails, and a broken release is *yanked* (new installs skip it, existing lockfiles keep working) rather than deleted. In CI, set `LUAT_REGISTRY_TOKEN` instead of running `luat login`.

## Other registries

Every scope uses the public registry unless `luat.toml` says otherwise:

```toml
[registries]
"@private" = "https://registry.example.com/luat"
```

Any server implementing the [registry protocol](https://github.com/maravilla-labs/luat/blob/main/docs/packages.md) works. Tokens are stored per registry in your user config directory, never in the project.
