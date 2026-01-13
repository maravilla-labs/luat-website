# Frontend Toolchain

Luat includes an integrated frontend toolchain that automatically handles CSS preprocessing, JavaScript bundling, and asset optimization. Tools are downloaded on-demand and cached locally, requiring no manual installation.

## Supported Tools

### Tailwind CSS

Utility-first CSS framework using the standalone Tailwind CLI binary.

**Configuration:**
```toml
[frontend]
enabled = ["tailwind"]
tailwind_version = "4.0.5"
tailwind_output = "public/css/tailwind.css"
tailwind_content = ["src/**/*.luat", "src/**/*.html"]
```

**Features:**
- Automatic class scanning from `.luat` and `.html` files
- Watch mode in development (auto-rebuilds on changes)
- Minified output in production builds
- No Node.js dependency - uses standalone binary

### Sass

CSS preprocessor for advanced styling with variables, nesting, and mixins.

**Configuration:**
```toml
[frontend]
enabled = ["sass"]
sass_version = "1.77.8"
sass_entrypoint = "src/styles/main.scss"
sass_output = "public/css/main.css"
```

**Features:**
- Dart Sass implementation
- Source maps in development
- Compressed output in production
- Watch mode with incremental compilation

### TypeScript/esbuild

Fast JavaScript/TypeScript bundler.

**Configuration:**
```toml
[frontend]
enabled = ["typescript"]
esbuild_version = "0.24.0"
typescript_entrypoint = "src/app.ts"
typescript_output = "public/js/app.js"
```

**Features:**
- TypeScript transpilation
- ES module bundling
- Tree shaking
- Minification in production
- Watch mode in development

## Tool Management

### Automatic Downloads

When you run `luat dev` or `luat build`, Luat automatically downloads any required tools that aren't already cached.

```bash
$ luat dev
Downloading Tailwind CSS v4.0.5... done
Starting development server...
```

### Cache Location

Tools are cached at platform-specific locations:

| Platform | Cache Directory |
|----------|----------------|
| macOS | `~/Library/Caches/luat/tools/` |
| Linux | `~/.cache/luat/tools/` |
| Windows | `%LOCALAPPDATA%\luat\tools\` |

### Platform Support

All tools are downloaded for your specific platform:

- **Linux**: x64 and ARM64
- **macOS**: x64 (Intel) and ARM64 (Apple Silicon)
- **Windows**: x64

### Version Pinning

You can pin tool versions in `luat.toml` for reproducible builds:

```toml
[frontend]
tailwind_version = "4.0.5"
sass_version = "1.77.8"
esbuild_version = "0.24.0"
```

Use `"latest"` to always use the newest version (default).

## Development vs Production

### Development Mode (`luat dev`)

In development, the toolchain:
- Runs in watch mode (auto-rebuilds on file changes)
- Generates source maps for debugging
- Skips minification for faster builds
- Uses verbose output for troubleshooting

### Production Mode (`luat build`)

In production, the toolchain:
- Runs a single build pass
- Minifies all output
- Removes source maps
- Optimizes for smallest file size

## Combining Tools

You can enable multiple tools:

```toml
[frontend]
enabled = ["tailwind", "sass", "typescript"]
```

Each tool runs independently:
- Tailwind scans your templates and generates utility CSS
- Sass compiles your custom styles
- esbuild bundles your JavaScript/TypeScript

## Linking Assets

Include your compiled assets in `src/app.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>%luat.title%</title>
    <link rel="stylesheet" href="/css/tailwind.css">
    <link rel="stylesheet" href="/css/main.css">
    %luat.head%
</head>
<body>
    %luat.body%
    <script src="/js/app.js"></script>
</body>
</html>
```

## Troubleshooting

### Tool Download Fails

If a tool fails to download:
1. Check your internet connection
2. Verify the version exists (check tool's releases page)
3. Try clearing the cache: `rm -rf ~/.cache/luat/tools/`

### Watch Mode Not Detecting Changes

Ensure your `tailwind_content` patterns match your template files:

```toml
tailwind_content = ["src/**/*.luat", "src/**/*.lua", "src/**/*.html"]
```

### Build Performance

For large projects, consider:
- Using specific glob patterns instead of `**/*`
- Enabling only the tools you need
- Using `luat build` with `--source` for faster builds
