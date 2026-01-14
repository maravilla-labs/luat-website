# Form Actions

Form actions handle form submissions and mutations in Luat applications. Inspired by SvelteKit, they provide a clean way to process POST, PUT, and DELETE requests on page routes.

## Overview

While `load()` functions handle data fetching for GET requests, form actions handle mutations. They're defined in `+page.server.lua` alongside your load function.

```lua
-- src/routes/blog/[slug]/edit/+page.server.lua

-- Data loading (GET requests)
function load(ctx)
    return {
        post = fetch_post(ctx.params.slug)
    }
end

-- Form actions (POST/PUT/DELETE requests)
actions = {
    default = function(ctx)
        update_post(ctx.params.slug, ctx.form)
        return { success = true }
    end
}
```

## URL Format

Form actions use a special URL format with `?/actionName`:

| URL | Action |
|-----|--------|
| `POST /blog/edit` | `actions.default` |
| `POST /blog/edit?/publish` | `actions.publish` |
| `POST /blog/edit?/login` | `actions.login` |
| `PUT /blog/edit?/update` | `actions.update` (or `actions.update.put`) |

The `?/` prefix distinguishes action names from query parameters.

## Defining Actions

### Basic Actions

Define actions as functions in the `actions` table:

```lua
-- src/routes/login/+page.server.lua

actions = {
    -- Default action: handles POST without ?/name
    default = function(ctx)
        local email = ctx.form.email
        local password = ctx.form.password

        if not email or email == "" then
            return fail(400, { error = "Email is required" })
        end

        local user = authenticate(email, password)
        if not user then
            return fail(401, {
                email = email,
                error = "Invalid credentials"
            })
        end

        return {
            success = true,
            redirect = "/dashboard"
        }
    end,

    -- Named action: handles POST ?/register
    register = function(ctx)
        local email = ctx.form.email
        local name = ctx.form.name

        local user = create_user(email, name)
        return { success = true, user = user }
    end
}
```

### Method-Specific Actions

For REST-style APIs, you can define method-specific handlers:

```lua
actions = {
    -- Function handles any method
    publish = function(ctx)
        publish_post(ctx.params.slug)
        return { published = true }
    end,

    -- Table handles specific methods
    update = {
        post = function(ctx)
            -- Handle POST ?/update
            return update_post(ctx.params.slug, ctx.form)
        end,
        put = function(ctx)
            -- Handle PUT ?/update
            return replace_post(ctx.params.slug, ctx.form)
        end,
        delete = function(ctx)
            -- Handle DELETE ?/update
            return delete_post(ctx.params.slug)
        end
    }
}
```

## Context Object

Action handlers receive a context object with request information:

```lua
function(ctx)
    -- Form data (parsed from request body)
    local title = ctx.form.title
    local content = ctx.form.content

    -- Route parameters
    local slug = ctx.params.slug

    -- Query parameters (excluding ?/action)
    local page = ctx.query.page

    -- Request headers
    local auth = ctx.headers["Authorization"]

    -- Request metadata
    local method = ctx.method  -- "POST", "PUT", etc.
    local url = ctx.url        -- Full request URL

    -- Aliases for form data
    local body = ctx.body      -- Same as ctx.form
    local json = ctx.json      -- Same as ctx.form
end
```

## Response Format

Actions return a table that becomes the response:

```lua
return {
    -- HTTP status code (default: 200)
    status = 201,

    -- Response headers
    headers = {
        ["X-Custom"] = "value",
        ["HX-Redirect"] = "/success"
    },

    -- Response data (returned as JSON or passed to template)
    success = true,
    message = "Created successfully"
}
```

### Shorthand: Redirect

Use the `redirect` key for server-side redirects:

```lua
return {
    redirect = "/dashboard"
}
-- Equivalent to: status = 302, headers = { Location = "/dashboard" }
```

## The fail() Helper

The `fail()` function creates error responses:

```lua
-- Basic fail
return fail(400, { error = "Validation failed" })

-- Fail with form data (for re-populating fields)
return fail(400, {
    email = ctx.form.email,
    error = "Password is too short"
})

-- Fail with custom headers
return fail(400, {
    error = "Invalid input",
    headers = {
        ["HX-Retarget"] = "#error-container"
    }
})
```

`fail(status, data)` is equivalent to:

```lua
return {
    status = status,
    -- ... all keys from data
}
```

## Fragments (HTML Responses)

When an action returns data, Luat can render it as HTML using a fragment template. Fragments are partial HTML responses (without the full page wrapper) - perfect for HTMX partial updates.

Place fragment templates in a `(fragments)` subfolder:

```
src/routes/login/
├── +page.luat
├── +page.server.lua
└── (fragments)/
    └── default.luat     # Renders after form submission
```

The action's return value becomes `props` in the fragment:

```lua
actions = {
    default = function(ctx)
        return { success = true, message = "Logged in!" }
    end
}
```

```html
<!-- (fragments)/default.luat -->
<div class="alert">{props.message}</div>
```

If no matching fragment exists, the response is returned as JSON.

For detailed coverage of fragments including method-specific templates, GET actions, and naming conventions, see [Fragments in Advanced Routing](/docs/application/dynamic-routes#fragments).

## HTMX Integration

Form actions work seamlessly with HTMX. Fragments return HTML that HTMX can swap into the page without a full reload.

### Basic Example

```html
<!-- +page.luat -->
<form method="POST" action="?/add" hx-post="?/add" hx-target="#result">
    <input name="title" placeholder="New item" />
    <button type="submit">Add</button>
</form>

<div id="result"></div>
```

```lua
-- +page.server.lua
actions = {
    add = function(ctx)
        local item = create_item(ctx.form.title)
        return { item = item }
    end
}
```

```html
<!-- (fragments)/add.luat -->
<p>Added: {props.item.title}</p>
```

When the form submits, HTMX posts to `?/add`, the action runs, and `add.luat` renders HTML that gets swapped into `#result`.

### Response Headers

You can control HTMX behavior with response headers:

```lua
return {
    success = true,
    headers = {
        ["HX-Redirect"] = "/dashboard",    -- Client-side redirect
        ["HX-Trigger"] = "itemAdded",      -- Trigger events
        ["HX-Reswap"] = "innerHTML",       -- Change swap method
        ["HX-Refresh"] = "true"            -- Refresh page
    }
}
```

For more patterns, see [HTMX Patterns](/docs/advanced/htmx-patterns) and [HTMX & Fragments Guide](/docs/advanced/htmx-and-fragments).

## Complete Example

Here's a full example of a blog post editor with multiple actions:

### File Structure

```
src/routes/blog/[slug]/edit/
├── +page.luat
├── +page.server.lua
└── (fragments)/
    ├── default.luat
    └── publish.luat
```

### Server File

```lua
-- +page.server.lua
local blog = require("blog")

function load(ctx)
    local post = blog.get_post(ctx.params.slug)
    if not post then
        return { error = "Post not found", status = 404 }
    end
    return { post = post }
end

actions = {
    -- Save draft (default action)
    default = function(ctx)
        local slug = ctx.params.slug

        if not ctx.form.title or ctx.form.title == "" then
            return fail(400, {
                title = ctx.form.title,
                content = ctx.form.content,
                error = "Title is required"
            })
        end

        blog.update_post(slug, {
            title = ctx.form.title,
            content = ctx.form.content
        })

        return { saved = true }
    end,

    -- Publish post
    publish = function(ctx)
        local slug = ctx.params.slug
        blog.publish_post(slug)

        return {
            published = true,
            headers = {
                ["HX-Redirect"] = "/blog/" .. slug
            }
        }
    end,

    -- Delete post
    delete = function(ctx)
        local slug = ctx.params.slug
        blog.delete_post(slug)

        return {
            deleted = true,
            redirect = "/blog"
        }
    end
}
```

### Page Template

```html
<!-- +page.luat -->
<script>
    local post = props.post
</script>

<h1>Edit: {post.title}</h1>

<form method="POST" hx-post hx-target="#save-result">
    <input name="title" value="{post.title}" placeholder="Title" />
    <textarea name="content">{post.content}</textarea>
    <button type="submit">Save Draft</button>
</form>

<div id="save-result"></div>

<form method="POST" action="?/publish" hx-post="?/publish">
    <button type="submit">Publish</button>
</form>

<form method="POST" action="?/delete">
    <button type="submit" onclick="return confirm('Delete this post?')">
        Delete
    </button>
</form>
```

### Action Template

```html
<!-- (fragments)/default.luat (save result) -->
{#if props.error}
    <div class="bg-red-100 text-red-700 p-4 rounded">
        {props.error}
    </div>
{:else if props.saved}
    <div class="bg-green-100 text-green-700 p-4 rounded">
        Draft saved!
    </div>
{/if}
```
