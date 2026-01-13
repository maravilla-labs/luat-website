import React from 'react';
import Link from '@docusaurus/Link';
import { ArrowRight } from 'lucide-react';
import LuatPlayground from '@site/src/components/LuatPlayground';
import styles from './styles.module.css';

const showcaseExamples = [
  {
    title: 'Props Spread Operator',
    description: 'Pass props dynamically with the spread operator. Combine base props, theme props, and overrides.',
    docsLink: '/docs/templating/syntax#props-spread-operator',
    docsLabel: 'Learn about spread operator',
    files: [
      {
        name: 'main.luat',
        code: `<script>
local Button = require("Button")

-- Define reusable prop sets
local baseProps = { size = "md", rounded = true }
local primaryStyle = { variant = "primary" }
local dangerStyle = { variant = "danger" }
</script>

<div class="p-4 space-y-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-xs">
    <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-4">Spread Operator</h3>

    <Button {...baseProps} {...primaryStyle}>
        Combined Props
    </Button>

    <Button {...baseProps} {...dangerStyle} size="lg">
        Override Size
    </Button>

    <Button {...baseProps} variant="secondary" disabled={true}>
        Direct Override
    </Button>
</div>`
      },
      {
        name: 'Button.luat',
        code: `<script>
local variants = {
    primary = "bg-blue-500 hover:bg-blue-600 text-white",
    secondary = "bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100",
    danger = "bg-red-500 hover:bg-red-600 text-white"
}

local sizes = {
    sm = "px-2 py-1 text-sm",
    md = "px-4 py-2",
    lg = "px-6 py-3 text-lg"
}

local classes = {
    ["rounded-lg font-medium transition-colors"] = true,
    [variants[props.variant] or variants.primary] = true,
    [sizes[props.size] or sizes.md] = true,
    ["opacity-50 cursor-not-allowed"] = props.disabled
}
</script>

<button class={classes} disabled={props.disabled}>
    {@render props.children?.()}
</button>`
      }
    ],
    height: 380,
  },
  {
    title: 'Children & Slots',
    description: 'Compose components with children rendering. Build layout components that wrap any content.',
    docsLink: '/docs/templating/components#rendering-children',
    docsLabel: 'Learn about children',
    files: [
      {
        name: 'main.luat',
        code: `<script>
local Card = require("Card")
</script>

<div class="p-4 space-y-4 bg-gray-50 dark:bg-gray-800">
    <Card title="Welcome!" variant="default">
        <p class="text-gray-600 dark:text-gray-300">
            This content is passed as <strong>children</strong>.
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Any HTML works here!
        </p>
    </Card>

    <Card title="Pro Tip" variant="highlight">
        <code class="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            @render children
        </code>
        <span class="ml-2">renders slot content</span>
    </Card>
</div>`
      },
      {
        name: 'Card.luat',
        code: `<script>
local variants = {
    default = "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600",
    highlight = "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-blue-200 dark:border-blue-700"
}
local style = variants[props.variant] or variants.default
</script>

<div class={"rounded-xl border p-4 shadow-sm " .. style}>
    {#if props.title}
        <h3 class="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
            {props.variant == "highlight" and "💡" or "📄"}
            {props.title}
        </h3>
    {/if}
    <div class="text-gray-700 dark:text-gray-300">
        {@render props.children?.()}
    </div>
</div>`
      }
    ],
    height: 380,
  },
  {
    title: 'Full Application',
    description: 'Build complete UIs with multiple components. Server-rendered for instant load times.',
    docsLink: '/docs/templating/components#nested-components',
    docsLabel: 'Learn about composition',
    files: [
      {
        name: 'main.luat',
        code: `<script>
local Badge = require("Badge")
local ProductCard = require("ProductCard")

local products = {
    { name = "Luat Pro", price = 49, badge = "Popular" },
    { name = "Luat Team", price = 99, badge = "Best Value" },
}
</script>

<div class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
    <h2 class="text-xl font-bold text-center mb-4 dark:text-white">Pricing</h2>
    <div class="space-y-3">
        {#each products as product}
            <ProductCard
                name={product.name}
                price={product.price}
                badge={product.badge}
            />
        {/each}
    </div>
</div>`
      },
      {
        name: 'ProductCard.luat',
        code: `<script>
local Badge = require("Badge")
</script>

<div class="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border dark:border-gray-600 flex justify-between items-center">
    <div>
        <div class="font-semibold dark:text-white flex items-center gap-2">
            {props.name}
            {#if props.badge}
                <Badge text={props.badge} />
            {/if}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">per month</div>
    </div>
    <div class="text-2xl font-bold text-green-600 dark:text-green-400">
        ${'$'}{props.price}
    </div>
</div>`
      },
      {
        name: 'Badge.luat',
        code: `<span class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
    {props.text}
</span>`
      }
    ],
    height: 340,
  },
];

export default function HomepageShowcase() {
  return (
    <section className={styles.showcase}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>See It In Action</h2>
          <p className={styles.subtitle}>
            Interactive examples you can edit right here. Change the code and click Run to see the results.
          </p>
        </div>

        <div className={styles.examples}>
          {showcaseExamples.map((example, idx) => (
            <div key={idx} className={styles.example}>
              <div className={styles.exampleHeader}>
                <h3 className={styles.exampleTitle}>{example.title}</h3>
                <p className={styles.exampleDescription}>{example.description}</p>
              </div>
              <LuatPlayground
                files={example.files}
                height={example.height}
                alpine={example.alpine}
                autoRun={true}
              />
              {example.docsLink && (
                <div className={styles.docsLink}>
                  <Link to={example.docsLink}>
                    {example.docsLabel} <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
