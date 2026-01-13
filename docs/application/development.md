# Building & Running

Luat provides CLI commands for development, building, and serving your application.

## Development Mode

### Starting the Dev Server

```bash
luat dev
```

This starts the development server with:
- **Live reload** - Changes to `.luat` and `.lua` files trigger page refresh
- **File watching** - Automatic rebuilds on file changes
- **Frontend toolchain** - Tailwind/Sass/TypeScript compilation in watch mode
- **Default URL**: http://127.0.0.1:3000

### Custom Port and Host

```bash
# Different port
luat dev --port 8080

# Listen on all interfaces
luat dev --host 0.0.0.0

# Both
luat dev --port 8080 --host 0.0.0.0
```

### What Happens on Startup

1. Reads `luat.toml` configuration
2. Downloads any required frontend tools (first run only)
3. Compiles frontend assets (Tailwind, etc.)
4. Starts the HTTP server
5. Begins watching for file changes

```
$ luat dev
Downloading Tailwind CSS v4.0.5... done
Compiling Tailwind CSS... done
Starting development server at http://127.0.0.1:3000
Watching for changes...
```

### Live Reload Behavior

| File Type | Action |
|-----------|--------|
| `.luat` | Page refresh |
| `.lua` | Page refresh |
| `.css` / `.scss` | CSS hot reload (no page refresh) |
| `.ts` / `.js` | Page refresh |
| `luat.toml` | Server restart required |

## Production Build

### Building for Production

```bash
luat build
```

This creates an optimized production build:
- Compiles all templates to a bundle
- Minifies CSS and JavaScript
- Outputs to `dist/` directory

### Build Options

```bash
# Output Lua source instead of binary
luat build --source

# Custom output directory
luat build --output ./build

# Both
luat build --source --output ./my-build
```

### Build Output

```
dist/
├── bundle.bin           # Compiled template bundle (binary)
└── public/
    ├── css/
    │   └── tailwind.css # Minified CSS
    └── js/
        └── app.js       # Minified JS
```

Or with `--source`:

```
dist/
├── bundle.lua           # Compiled template bundle (source)
└── public/
    └── ...
```

## Production Server

### Serving Production Build

```bash
luat serve
```

This runs the production server:
- **No live reload** - Optimized for performance
- **Default**: http://0.0.0.0:3000 (listens on all interfaces)
- Uses pre-built bundle from `dist/`

### Server Options

```bash
# Different port
luat serve --port 80

# Specific host
luat serve --host 127.0.0.1

# Both
luat serve --port 8080 --host 0.0.0.0
```

## Watch Mode

### File Watching Without Server

```bash
luat watch
```

Watches files and rebuilds on changes without starting a server. Useful for:
- Build pipelines
- Integration with external servers
- CI/CD workflows

## Workflow Summary

### Development Workflow

```bash
# 1. Create project
luat init my-app
cd my-app

# 2. Start development
luat dev

# 3. Make changes - live reload handles the rest
# Edit src/routes/+page.luat, save, see changes instantly
```

### Production Deployment

```bash
# 1. Build for production
luat build

# 2. Deploy dist/ to your server

# 3. Run production server
luat serve --port 80
```

## Configuration

All build settings are configured in `luat.toml`:

```toml
[project]
name = "my-app"

[dev]
port = 3000
host = "127.0.0.1"

[build]
output_dir = "dist"
bundle_format = "source"  # or "binary"

[frontend]
enabled = ["tailwind"]
tailwind_version = "4.0.5"
tailwind_output = "public/css/tailwind.css"
```

## Environment Differences

| Feature | `luat dev` | `luat serve` |
|---------|------------|--------------|
| Live reload | Yes | No |
| File watching | Yes | No |
| CSS minification | No | Yes |
| JS minification | No | Yes |
| Source maps | Yes | No |
| Default host | 127.0.0.1 | 0.0.0.0 |
| Performance | Development | Optimized |

## Troubleshooting

### Port Already in Use

```bash
# Error: Address already in use (port 3000)
luat dev --port 3001
```

### Frontend Tools Not Downloading

Check your internet connection, then try clearing the tool cache:

```bash
rm -rf ~/.cache/luat/tools/
luat dev
```

### Changes Not Reflecting

1. Check file is in `src/routes/` or `src/lib/`
2. Verify file extension is `.luat` or `.lua`
3. Check for syntax errors in terminal output
4. Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Build Fails

Check the error output for:
- Template syntax errors
- Missing required modules
- Invalid configuration in `luat.toml`
