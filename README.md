# Luat Documentation Website

The official documentation website for [Luat](https://github.com/maravilla-labs/luat) - a Svelte-inspired server-side Lua templating engine for Rust.

**Live site**: [luat.maravillalabs.com](https://luat.maravillalabs.com)

## Built With

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator by Meta.

### Custom Features

- **Interactive WASM Playground** - Live code editor with real-time Luat template rendering powered by WebAssembly
- **Multi-file Component Examples** - Demonstrate component composition with tabbed file views
- **Custom Theming** - Dark/light mode with custom navbar, scrolling effects, and responsive design
- **Integrated Toolchain Demo** - Tailwind CSS support in playground previews

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

Starts a local development server at `http://localhost:3000` with hot reload.

### Build

```bash
npm run build
```

Generates static content into the `build` directory.

### Deployment

The site automatically deploys to GitHub Pages via GitHub Actions when pushing to `main`.

## Project Structure

```
luat-website/
├── blog/                    # Blog posts
├── docs/                    # Documentation pages
├── src/
│   ├── components/          # React components
│   │   ├── LuatPlayground/  # WASM-powered interactive playground
│   │   ├── CodeExample/     # Homepage code showcase
│   │   └── ...
│   ├── css/                 # Global styles
│   ├── pages/               # Custom pages
│   └── theme/               # Docusaurus theme overrides
├── static/
│   ├── wasm/                # Luat WASM module
│   └── img/                 # Images and assets
└── docusaurus.config.js     # Site configuration
```

## License

- **Documentation content** (blog posts, docs, guides): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- **Code** (components, themes, configuration): [MIT](https://opensource.org/licenses/MIT) OR [Apache-2.0](https://opensource.org/licenses/Apache-2.0)

See [LICENSE](LICENSE) for details. Copyright Maravilla Labs.

## Contributing

Contributions are welcome! Feel free to:

- Fix typos or improve documentation
- Report issues or suggest improvements
- Submit pull requests

## Related

- [Luat](https://github.com/maravilla-labs/luat) - The main Luat templating engine repository
- [Docusaurus](https://docusaurus.io/) - Documentation framework
