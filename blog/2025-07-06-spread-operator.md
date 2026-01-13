---
slug: spread-operator-in-components
title: "A Lua Touch on a JavaScript Classic"
authors: [labertasch]
tags: [luat, lua, components, frontend]
description: "Luat supports the spread operator for component props, bringing a familiar JavaScript pattern to our Lua-based templating system."
date: 2025-07-06
---

# A Lua Touch on a JavaScript Classic

Today, we're highlighting a small but significant feature in Luat's templating system: the spread operator for component props. If you're familiar with React or other modern JavaScript frameworks, you'll recognize this pattern immediately. It's a convenient way to pass multiple properties to a component in one go.

<!-- truncate -->

## The Spread Operator in Action

Consider a scenario where you have a set of properties stored in a table that you want to pass to a component. Without the spread operator, you'd have to list each property individually:

```html
<script>
    local Button = require("lib/components/Button")
    local buttonProps = { label = "Save", type = "button", variant = "primary" }
</script>

<Button
    label={buttonProps.label}
    type={buttonProps.type}
    variant={buttonProps.variant}
/>
```

With the spread operator, you can simply write:

```html
<Button {...buttonProps} />
```

This syntax "spreads" all the key-value pairs from the `buttonProps` table as individual props to the `Button` component.

## Why This Matters

While it might look like a small syntactic convenience, this feature has several practical benefits:

1. **Cleaner Templates**: Less repetitive code means more readable templates.
2. **Dynamic Props**: Easily construct and modify prop collections based on your application logic.
3. **Prop Forwarding**: Simplifies passing props from parent to child components.
4. **Component Composition**: Makes it easier to build higher-order components that extend functionality.

## A Lua Implementation

It's worth noting that while the syntax resembles JavaScript's spread operator, this is a pure Lua implementation tailored for our templating system. This is not about bringing JavaScript into our Lua environment but rather about adopting sensible patterns that improve developer experience.

The spread operator works with any Lua table:

```html
<script>
    local Card = require("lib/components/Card")
    local baseProps = { title = "My Card", outlined = true }
    local themeProps = { variant = "primary", size = "large" }
</script>

<Card {...baseProps} {...themeProps} />
```

## Mixing Spreads with Direct Props

You can also mix spread properties with directly specified props. When you do this, the direct props take precedence:

```html
<script>
    local Button = require("lib/components/Button")
    local baseProps = { label = "Default", type = "button" }
</script>

<Button {...baseProps} label="Submit" />
```

In this example, the button will render with `label="Submit"` (overriding the "Default" from `baseProps`) and `type="button"` (from the spread).

## A Practical Example

Here's a real-world example showing how the spread operator can simplify your templates:

```html
<script>
    local SectionField = require("lib/components/content/SectionField")
    local Page = require("lib/components/container/Page")
    local Hero = require("lib/components/content/Hero")
    local currentNode = getContext("currentNode")

    local hero = $derive(currentNode.properties.hero or {})
</script>

<Page>
    <Hero title={hero.title} subtitle={hero.subtitle} image={hero.image} />
    {#each currentNode.properties.content as section}
        {@local Component = getMatchingBlockType(section.block_type)}
        {#if not Component}
           <h1>No matching block type found for {section.block_type}</h1>
        {:else}
            <Component {...section} />
        {/if}
    {/each}
</Page>
```

Notice how we're using `<Component {...section} />` to dynamically pass all properties from each section to the matching component. Without the spread operator, this would require significantly more code and wouldn't be nearly as elegant.

## Full Documentation

For full details on using the spread operator, including precedence rules and multiple spreads, check out our updated [Template Syntax documentation](/docs/templating/syntax#props-spread-operator).

---

## Share Your Thoughts

Have thoughts or questions about this feature? We'd love to hear how you're using it! Connect with me [@thelabertasch](https://x.com/thelabertasch).
