# Embedding Luat as a Library

Luat is a Rust library first; the `luat` CLI is one host built on it. Embed it to render templates inside your own Rust server, or to serve a whole Luat app (routes, `load` functions, actions, API routes) from your own HTTP stack.

## Installation

Luat is not on crates.io. Depend on a release tag:

```toml
[dependencies]
luat = { git = "https://github.com/maravilla-labs/luat", tag = "v0.2.0" }
```

The default features (`native`) include async support and filesystem resolvers. The package manager client is behind the `packages` feature, which needs networking.

## Render a Template

The smallest useful embedding: compile a template and render it with data.

```rust
use luat::{Engine, FileSystemResolver};
use serde_json::json;

fn main() -> Result<(), luat::LuatError> {
    // Templates are resolved relative to this directory.
    let resolver = FileSystemResolver::new("./templates");
    // Keeps up to 100 compiled templates in memory.
    let engine = Engine::with_memory_cache(resolver, 100)?;

    let module = engine.compile_entry("hello.luat")?;
    let context = engine.to_value(json!({
        "name": "World",
        "items": ["Apple", "Banana", "Cherry"]
    }))?;

    let html = engine.render(&module, &context)?;
    println!("{html}");
    Ok(())
}
```

In the template, the data is `props`:

```html
<h1>Hello, {props.name}!</h1>
<ul>
  {#each props.items as item}
    <li>{item}</li>
  {/each}
</ul>
```

`to_value` accepts anything that implements `serde::Serialize`. JSON `null` becomes `nil`.

For tests and generated templates, `MemoryResourceResolver` keeps templates in memory:

```rust
use std::collections::HashMap;
use luat::{memory_resolver::MemoryResourceResolver, Engine};

let resolver = MemoryResourceResolver::new();
resolver.add_template("Card.luat", r#"<div class="card">{props.title}</div>"#.to_string());
let engine = Engine::with_memory_cache(resolver, 10)?;

// One-off source without a file:
let html = engine.render_source("<p>{1 + 1}</p>", &HashMap::new())?;
```

## Serve a Whole App

To run a full Luat app (file-based routes, layouts, `load`, actions, API routes), build a **bundle** and let Luat answer requests. This is exactly what `luat serve` does.

### 1. Build the bundle

At build time, or once at startup:

```rust
use std::path::PathBuf;
use luat::bundle::{build, BuildOptions};

let built = build(
    &BuildOptions {
        routes_dir: PathBuf::from("src/routes"),
        lib_dir: Some(PathBuf::from("src/lib")),
        app_html: Some(PathBuf::from("src/app.html")),
        // Modules your server registers (see Host Modules), so the build
        // does not warn that it cannot resolve them.
        host_modules: vec!["catalog".to_string(), "stock".to_string()],
        ..Default::default()
    },
    |_done, _total| {},
)?;
for warning in &built.warnings {
    eprintln!("warning: {warning}");
}
std::fs::write("dist/bundle.lua", built.bundle.source())?;
```

A bundle is plain Lua source: templates, server code, routes and the app shell in one file. Installed packages (`packages_dir`) are compiled in, so the bundle needs nothing else at runtime.

### 2. Load it and answer requests

```rust
use luat::{finalize, Bundle, HttpResponse, LuatRequest, ShellOptions};

let bundle = Bundle::from_source(std::fs::read_to_string("dist/bundle.lua")?)?;
let app = bundle.instantiate()?;

async fn handle(app: &luat::App, request: LuatRequest) -> luat::Result<HttpResponse> {
    let response = match app.router.match_url(&request.path) {
        Some(route) => app.engine.respond_async(&route, &request).await?,
        None => app.engine.respond_not_found_async(app.router.root_error(), &request).await,
    };
    let options = ShellOptions {
        // Tags for the client assets (see below), for %luat.head%.
        head: app.head.clone(),
        ..Default::default()
    };
    Ok(finalize(response, &request, &app.shell, &options))
}
```

`LuatRequest` is built from your HTTP library's request:

```rust
let request = LuatRequest::new("/blog/hello", "GET")
    .with_raw_query("page=2")
    .with_headers(headers)       // HashMap<String, String>
    .with_body(body_bytes);      // for POST, PUT, ...
```

`finalize` wraps pages in the app shell, leaves form-action fragments and htmx-boosted responses bare, and sets the status and `content-type`. The `HttpResponse` you get back has `status`, `headers` (repeatable, e.g. several `Set-Cookie`) and `body`; map them onto your HTTP library.

`respond_async` only returns `Err` when an execution limit stopped the request (see below). Every other problem, like a failing `load` or a missing page, is already an error response.

`Bundle::from_source` checks the bundle's ABI version: a bundle built by another Luat version is rejected with a message to rebuild it.

### One app, or one per request

One `App` can serve concurrent requests: per-request state stays out of shared slots. If you want strict isolation (no Lua globals shared between requests, a fresh memory limit for each), create an app for every request instead. To make that cheap, compile the bundle to bytecode once and load from it:

```rust
use luat::App;

let bytecode = bundle.compile()?;          // once
let app = App::from_bytecode(&bytecode)?;  // per request
```

Bytecode only loads into the exact Lua build that produced it. Cache it per Luat version, never ship it.

### An Axum server

Putting it together with [Axum](https://github.com/tokio-rs/axum) 0.7:

```rust
use std::{collections::HashMap, sync::Arc};

use axum::{
    body::Body,
    extract::{Request, State},
    http::{HeaderName, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    Router,
};
use luat::{finalize, App, Bundle, LuatRequest, ShellOptions};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let bundle = Bundle::from_source(std::fs::read_to_string("dist/bundle.lua")?)?;
    let app = Arc::new(bundle.instantiate()?);

    let router = Router::new().fallback(handle).with_state(app);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
    axum::serve(listener, router).await?;
    Ok(())
}

async fn handle(State(app): State<Arc<App>>, request: Request) -> Response {
    let (parts, body) = request.into_parts();
    let headers: HashMap<String, String> = parts
        .headers
        .iter()
        .filter_map(|(k, v)| v.to_str().ok().map(|v| (k.to_string(), v.to_string())))
        .collect();
    let Ok(body) = axum::body::to_bytes(body, 1024 * 1024).await else {
        return StatusCode::PAYLOAD_TOO_LARGE.into_response();
    };
    let request = LuatRequest::new(parts.uri.path(), parts.method.as_str())
        .with_raw_query(parts.uri.query().unwrap_or(""))
        .with_headers(headers)
        .with_body(body.to_vec());

    let response = match app.router.match_url(&request.path) {
        Some(route) => match app.engine.respond_async(&route, &request).await {
            Ok(response) => response,
            Err(_) => return StatusCode::SERVICE_UNAVAILABLE.into_response(),
        },
        None => app.engine.respond_not_found_async(app.router.root_error(), &request).await,
    };
    let options = ShellOptions { head: app.head.clone(), ..Default::default() };
    let http = finalize(response, &request, &app.shell, &options);

    let mut builder = Response::builder().status(http.status);
    for (name, value) in http.headers.iter() {
        if let (Ok(name), Ok(value)) = (HeaderName::try_from(name), HeaderValue::try_from(value)) {
            builder = builder.header(name, value);
        }
    }
    builder
        .body(Body::from(http.body))
        .unwrap_or_else(|_| StatusCode::INTERNAL_SERVER_ERROR.into_response())
}
```

Serve `public/` and the hashed client assets (`_luat/immutable/`) next to it, for example with `tower_http::services::ServeDir`.

## Host Modules

Give templates and server code access to your own Rust functions with `register_module`. Guest code loads them with `require`:

```rust
app.engine.register_module("catalog", |lua| {
    let m = lua.create_table()?;
    m.set("currency", "EUR")?;
    m.set("price", lua.create_function(|_, sku: String| {
        Ok(if sku == "A1" { 9.5 } else { 0.0 })
    })?)?;
    Ok(m)
})?;
```

```lua
-- src/routes/shop/[sku]/+page.server.lua
local catalog = require("catalog")

function load(ctx)
  return { price = catalog.price(ctx.params.sku), currency = catalog.currency }
end
```

Functions can be **async**: server code runs as a coroutine, so it simply waits for them. Answer requests with `respond_async` for this to work:

```rust
app.engine.register_module("stock", |lua| {
    let m = lua.create_table()?;
    m.set("count", lua.create_async_function(|_, sku: String| async move {
        // Query a database, call an API, ...
        let count = fetch_stock(&sku).await.map_err(mlua::Error::external)?;
        Ok(count)
    })?)?;
    Ok(m)
})?;
```

`require` resolves only modules inside the bundle, installed packages and the modules you register. Guest code cannot load files from disk or reach Lua's search path. List your module names in `BuildOptions::host_modules`.

## Execution Limits

Templates and server code are code. Limit what one request may use, so a runaway loop or a huge allocation fails that request instead of your server:

```rust
use std::time::{Duration, Instant};
use luat::{EngineLimits, LimitExceeded};

let limits = EngineLimits {
    memory_bytes: Some(64 * 1024 * 1024),
    instruction_budget: Some(50_000_000),
    deadline: Some(Instant::now() + Duration::from_secs(2)),
};
// The limits apply before any of the bundle's code runs.
let app = bundle.instantiate_with_limits(&limits)?;

match app.engine.respond_async(&route, &request).await {
    Ok(response) => { /* finalize and send */ }
    Err(e) => {
        let which = app.engine.limit_exceeded().or_else(|| LimitExceeded::from_error(&e));
        eprintln!("request stopped: {which:?}");
        // Discard this engine: a limit tripped.
    }
}
```

The deadline is a point in time, so set it per request: with an app per request, or by calling `app.engine.set_limits(&limits)` before each one. Lua pattern matching (`string.find`, `gsub`, ...) counts against the same limits.

## Client Assets

If the project lists `[frontend] entries`, build them with hashed file names and embed their manifest in the bundle. Templates then get URLs with `asset("src/client/app.js")`, and `App::head` holds the tags for `%luat.head%`:

```rust
use luat::assets::{build_assets, find_project_tool, AssetOptions};

let project = PathBuf::from(".");
let manifest = build_assets(&AssetOptions {
    project_dir: project.clone(),
    entries: vec!["src/client/app.js".into(), "src/client/app.css".into()],
    out_dir: PathBuf::from("dist"), // writes dist/_luat/immutable/
    esbuild: find_project_tool(&project, "esbuild").expect("npm install esbuild"),
    tailwind: find_project_tool(&project, "tailwindcss"),
    production: true,
})?;

let built = build(&BuildOptions { assets: Some(manifest), ..options }, |_, _| {})?;
```

Serve `/_luat/immutable/*` with `Cache-Control: public, max-age=31536000, immutable`: every file name contains its content hash, so a change is a new URL. See [Frontend Toolchain](../templating/toolchain.md#entries-hashed-builds).

## Errors

Everything returns `luat::Result<T>`, with `luat::LuatError` as the error. Its `Display` gives a readable message with the template and line. The variants you are most likely to match:

| Variant | When |
|---------|------|
| `ParseError { .. }` | A template has a syntax error |
| `ResolutionError(msg)`, `ModuleNotFound(name)` | A template or `require` names something that doesn't exist |
| `LuaError(..)`, `TemplateRuntimeError { .. }` | Lua code failed while rendering (the latter with the template's line) |
| `InvalidTemplate(msg)` | Invalid input, e.g. a bundle built by another Luat version |

When you serve an app with `respond_async`, you rarely see these: Luat turns them into error pages (`+error.luat`) itself.
