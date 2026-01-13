import React from 'react';
import { FileCode } from 'lucide-react';
import styles from './styles.module.css';

export default function CodeExample() {
  const codeExample = `<!-- ProductList.luat -->
<script>
  local ProductCard = require("ProductCard")
  local products = props.products or {}
</script>

<section class="p-6">
  <h1 class="text-2xl font-bold mb-4">
    Featured Products
  </h1>

  <div class="grid grid-cols-3 gap-4">
    {#each products as product}
      <ProductCard
        name={product.name}
        price={product.price}
        image={product.image}
        inStock={product.inStock}
      />
    {/each}
  </div>

  {#if #products == 0}
    <p class="text-gray-500 text-center">
      No products found.
    </p>
  {/if}
</section>`;

  return (
    <div className={styles.codeContainer}>
      <div className={styles.codeHeader}>
        <div className={styles.windowControls}>
          <span className={styles.control}></span>
          <span className={styles.control}></span>
          <span className={styles.control}></span>
        </div>
        <div className={styles.filename}>
          <FileCode size={16} style={{ marginRight: '0.5rem' }} />
          ProductList.luat
        </div>
      </div>
      <pre className={styles.code}>
        <code dangerouslySetInnerHTML={{ __html: highlightCode(codeExample) }} />
      </pre>
    </div>
  );
}

function highlightCode(code) {
  // Tokenize and highlight
  const tokens = [];
  let remaining = code;
  let match;
  
  // Define patterns in order of priority
  const patterns = [
    { regex: /<!--.*?-->/g, class: 'comment' },
    { regex: /<ProductCard[\s\S]*?\/>/g, class: 'component' },
    { regex: /<script>|<\/script>|<section[^>]*>|<\/section>|<div[^>]*>|<\/div>|<h1[^>]*>|<\/h1>|<p[^>]*>|<\/p>|<form[^>]*>|<\/form>|<input[^>]*>|<button[^>]*>|<\/button>|<ul[^>]*>|<\/ul>|<li[^>]*>|<\/li>|<span[^>]*>|<\/span>/g, class: 'tag' },
    { regex: /{#each[^}]+}|{\/each}|{#if[^}]*}|{\/if}|{:else}/g, class: 'directive' },
    { regex: /{[^#\/:][^}]*}/g, class: 'expression' },
    { regex: /@[a-zA-Z][a-zA-Z0-9.-]*|x-[a-zA-Z][a-zA-Z0-9-]*/g, class: 'directive' },
    { regex: /\b(local|function|end|if|then|else|return|require|or)\b/g, class: 'keyword' },
    { regex: /"[^"]*"/g, class: 'string' },
    { regex: /\b(true|false)\b|\b\d+\b/g, class: 'literal' }
  ];
  
  // Split code into tokens
  while (remaining.length > 0) {
    let found = false;
    let earliestMatch = null;
    let earliestIndex = remaining.length;
    let matchedPattern = null;
    
    // Find the earliest match among all patterns
    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;
      const match = pattern.regex.exec(remaining);
      if (match && match.index < earliestIndex) {
        earliestMatch = match;
        earliestIndex = match.index;
        matchedPattern = pattern;
      }
    }
    
    if (earliestMatch) {
      // Add any text before the match
      if (earliestIndex > 0) {
        tokens.push({ text: remaining.substring(0, earliestIndex), class: null });
      }
      
      // Add the matched token
      tokens.push({ text: earliestMatch[0], class: matchedPattern.class });
      
      // Continue with the rest
      remaining = remaining.substring(earliestIndex + earliestMatch[0].length);
    } else {
      // No more matches, add the rest as plain text
      tokens.push({ text: remaining, class: null });
      break;
    }
  }
  
  // Build the highlighted HTML
  return tokens.map(token => {
    const escaped = token.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    return token.class 
      ? `<span class="${token.class}">${escaped}</span>`
      : escaped;
  }).join('');
}
