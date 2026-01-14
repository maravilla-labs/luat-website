# HTMX & Fragments Guide

This guide shows how to build interactive applications using HTMX with Luat's form actions and fragments. We'll cover setup, common patterns, and advanced techniques.

> **Quick reference:** See [HTMX Patterns](/docs/advanced/htmx-patterns) for a concise cheatsheet of HTMX attributes and techniques.

## Project Setup

### Installing HTMX

**Option 1: CDN (quickest start)**

Add HTMX to your `src/app.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%luat.title%</title>
    <link rel="stylesheet" href="/css/app.css">
    %luat.head%
</head>
<body hx-boost="true" class="bg-gray-50">
    %luat.body%
    <script src="https://unpkg.com/htmx.org@2.0.4"></script>
</body>
</html>
```

**Option 2: npm with TypeScript**

For more control, install via npm:

```bash
npm install htmx.org
```

Create `assets/js/app.ts`:

```typescript
import htmx from 'htmx.org';

// Make htmx available globally
declare global {
    interface Window { htmx: typeof htmx; }
}
window.htmx = htmx;

console.log('HTMX loaded');
```

Configure your bundler (esbuild) in `luat.toml`:

```toml
[frontend]
enabled = ["tailwind", "typescript"]
typescript_entry = "assets/js/app.ts"
typescript_output = "public/js/app.js"
```

Then include in `app.html`:

```html
<script src="/js/app.js"></script>
```

### The hx-boost Attribute

Adding `hx-boost="true"` to `<body>` makes all links and forms use AJAX automatically. This gives SPA-like navigation without code changes - pages load faster and feel smoother.

## Forms + Fragments Basics

The core pattern: a form submits to an action, the action returns data, a fragment renders the response.

### File Structure

```
src/routes/todos/
├── +page.luat           # Full page with form
├── +page.server.lua     # load() + actions
└── (fragments)/
    ├── add.luat         # Renders after ?/add
    ├── delete.luat      # Renders after ?/delete
    └── toggle.luat      # Renders after ?/toggle
```

### Server Code

```lua
-- +page.server.lua
local kv = KV.namespace("todos")

function load(ctx)
    local todos = kv:list({ prefix = "todo:" })
    local items = {}
    for _, key in ipairs(todos.keys) do
        local todo = kv:get(key.name, "json")
        if todo then table.insert(items, todo) end
    end
    return { todos = items }
end

actions = {
    add = function(ctx)
        local id = tostring(os.time())
        local todo = {
            id = id,
            title = ctx.form.title,
            completed = false
        }
        kv:put("todo:" .. id, json.encode(todo))
        return { todo = todo }
    end,

    toggle = function(ctx)
        local todo = kv:get("todo:" .. ctx.form.id, "json")
        todo.completed = not todo.completed
        kv:put("todo:" .. ctx.form.id, json.encode(todo))
        return { todo = todo }
    end,

    delete = function(ctx)
        kv:delete("todo:" .. ctx.form.id)
        return { deleted = true }
    end
}
```

### Page Template

```html
<!-- +page.luat -->
<div class="max-w-md mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Todos</h1>

    <!-- Add form -->
    <form
        method="POST"
        action="?/add"
        hx-post="?/add"
        hx-target="#todo-list"
        hx-swap="beforeend"
        hx-on::after-request="this.reset()"
    >
        <input
            name="title"
            placeholder="What needs to be done?"
            class="border p-2 rounded w-full"
            required
        />
    </form>

    <!-- Todo list -->
    <ul id="todo-list" class="mt-4 space-y-2">
        {#each props.todos as todo}
            <li id="todo-{todo.id}" class="flex items-center gap-2 p-2 bg-white rounded shadow">
                <button
                    hx-post="?/toggle"
                    hx-vals='{"id": "{todo.id}"}'
                    hx-target="#todo-{todo.id}"
                    hx-swap="outerHTML"
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                >
                    {todo.completed and "✓" or ""}
                </button>
                <span class="{todo.completed and 'line-through text-gray-400' or ''}">{todo.title}</span>
                <button
                    hx-post="?/delete"
                    hx-vals='{"id": "{todo.id}"}'
                    hx-target="#todo-{todo.id}"
                    hx-swap="outerHTML"
                    class="ml-auto text-red-500 hover:text-red-700"
                >
                    ×
                </button>
            </li>
        {/each}
    </ul>
</div>
```

### Fragment Templates

```html
<!-- (fragments)/add.luat -->
<li id="todo-{props.todo.id}" class="flex items-center gap-2 p-2 bg-white rounded shadow">
    <button
        hx-post="?/toggle"
        hx-vals='{"id": "{props.todo.id}"}'
        hx-target="#todo-{props.todo.id}"
        hx-swap="outerHTML"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
    >
    </button>
    <span>{props.todo.title}</span>
    <button
        hx-post="?/delete"
        hx-vals='{"id": "{props.todo.id}"}'
        hx-target="#todo-{props.todo.id}"
        hx-swap="outerHTML"
        class="ml-auto text-red-500 hover:text-red-700"
    >
        ×
    </button>
</li>
```

```html
<!-- (fragments)/toggle.luat -->
<li id="todo-{props.todo.id}" class="flex items-center gap-2 p-2 bg-white rounded shadow">
    <button
        hx-post="?/toggle"
        hx-vals='{"id": "{props.todo.id}"}'
        hx-target="#todo-{props.todo.id}"
        hx-swap="outerHTML"
        class="w-6 h-6 rounded-full border-2 flex items-center justify-center"
    >
        {props.todo.completed and "✓" or ""}
    </button>
    <span class="{props.todo.completed and 'line-through text-gray-400' or ''}">{props.todo.title}</span>
    <button
        hx-post="?/delete"
        hx-vals='{"id": "{props.todo.id}"}'
        hx-target="#todo-{props.todo.id}"
        hx-swap="outerHTML"
        class="ml-auto text-red-500 hover:text-red-700"
    >
        ×
    </button>
</li>
```

```html
<!-- (fragments)/delete.luat -->
<!-- Empty template - removes the element -->
```

## Common Patterns

### Inline Editing

Switch between view and edit modes without page reload:

```lua
-- +page.server.lua
actions = {
    edit = function(ctx)
        local todo = get_todo(ctx.form.id)
        return { todo = todo, editing = true }
    end,

    save = function(ctx)
        local todo = update_todo(ctx.form.id, ctx.form.title)
        return { todo = todo }
    end,

    cancel = function(ctx)
        local todo = get_todo(ctx.form.id)
        return { todo = todo }
    end
}
```

```html
<!-- (fragments)/edit.luat -->
<li id="todo-{props.todo.id}">
    <form
        hx-post="?/save"
        hx-target="#todo-{props.todo.id}"
        hx-swap="outerHTML"
        class="flex gap-2"
    >
        <input type="hidden" name="id" value="{props.todo.id}" />
        <input name="title" value="{props.todo.title}" class="flex-1 border p-1 rounded" autofocus />
        <button type="submit">Save</button>
        <button
            type="button"
            hx-post="?/cancel"
            hx-vals='{"id": "{props.todo.id}"}'
            hx-target="#todo-{props.todo.id}"
            hx-swap="outerHTML"
        >
            Cancel
        </button>
    </form>
</li>
```

### Out-of-Band Updates

Update multiple parts of the page with one response:

```lua
actions = {
    add = function(ctx)
        local todo = create_todo(ctx.form.title)
        local count = get_todo_count()
        return { todo = todo, count = count }
    end
}
```

```html
<!-- (fragments)/add.luat -->
<li id="todo-{props.todo.id}">...</li>

<!-- Out-of-band: update counter elsewhere on page -->
<span id="todo-count" hx-swap-oob="true">{props.count} items</span>
```

### Loading States

Show feedback during requests:

```html
<button
    hx-post="?/save"
    hx-indicator="#spinner"
    class="relative"
>
    Save
    <span id="spinner" class="htmx-indicator absolute inset-0 bg-white/80 flex items-center justify-center">
        <span class="animate-spin">⟳</span>
    </span>
</button>
```

```css
/* assets/css/app.css */
.htmx-indicator { display: none; }
.htmx-request .htmx-indicator { display: flex; }
```

### Error Handling

Return errors from actions and display them:

```lua
actions = {
    add = function(ctx)
        if not ctx.form.title or ctx.form.title == "" then
            return fail(400, { error = "Title is required" })
        end
        local todo = create_todo(ctx.form.title)
        return { todo = todo }
    end
}
```

```html
<!-- (fragments)/add.luat -->
{#if props.error}
    <div id="add-error" class="text-red-500 p-2" hx-swap-oob="true">
        {props.error}
    </div>
{:else}
    <li id="todo-{props.todo.id}">...</li>
    <div id="add-error" hx-swap-oob="true"></div>
{/if}
```

## Advanced: Smooth Animations

### Idiomorph for DOM Morphing

Idiomorph intelligently updates the DOM, preserving focus and form state:

```bash
npm install idiomorph
```

```typescript
// assets/js/app.ts
import htmx from 'htmx.org';
import { Idiomorph } from 'idiomorph/dist/idiomorph.esm.js';

window.htmx = htmx;

htmx.defineExtension('morph', {
    isInlineSwap: (swapStyle) => swapStyle === 'morph',
    handleSwap: (swapStyle, target, fragment) => {
        if (swapStyle === 'morph') {
            Idiomorph.morph(target, fragment, { morphStyle: 'outerHTML' });
            return [target];
        }
        return false;
    }
});
```

Use with `hx-swap="morph"`:

```html
<div hx-ext="morph">
    <button hx-post="?/toggle" hx-target="closest li" hx-swap="morph">
        Toggle
    </button>
</div>
```

### View Transitions API

Add smooth animations when elements change:

```typescript
// assets/js/app.ts
htmx.config.globalViewTransitions = true;
```

```css
/* assets/css/app.css */

/* Slide in new items */
@keyframes slide-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Slide out removed items */
@keyframes slide-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(30px); }
}

::view-transition-new(todo-*):only-child {
    animation: slide-in 0.25s ease-out;
}

::view-transition-old(todo-*):only-child {
    animation: slide-out 0.2s ease-in;
}
```

Assign view transition names to elements:

```html
<li id="todo-{todo.id}" style="view-transition-name: todo-{todo.id}">
    ...
</li>
```

### Combining Morphing + View Transitions

For the smoothest experience:

```typescript
htmx.config.globalViewTransitions = true;

htmx.defineExtension('morph', {
    isInlineSwap: (swapStyle) => swapStyle === 'morph',
    handleSwap: (swapStyle, target, fragment) => {
        if (swapStyle === 'morph') {
            if ('startViewTransition' in document) {
                (document as any).startViewTransition(() => {
                    Idiomorph.morph(target, fragment, { morphStyle: 'outerHTML' });
                });
            } else {
                Idiomorph.morph(target, fragment, { morphStyle: 'outerHTML' });
            }
            return [target];
        }
        return false;
    }
});
```

## Tips

### Progressive Enhancement

Always include `method` and `action` so forms work without JavaScript:

```html
<form method="POST" action="?/add" hx-post="?/add">
    <!-- Works with and without HTMX -->
</form>
```

### Debouncing

Prevent rapid-fire requests for search/autocomplete:

```html
<input
    name="q"
    hx-get="?/search"
    hx-trigger="keyup changed delay:300ms"
    hx-target="#results"
/>
```

### Request Headers

Control HTMX behavior with response headers:

```lua
return {
    success = true,
    headers = {
        ["HX-Redirect"] = "/dashboard",    -- Client redirect
        ["HX-Trigger"] = "itemAdded",      -- Trigger JS event
        ["HX-Refresh"] = "true",           -- Full page refresh
        ["HX-Reswap"] = "innerHTML"        -- Change swap method
    }
}
```

## Resources

- [HTMX Documentation](https://htmx.org/docs/)
- [Idiomorph](https://github.com/bigskysoftware/idiomorph)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Form Actions](/docs/application/form-actions)
- [Fragments](/docs/application/dynamic-routes#fragments)
