---
slug: form-actions
title: "We Quietly Shipped Two Things"
authors: [labertasch]
tags: [form-actions, kv-store, htmx, routing, mutations, persistence, announcement]
description: Alongside the open-source release, we added form actions and a built-in KV store. Here's what we built.
date: 2026-01-14
draft: true
---

# We Quietly Shipped Two Things

Yesterday we [open-sourced Luat](/blog/luat-open-source). But we didn't mention everything that came with it.

Quietly bundled in that release were two features we've been using internally for a while: **Form Actions** and a **KV Store**. One handles mutations, the other handles persistence. Together they solve most of what you need for building real applications.

<!-- truncate -->

## Part 1: Form Actions

### The Gap We Needed to Fill

The `load()` function in `+page.server.lua` handles GET requests beautifully. You fetch data, return it, and your template renders with fresh props. Simple.

But what about POST requests? Form submissions? Updates? Deletions?

We'd been using `+server.lua` API routes for everything, which worked fine but felt clunky for page-level mutations. You'd have a page that displays a form, but the form submission would hit a completely separate API endpoint. State management got messy.

We wanted something better. Inspired by SvelteKit's approach, we built form actions for Luat.

### Enter Form Actions

Form actions let you handle mutations in the same file as your data loading:

```lua
-- src/routes/blog/[slug]/edit/+page.server.lua

function load(ctx)
    return {
        post = fetch_post(ctx.params.slug)
    }
end

actions = {
    default = function(ctx)
        update_post(ctx.params.slug, ctx.form)
        return { saved = true }
    end,

    publish = function(ctx)
        publish_post(ctx.params.slug)
        return {
            headers = { ["HX-Redirect"] = "/blog/" .. ctx.params.slug }
        }
    end,

    delete = function(ctx)
        delete_post(ctx.params.slug)
        return { redirect = "/blog" }
    end
}
```

GET requests run `load()`. POST/PUT/DELETE requests run the appropriate action.

### Named Actions via URL

Actions are targeted using a `?/name` suffix:

```
POST /blog/my-post/edit          → actions.default
POST /blog/my-post/edit?/publish → actions.publish
POST /blog/my-post/edit?/delete  → actions.delete
```

This makes it trivial to have multiple forms on a page, each targeting a different action:

```html
<form method="POST">
    <input name="title" value="{props.post.title}" />
    <button>Save Draft</button>
</form>

<form method="POST" action="?/publish">
    <button>Publish</button>
</form>

<form method="POST" action="?/delete">
    <button>Delete</button>
</form>
```

### The fail() Helper

Validation errors are a fact of life. The `fail()` helper makes them easy to handle:

```lua
actions = {
    default = function(ctx)
        if not ctx.form.title or ctx.form.title == "" then
            return fail(400, {
                title = ctx.form.title,
                content = ctx.form.content,
                error = "Title is required"
            })
        end

        save_post(ctx.form)
        return { saved = true }
    end
}
```

The returned data includes the original form values, so users don't lose their input.

### Action Templates (Fragments)

When an action returns data, Luat looks for a matching template in the `(fragments)` subfolder:

```
src/routes/login/
├── +page.luat           # The login form
├── +page.server.lua     # load() + actions
└── (fragments)/
    └── default.luat     # Renders after form submission
```

Templates can also be method-specific. For example, `POST-delete.luat` takes precedence over `delete.luat` for POST requests.

This is perfect for HTMX partial updates. Your form submits, the action runs, and a small HTML fragment comes back to update just the relevant part of the page.

## Part 2: KV Store

### The Other Gap

Form actions solved mutations. But where does the data go?

During development, we kept reaching for external databases or writing JSON files to disk. It worked, but it felt heavy for simple use cases. We wanted something built-in, something that just works.

So we built a KV store directly into Luat.

### Simple API

```lua
local kv = KV.namespace("blog")

-- Store data
kv:put("post:hello-world", json.encode({
    title = "Hello World",
    content = "My first post"
}))

-- Retrieve data
local post = kv:get("post:hello-world", "json")
print(post.title)  -- "Hello World"

-- Delete data
kv:delete("post:hello-world")

-- List keys
local result = kv:list({ prefix = "post:" })
for _, key in ipairs(result.keys) do
    print(key.name)
end
```

### Expiration Support

Cache entries that auto-expire:

```lua
kv:put("session:abc123", session_data, {
    expirationTtl = 3600  -- expires in 1 hour
})

kv:put("token:xyz", secret, {
    expiration = os.time() + 86400  -- expires tomorrow
})
```

### Metadata

Store additional info alongside your data:

```lua
kv:put("doc:readme", content, {
    metadata = {
        author = "alice",
        version = 2,
        updated = os.time()
    }
})

local value, meta = kv:getWithMetadata("doc:readme")
print(meta.metadata.author)  -- "alice"
```

### Platform Support

- **CLI**: SQLite-backed storage. Data persists in `.luat/data/kv.db`.
- **WASM**: In-memory storage. Data persists for the browser session.

The API is identical on both platforms. Write once, run anywhere.

## Putting It Together

Here's a complete blog module using both features:

```lua
-- src/lib/blog.lua
local kv = KV.namespace("blog")

local M = {}

function M.get_posts()
    local result = kv:list({ prefix = "post:" })
    local posts = {}
    for _, key in ipairs(result.keys) do
        local post = kv:get(key.name, "json")
        if post then table.insert(posts, post) end
    end
    return posts
end

function M.get_post(slug)
    return kv:get("post:" .. slug, "json")
end

function M.save_post(slug, data)
    data.updated = os.time()
    kv:put("post:" .. slug, json.encode(data))
    return data
end

function M.delete_post(slug)
    kv:delete("post:" .. slug)
end

return M
```

```lua
-- src/routes/blog/[slug]/edit/+page.server.lua
local blog = require("blog")

function load(ctx)
    local post = blog.get_post(ctx.params.slug)
    if not post then
        return { error = "Not found", status = 404 }
    end
    return { post = post }
end

actions = {
    default = function(ctx)
        if not ctx.form.title or ctx.form.title == "" then
            return fail(400, { error = "Title required" })
        end
        blog.save_post(ctx.params.slug, ctx.form)
        return { saved = true }
    end,

    delete = function(ctx)
        blog.delete_post(ctx.params.slug)
        return { redirect = "/blog" }
    end
}
```

No external database. No API routes for simple CRUD. Just forms and a KV store.

## Why We Like This

1. **Colocated code** - Load functions and actions live together. Related logic stays together.

2. **Built-in persistence** - No database setup for simple apps. The KV store is always there.

3. **Progressive enhancement** - Forms work without JavaScript. Add HTMX for partial updates if you want.

4. **Clean URLs** - The `?/actionName` format is unobtrusive.

5. **Platform portable** - Same code runs on CLI and WASM.

## Available Now

Both features are included in the [latest release](https://github.com/maravilla-labs/luat). Check the documentation:

- [Form Actions](/docs/application/form-actions)
- [KV Store](/docs/application/kv-store)

We've been using these patterns for months internally. They're solid, they're useful, and now they're yours too.

---

Questions? Found a bug? [Open an issue](https://github.com/maravilla-labs/luat/issues) on GitHub.
