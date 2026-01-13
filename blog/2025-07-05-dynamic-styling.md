---
slug: dynamic-styling-with-luat
title: "Mastering Dynamic Styling"
authors: [labertasch]
tags: [luat, lua, css, frontend, tailwindcss]
description: "Learn how Luat's attribute and class binding features make dynamic styling more intuitive and powerful, drawing inspiration from modern frameworks like Svelte and Vue."
date: 2025-07-05
---

# Mastering Dynamic Styling

In modern web development, creating dynamic, responsive interfaces is everything. The ability to change styles and attributes on the fly based on application state is a cornerstone of a great user experience. That's why we're thrilled to introduce a set of features in Luat that make handling dynamic attributes and CSS classes more intuitive and powerful than ever.

Inspired by the declarative nature of frameworks like Svelte and Vue, we've baked in a syntax that will feel right at home.

<!-- truncate -->

## Attribute Shorthand: Clean and Concise

Let's start with a simple but powerful enhancement: attribute shorthand. We often find ourselves assigning a variable to an attribute of the same name. Now, you can do it with a cleaner syntax.

Instead of this:

```html
<script>
    local title = "A detailed description of the product"
</script>
<a href="/product/1" title={title}>View Product</a>
```

You can now write this:

```html
<script>
    local title = "A detailed description of the product"
</script>
<a href="/product/1" {title}>View Product</a>
```

It's a small change, but it makes your templates less repetitive and easier to read.

## The Power of Tables for Dynamic Classes

This is where things get really exciting. Managing a list of CSS classes with string concatenation can be messy and error-prone. With our table-based syntax for the `class` attribute, you can manage your classes declaratively.

Here's how it works:

```html
<script>
    local isActive = true
    local hasError = false
</script>

<div class={{
    ["card"]: true, -- Always apply the 'card' class
    ["card-active"]: isActive,
    ["card-error"]: hasError,
    ["p-4 rounded-lg"]: true -- Works great with utility-first frameworks!
}}>
    Your content here.
</div>
```

In this example, Luat evaluates the table and compiles a final class string based on which keys have a `true` value. The result is a clean, readable class list:

```html
<div class="card card-active p-4 rounded-lg">
    Your content here.
</div>
```

This approach is incredibly powerful when working with utility-first CSS frameworks like Tailwind CSS. You can construct complex component styles from a set of conditions without a single string interpolation.

For even cleaner templates, you can define the table in your `<script>` block and pass it to the `class` attribute:

```html
<script>
    local buttonClasses = {
        ["btn"]: true,
        ["btn-primary"]: props.isPrimary,
        ["btn-large"]: props.size == 'large'
    }
</script>

<button class={buttonClasses}>Click me</button>
```

This feature is all about improving the developer experience by providing tools that are both powerful and elegant. We believe these changes will help you write cleaner, more maintainable templates.

Dive into our [documentation on Dynamic Attributes & Classes](/docs/templating/dynamic-attributes) to learn more. Happy coding!

---

## Share Your Thoughts

Have thoughts, questions, or feedback? We'd love to hear from you! Connect with me [@thelabertasch](https://x.com/thelabertasch).
