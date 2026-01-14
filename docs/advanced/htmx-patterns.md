# HTMX Patterns

Common HTMX patterns for building interactive web applications.

> **Looking for a complete tutorial?** See the [HTMX & Fragments Guide](/docs/advanced/htmx-and-fragments) for step-by-step integration with Luat forms and fragments.

## Setup

### CDN

```html
<script src="https://unpkg.com/htmx.org@2.0.4"></script>
```

### npm

```bash
npm install htmx.org
```

```typescript
// assets/js/app.ts
import htmx from 'htmx.org';
window.htmx = htmx;
```

### hx-boost

Add `hx-boost="true"` to `<body>` for automatic AJAX navigation on all links and forms:

```html
<body hx-boost="true">
    ...
</body>
```

## Swap Patterns

### innerHTML (default)

Replace element's content:

```html
<div hx-get="/content" hx-swap="innerHTML">
    <!-- Content replaced here -->
</div>
```

### outerHTML

Replace entire element:

```html
<div hx-get="/content" hx-swap="outerHTML">
    <!-- Entire div replaced -->
</div>
```

### beforeend / afterbegin

Append or prepend to element:

```html
<ul hx-get="/items" hx-swap="beforeend">
    <!-- New items added at end -->
</ul>
```

### delete

Remove element after request:

```html
<button hx-delete="/item/1" hx-swap="delete">Delete</button>
```

## Targeting

### hx-target

Specify where to swap content:

```html
<button hx-get="/content" hx-target="#result">Load</button>
<div id="result"></div>
```

### Relative targets

```html
<button hx-get="/content" hx-target="closest div">Load</button>
<button hx-get="/content" hx-target="next .result">Load</button>
<button hx-get="/content" hx-target="previous li">Load</button>
```

## Triggers

### Default triggers

- `<input>`, `<textarea>`, `<select>`: `change`
- `<form>`: `submit`
- Everything else: `click`

### Custom triggers

```html
<!-- Trigger on keyup with delay -->
<input hx-get="/search" hx-trigger="keyup changed delay:300ms">

<!-- Trigger on multiple events -->
<div hx-get="/data" hx-trigger="load, click">

<!-- Trigger once -->
<div hx-get="/data" hx-trigger="load once">

<!-- Trigger when visible -->
<div hx-get="/data" hx-trigger="revealed">
```

## Passing Data

### hx-vals

Pass JSON values:

```html
<button hx-post="/action" hx-vals='{"id": "123", "type": "delete"}'>
    Delete
</button>
```

### hx-include

Include form fields:

```html
<input id="search" name="q">
<button hx-get="/search" hx-include="#search">Search</button>
```

## Loading States

### hx-indicator

Show loading indicator:

```html
<button hx-get="/data" hx-indicator="#spinner">
    Load
</button>
<span id="spinner" class="htmx-indicator">Loading...</span>
```

```css
.htmx-indicator { display: none; }
.htmx-request .htmx-indicator { display: inline; }
.htmx-request.htmx-indicator { display: inline; }
```

### hx-disabled-elt

Disable elements during request:

```html
<button hx-post="/save" hx-disabled-elt="this">
    Save
</button>
```

## Out-of-Band Updates

Update multiple elements with one response:

```html
<!-- Main response swapped normally -->
<div id="main">Updated content</div>

<!-- These update their targets regardless of hx-target -->
<div id="sidebar" hx-swap-oob="true">New sidebar</div>
<span id="count" hx-swap-oob="true">42</span>
```

## Response Headers

Control HTMX from server responses:

| Header | Effect |
|--------|--------|
| `HX-Redirect` | Client-side redirect |
| `HX-Refresh` | Full page refresh |
| `HX-Trigger` | Trigger client events |
| `HX-Reswap` | Change swap method |
| `HX-Retarget` | Change target element |

```lua
return {
    body = "content",
    headers = {
        ["HX-Trigger"] = "itemSaved",
        ["HX-Reswap"] = "innerHTML"
    }
}
```

## Events

### Listen to HTMX events

```javascript
document.body.addEventListener('htmx:afterSwap', (event) => {
    console.log('Swapped:', event.detail.target);
});

document.body.addEventListener('htmx:beforeRequest', (event) => {
    console.log('Requesting:', event.detail.path);
});
```

### Trigger custom events

```html
<div hx-trigger="customEvent from:body" hx-get="/refresh">
```

```javascript
htmx.trigger(document.body, 'customEvent');
```

## Extensions

HTMX can be extended with additional capabilities:

- **Idiomorph** - Intelligent DOM morphing that preserves focus and form state
- **View Transitions** - Smooth animations when content changes

For detailed setup with Luat forms and fragments, see the [HTMX & Fragments Guide](/docs/advanced/htmx-and-fragments#advanced-smooth-animations).

## Resources

- [HTMX Documentation](https://htmx.org/docs/)
- [HTMX Examples](https://htmx.org/examples/)
- [Idiomorph](https://github.com/bigskysoftware/idiomorph)
