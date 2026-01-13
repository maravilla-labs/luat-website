# Embedding Luat as a Library

Luat can be used as a Rust library for server-side template rendering without the CLI. This is ideal for embedding Luat into existing Rust applications or custom server frameworks.

## Installation

Add Luat to your `Cargo.toml`:

```toml
[dependencies]
luat = "0.1"
```

## Basic Usage

```rust
use luat::{Engine, FileSystemResolver};
use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a resolver that loads templates from the filesystem
    let resolver = FileSystemResolver::new("./templates");

    // Create an engine with memory caching (100 templates max)
    let engine = Engine::with_memory_cache(resolver, 100)?;

    // Compile a template
    let module = engine.compile_entry("hello.luat")?;

    // Create context data
    let context = engine.to_value(json!({
        "name": "World",
        "items": ["Apple", "Banana", "Cherry"]
    }))?;

    // Render the template
    let html = engine.render(&module, &context)?;
    println!("{}", html);

    Ok(())
}
```

## Engine Creation

### Memory Cache

For development and small applications:

```rust
use luat::{Engine, FileSystemResolver};

let resolver = FileSystemResolver::new("./templates");
let engine = Engine::with_memory_cache(resolver, 100)?;
```

The second parameter is the maximum number of compiled templates to cache.

### Filesystem Cache

For production with persistent caching:

```rust
use luat::{Engine, FileSystemResolver};

let resolver = FileSystemResolver::new("./templates");
let engine = Engine::with_filesystem_cache(resolver, "./cache")?;
```

Compiled templates are stored in the specified cache directory.

### Custom Cache

Implement your own caching strategy:

```rust
use luat::{Engine, FileSystemResolver, Cache};

struct MyCache { /* ... */ }

impl Cache for MyCache {
    // Implement cache methods
}

let resolver = FileSystemResolver::new("./templates");
let cache = Box::new(MyCache::new());
let engine = Engine::new(resolver, cache)?;
```

## Resolvers

### FileSystemResolver

Loads templates from a directory:

```rust
use luat::FileSystemResolver;

let resolver = FileSystemResolver::new("./templates");

// Templates are resolved relative to the base path:
// "hello.luat" → "./templates/hello.luat"
// "components/Card.luat" → "./templates/components/Card.luat"
```

### MemoryResourceResolver

For in-memory templates (testing, dynamic content):

```rust
use luat::MemoryResourceResolver;

let mut resolver = MemoryResourceResolver::new();

// Add templates programmatically
resolver.add_template("hello.luat", r#"
    <h1>Hello, {props.name}!</h1>
"#.to_string());

resolver.add_template("Card.luat", r#"
    <div class="card">
        <h2>{props.title}</h2>
        {@render props.children?.()}
    </div>
"#.to_string());

// Remove templates
resolver.remove_template("hello.luat");

// Clear all templates
resolver.clear();
```

### Custom Resolver

Implement `ResourceResolver` for custom loading:

```rust
use luat::ResourceResolver;

struct DatabaseResolver {
    db: Database,
}

impl ResourceResolver for DatabaseResolver {
    fn resolve(&self, path: &str) -> Result<String, Error> {
        self.db.get_template(path)
    }

    fn exists(&self, path: &str) -> bool {
        self.db.template_exists(path)
    }
}
```

## Rendering Methods

### Compile and Render

For templates you'll render multiple times:

```rust
// Compile once
let module = engine.compile_entry("page.luat")?;

// Render multiple times with different contexts
for user in users {
    let context = engine.to_value(&user)?;
    let html = engine.render(&module, &context)?;
    // Use html...
}
```

### Render Source Directly

For one-off templates:

```rust
use std::collections::HashMap;

let source = "<h1>Hello, {props.name}!</h1>";
let mut context = HashMap::new();
context.insert("name".to_string(), serde_json::json!("World"));

let html = engine.render_source(source, &context)?;
```

## Production Bundles

For production deployments, pre-compile templates into bundles.

### Creating a Bundle

```rust
// Collect all template sources
let sources = vec![
    ("index.luat".to_string(), index_source),
    ("Card.luat".to_string(), card_source),
    ("Layout.luat".to_string(), layout_source),
];

// Create Lua source bundle
let lua_code = engine.bundle_sources(sources, |progress| {
    println!("Bundling: {}", progress);
})?;

// Optionally compile to bytecode
let bytecode = engine.compile_bundle(&lua_code)?;

// Save to file
std::fs::write("bundle.bin", bytecode)?;
```

### Loading a Bundle

```rust
// Load from Lua source
let lua_code = std::fs::read_to_string("bundle.lua")?;
engine.preload_bundle_code(&lua_code)?;

// Or load from bytecode
let bytecode = std::fs::read("bundle.bin")?;
engine.preload_bundle_code_from_binary(&bytecode)?;

// Render from bundle
let context = engine.to_value(json!({ "title": "Home" }))?;
let html = engine.render_from_bundle("index", &context).await?;
```

## Context Helpers

### Creating Context from Rust Types

```rust
use serde::Serialize;

#[derive(Serialize)]
struct PageData {
    title: String,
    items: Vec<Item>,
}

let data = PageData {
    title: "My Page".to_string(),
    items: vec![/* ... */],
};

let context = engine.to_value(&data)?;
```

### Creating Lua Tables

```rust
use std::collections::HashMap;

// From HashMap
let mut map = HashMap::new();
map.insert("key", engine.lua().create_string("value")?);
let table = engine.create_table_from_hashmap(map)?;

// From Vec
let items = vec!["a", "b", "c"];
let table = engine.create_table_from_vec(items)?;
```

## Cache Management

```rust
// Check if a template is cached
if engine.cache_contains("page.luat") {
    println!("Template is cached");
}

// Clear all cached templates
engine.clear_cache()?;
```

## Integration Example

Using Luat with Axum:

```rust
use axum::{routing::get, Router, response::Html};
use luat::{Engine, FileSystemResolver};
use std::sync::Arc;

struct AppState {
    engine: Engine<FileSystemResolver>,
}

async fn home(state: Arc<AppState>) -> Html<String> {
    let module = state.engine.compile_entry("+page.luat").unwrap();
    let context = state.engine.to_value(serde_json::json!({
        "title": "Home"
    })).unwrap();

    let html = state.engine.render(&module, &context).unwrap();
    Html(html)
}

#[tokio::main]
async fn main() {
    let resolver = FileSystemResolver::new("./src/routes");
    let engine = Engine::with_memory_cache(resolver, 100).unwrap();

    let state = Arc::new(AppState { engine });

    let app = Router::new()
        .route("/", get(home))
        .with_state(state);

    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

## Error Handling

```rust
use luat::Error;

match engine.compile_entry("page.luat") {
    Ok(module) => {
        // Use module
    }
    Err(Error::TemplateNotFound(path)) => {
        eprintln!("Template not found: {}", path);
    }
    Err(Error::ParseError(msg)) => {
        eprintln!("Parse error: {}", msg);
    }
    Err(Error::RenderError(msg)) => {
        eprintln!("Render error: {}", msg);
    }
    Err(e) => {
        eprintln!("Error: {}", e);
    }
}
```
