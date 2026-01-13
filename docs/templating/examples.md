# Examples

Explore real-world examples of LUAT templates demonstrating various components, patterns, and best practices.

## Gallery

### Basic Card Component

See how to create a simple, reusable card component.

```html
<!-- Card.luat -->
<script>
    local title = props.title
    local subtitle = props.subtitle
</script>

<div class="card">
    <h2>{title}</h2>
    <p>{subtitle}</p>
</div>
```

### Use of a Parent Page

Render a component inside a parent page with dynamic data.

```html
<!-- HomePage.luat -->
<script>
    local Card = require("components/Card")
    local title = "Welcome to LUAT"
    local subtitle = "Build dynamic web applications"
</script>

<div class="homepage">
    <Card title={title} subtitle={subtitle} />
</div>
```

## Advanced Use

### Nested Components

Learn to use nested components within each other.

```html
<!-- ProfileCard.luat -->
<script>
    local Avatar = require("components/Avatar")
    local user = props.user
</script>

<div class="profile-card">
    <Avatar src={user.avatar} />
    <div class="details">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
    </div>
</div>
```

### Dynamic Imports

Dynamically import components based on conditions.

```html
<!-- DynamicImportExample.luat -->
<script>
    local Component
    if props.type == "gallery" then
        Component = require("components/Gallery")
    else
        Component = require("components/List")
    end
</script>

<Component />
```

### Handling Events

Capture and handle events in LUAT components.

```html
<!-- Button.luat -->
<script>
    local onClick = function()
        props.onClick()
    end
</script>

<button onClick={onClick}>
    {props.label}
</button>
```

## Templates with Context

### Using Context

Access shared context within a component for dynamic content.

```html
<!-- Header.luat -->
<script>
    local pageContext = getContext("pageContext")
    local title = pageContext.title or "Default"
</script>

<header>
    <h1>{title}</h1>
</header>
```

### Full Page Example

Put it all together in a complete page example.

```html
<!-- CompletePage.luat -->
<script>
    local Navbar = require("components/Navbar")
    local Footer = require("components/Footer")
    local pageContext = getContext("pageContext")
    local currentNode = getContext("currentNode")
</script>

<html>
<head>
    <title>{currentNode.title}</title>
</head>
<body>
    <Navbar />
    <main>
        <h1>Welcome to {pageContext.siteName}</h1>
        <p>{currentNode.content}</p>
    </main>
    <Footer />
</body>
</html>
```
