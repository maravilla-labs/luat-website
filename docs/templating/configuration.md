# Configuration (luat.toml)

Luat projects are configured using a `luat.toml` file in the project root. This file controls project settings, development server options, build configuration, routing behavior, and frontend toolchain settings.

## Complete Configuration Reference

```toml
[project]
name = "my-app"
version = "0.1.0"

[dev]
port = 3000
host = "127.0.0.1"
templates_dir = "templates"        # or "src/routes" for SvelteKit style

[build]
output_dir = "dist"
bundle_format = "source"           # or "binary"

[routing]
simplified = false                 # true for simple file-based routing
routes_dir = "src/routes"
lib_dir = "src/lib"
static_dir = "static"
app_html = "src/app.html"

[frontend]
enabled = ["tailwind"]             # Options: "sass", "tailwind", "typescript"

# Sass configuration
sass_version = "1.77.8"
sass_entrypoint = "src/styles/main.scss"
sass_output = "public/css/main.css"

# Tailwind CSS configuration
tailwind_version = "4.0.5"
tailwind_output = "public/css/tailwind.css"
tailwind_content = ["src/**/*.luat", "src/**/*.lua"]

# TypeScript/esbuild configuration
esbuild_version = "0.24.0"
typescript_entrypoint = "src/app.ts"
typescript_output = "public/js/app.js"
```

## Section Reference

### [project]

Basic project metadata.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | directory name | Project name |
| `version` | string | `"0.1.0"` | Project version |

### [dev]

Development server configuration.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | integer | `3000` | Development server port |
| `host` | string | `"127.0.0.1"` | Development server host |
| `templates_dir` | string | `"templates"` | Directory containing templates |

### [build]

Build configuration for production.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `output_dir` | string | `"dist"` | Output directory for builds |
| `bundle_format` | string | `"source"` | Bundle format: `"source"` or `"binary"` |

### [routing]

File-based routing configuration.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `simplified` | boolean | `false` | Use simplified routing (direct file-to-URL mapping) |
| `routes_dir` | string | `"src/routes"` | Directory containing route files |
| `lib_dir` | string | `"src/lib"` | Directory for shared Lua modules |
| `static_dir` | string | `"static"` | Directory for static assets |
| `app_html` | string | `"src/app.html"` | HTML shell template path |

### [frontend]

Frontend toolchain configuration.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | array | `[]` | Enabled frontend tools: `"sass"`, `"tailwind"`, `"typescript"` |

#### Sass Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sass_version` | string | `"latest"` | Dart Sass version to use |
| `sass_entrypoint` | string | `"src/styles/main.scss"` | Main Sass file |
| `sass_output` | string | `"public/css/main.css"` | Compiled CSS output path |

#### Tailwind Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tailwind_version` | string | `"latest"` | Tailwind CSS version |
| `tailwind_output` | string | `"public/css/tailwind.css"` | Output CSS path |
| `tailwind_content` | array | `["src/**/*.luat"]` | Files to scan for classes |

#### TypeScript/esbuild Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `esbuild_version` | string | `"latest"` | esbuild version |
| `typescript_entrypoint` | string | `"src/app.ts"` | Main TypeScript file |
| `typescript_output` | string | `"public/js/app.js"` | Bundled JS output path |

## Example Configurations

### Minimal Configuration

```toml
[project]
name = "my-app"
```

### With Tailwind CSS

```toml
[project]
name = "my-app"

[frontend]
enabled = ["tailwind"]
tailwind_version = "4.0.5"
tailwind_content = ["src/**/*.luat", "src/**/*.html"]
```

### Full-Stack Application

```toml
[project]
name = "my-fullstack-app"
version = "1.0.0"

[dev]
port = 8080
host = "0.0.0.0"

[routing]
simplified = false
routes_dir = "src/routes"
lib_dir = "src/lib"
static_dir = "static"
app_html = "src/app.html"

[frontend]
enabled = ["tailwind", "typescript"]
tailwind_version = "4.0.5"
tailwind_output = "public/css/styles.css"
tailwind_content = ["src/**/*.luat", "src/**/*.html"]
esbuild_version = "0.24.0"
typescript_entrypoint = "src/main.ts"
typescript_output = "public/js/bundle.js"
```

## Default Configuration

If no `luat.toml` file is present, Luat uses sensible defaults that work for most projects. You only need to create a configuration file when you want to customize behavior.
