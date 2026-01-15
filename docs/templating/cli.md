# Luat CLI Reference

The Luat CLI is the command-line tool for creating, developing, building, and serving Luat applications.

## Installation

### npm (Recommended)

```bash
npm install -g @maravilla-labs/luat
```

### Shell Script (Linux/macOS)

```bash
curl -fsSL https://raw.githubusercontent.com/maravilla-labs/luat/main/scripts/install.sh | sh
```

### Cargo (Rust)

```bash
cargo install luat-cli
```

Verify installation:

```bash
luat --version
```

## Commands

### `luat init`

Creates a new Luat project with SvelteKit-style structure.

```bash
luat init my-project
cd my-project
```

If no name is provided, initializes in the current directory:

```bash
mkdir my-project && cd my-project
luat init
```

**Created structure:**

```
my-project/
├── luat.toml
├── src/
│   ├── app.html
│   ├── routes/
│   │   ├── +layout.luat
│   │   ├── +page.luat
│   │   └── +page.server.lua
│   └── lib/
├── static/
└── public/
```

### `luat dev`

Starts the development server with live reload and file watching.

```bash
luat dev
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--port PORT` | Server port | `3000` |
| `--host HOST` | Server host | `127.0.0.1` |

**Examples:**

```bash
# Default (localhost:3000)
luat dev

# Custom port
luat dev --port 8080

# Listen on all interfaces
luat dev --host 0.0.0.0

# Both
luat dev --port 8080 --host 0.0.0.0
```

**Features:**
- Automatic template recompilation on file changes
- Live reload in browser
- Frontend toolchain watch mode (Tailwind, Sass, TypeScript)
- Automatic tool downloads on first run

### `luat build`

Builds the application for production.

```bash
luat build
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--source` | Output Lua source instead of binary | Binary output |
| `--output DIR` | Output directory | `dist` |

**Examples:**

```bash
# Default build (binary bundle)
luat build

# Lua source bundle
luat build --source

# Custom output directory
luat build --output ./build

# Both
luat build --source --output ./my-build
```

**Output:**

```
dist/
├── bundle.bin          # or bundle.lua with --source
└── public/
    └── css/
        └── tailwind.css
```

### `luat serve`

Serves the production build.

```bash
luat serve
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--port PORT` | Server port | `3000` |
| `--host HOST` | Server host | `0.0.0.0` |

**Examples:**

```bash
# Default (0.0.0.0:3000)
luat serve

# Custom port
luat serve --port 80

# Localhost only
luat serve --host 127.0.0.1
```

**Notes:**
- No live reload (production optimized)
- Requires prior `luat build`
- Default host is `0.0.0.0` (all interfaces)

### `luat watch`

Watches files and rebuilds on changes without starting a server.

```bash
luat watch
```

Useful for:
- Build pipelines
- Integration with external servers
- CI/CD workflows

## Configuration

The CLI reads configuration from `luat.toml` in the project root:

```toml
[project]
name = "my-app"
version = "0.1.0"

[dev]
port = 3000
host = "127.0.0.1"

[build]
output_dir = "dist"
bundle_format = "source"

[routing]
simplified = false
routes_dir = "src/routes"
lib_dir = "src/lib"
static_dir = "static"
app_html = "src/app.html"

[frontend]
enabled = ["tailwind"]
tailwind_version = "4.0.5"
tailwind_output = "public/css/tailwind.css"
tailwind_content = ["src/**/*.luat", "src/**/*.html"]
```

Command-line options override configuration file settings.

## Common Workflows

### Starting a New Project

```bash
luat init my-app
cd my-app
luat dev
```

### Development

```bash
cd my-app
luat dev --port 8080
# Make changes, see live updates
```

### Production Deployment

```bash
# Build
luat build

# Test locally
luat serve

# Deploy dist/ to your server
rsync -av dist/ user@server:/var/www/app/

# Run on server
luat serve --port 80
```

### Adding Pages

1. Create route file:
```bash
mkdir -p src/routes/about
touch src/routes/about/+page.luat
```

2. Add content:
```html
<h1>About Us</h1>
<p>Welcome to our about page.</p>
```

3. View at http://localhost:3000/about

## Troubleshooting

### Command Not Found

Ensure the CLI is installed and in your PATH:

```bash
# Check installation
which luat

# Reinstall if needed
npm install -g @maravilla-labs/luat
```

### Permission Denied

On Unix systems, you may need to adjust permissions:

```bash
chmod +x $(which luat)
```

### Port in Use

```bash
# Check what's using the port
lsof -i :3000

# Use a different port
luat dev --port 3001
```

### Frontend Tools Not Working

Clear the tool cache and retry:

```bash
rm -rf ~/.cache/luat/tools/
luat dev
```

### Build Errors

Check for:
- Syntax errors in `.luat` files
- Missing modules in `require()` calls
- Invalid `luat.toml` configuration

Run with verbose output:

```bash
RUST_LOG=debug luat build
```
