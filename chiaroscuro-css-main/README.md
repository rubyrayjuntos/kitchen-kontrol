# 🌒 ChiaroscuroCSS v2.0

> **Light, shadow, and balance, redefined for the web.**  
> A comprehensive neumorphic design system with accessibility-first approach, responsive design, personality-driven theming, and extensive component library.

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WCAG AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-brightgreen)](https://www.w3.org/WAI/WCAG21/quickref/)
[![npm](https://img.shields.io/npm/v/chiaroscuro-css.svg)](https://www.npmjs.com/package/chiaroscuro-css)
[![Demo](https://img.shields.io/badge/demo-online-green)](docs/showcase.html)

---

## 🎉 What's New in v2.0

ChiaroscuroCSS v2.0 represents a **complete redesign** and expansion from a simple neumorphic micro-library to a **comprehensive design system**:

- 🏗️ **Modular Architecture** - Organized, maintainable CSS structure
- 🧩 **100+ Components** - Complete UI component library
- 🛠️ **500+ Utility Classes** - Utility-first CSS framework
- 🎨 **Enhanced Theming** - Four personality-driven themes with advanced effects
- ♿ **Accessibility First** - WCAG 2.1 AA compliant with comprehensive keyboard/screen reader support
- 📱 **Mobile First** - Responsive design with touch-friendly interactions
- ⚡ **Production Ready** - Optimized for performance and scalability

---

## ✨ Features

### 🎨 **Design System**
✅ **Neumorphic Components** - Raised, inset, beveled, flat, and glow effects  
✅ **Personality Themes** - Serene, Playful, Mystical, Professional  
✅ **Comprehensive Color System** - Semantic color tokens and theme variables  
✅ **Typography Scale** - Complete font size, weight, and spacing system  

### 🧩 **Component Library**
✅ **Buttons** - Multiple variants, sizes, shapes, and states  
✅ **Forms** - Inputs, selects, checkboxes, radios, switches, file uploads  
✅ **Cards** - Profile, stats, feature, image, and floating cards  
✅ **Navigation** - Navbar, tabs, breadcrumbs, pagination, stepper, sidebar  

### 🛠️ **Utility Framework**
✅ **Layout** - Flexbox, CSS Grid, positioning, containers  
✅ **Spacing** - Margin, padding, gap utilities  
✅ **Typography** - Text sizes, weights, colors, effects  
✅ **Visual** - Borders, shadows, opacity, transforms  

### ♿ **Accessibility & Performance**
✅ **WCAG 2.1 AA Compliance** - Tested color contrast and focus management  
✅ **Reduced Motion Support** - Respects user preferences  
✅ **Keyboard Navigation** - Full keyboard accessibility  
✅ **Screen Reader Support** - Semantic markup and ARIA labels  
✅ **Performance Optimized** - Minimal CSS footprint  

---

## 🚀 Quick Start

### Install via npm
```bash
npm install chiaroscuro-css
```

### Or use via CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/chiaroscuro-css@latest/src/chiaroscuro.css">
```

### Basic Usage
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="path/to/chiaroscuro.css">
</head>
<body data-theme="mystical">
  <div class="container">
    <div class="card">
      <h1 class="text-3xl font-bold text-accent mb-4">Welcome!</h1>
      <p class="text-secondary mb-6">Experience beautiful neumorphic design.</p>
      <button class="btn btn-primary btn-lg">Get Started</button>
    </div>
  </div>
</body>
</html>
```

---

## 🌈 Themes

ChiaroscuroCSS ships with four carefully crafted personality-driven themes:

### 🌿 **Serene** - Calming Greens
Perfect for wellness, nature, and calming applications.
```html
<body data-theme="serene">
```

### ☀️ **Playful** - Warm Yellows & Oranges  
Ideal for creative, fun, and energetic applications.
```html
<body data-theme="playful">
```

### 🔮 **Mystical** - Deep Purples
Great for creative, magical, and premium applications.
```html
<body data-theme="mystical">
```

### 💼 **Professional** - Cool Greys
Perfect for business, corporate, and professional applications.
```html
<body data-theme="professional">
```

### Dynamic Theme Switching
```javascript
function switchTheme(theme) {
  document.body.setAttribute('data-theme', theme);
}
```

---

## 🧩 Components

### Buttons
```html
<!-- Basic Buttons -->
<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-success">Success</button>

<!-- Button Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>

<!-- Button Shapes -->
<button class="btn btn-pill">Pill Button</button>
<button class="btn btn-circular">+</button>
<button class="btn btn-square">□</button>

<!-- Button States -->
<button class="btn btn-loading">Loading...</button>
<button class="btn" disabled>Disabled</button>
```

### Forms
```html
<!-- Text Input -->
<div class="form-field">
  <label class="form-label">Email</label>
  <input type="email" class="neumorphic-input" placeholder="Enter email">
</div>

<!-- Select Dropdown -->
<div class="neumorphic-select">
  <select>
    <option>Choose option...</option>
    <option>Option 1</option>
  </select>
</div>

<!-- Checkbox -->
<label class="neumorphic-checkbox">
  <input type="checkbox">
  <span class="checkbox-box"></span>
  <span class="checkbox-label">I agree</span>
</label>

<!-- Switch -->
<label class="neumorphic-switch">
  <input type="checkbox">
  <span class="switch-track">
    <span class="switch-thumb"></span>
  </span>
  <span class="switch-label">Enable notifications</span>
</label>
```

### Cards
```html
<!-- Basic Card -->
<div class="card">
  <div class="card-header">
    <h3 class="card-header-title">Card Title</h3>
  </div>
  <div class="card-body">
    <p class="card-text">Card content goes here.</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Action</button>
  </div>
</div>

<!-- Profile Card -->
<div class="card card-profile">
  <img src="avatar.jpg" alt="Avatar" class="card-avatar">
  <h3 class="card-title">John Doe</h3>
  <p class="card-subtitle">Developer</p>
</div>
```

### Navigation
```html
<!-- Navbar -->
<nav class="navbar">
  <div class="navbar-brand">Brand</div>
  <div class="navbar-nav">
    <a href="#" class="nav-link active">Home</a>
    <a href="#" class="nav-link">About</a>
  </div>
</nav>

<!-- Tabs -->
<div class="tabs">
  <button class="tab active">Tab 1</button>
  <button class="tab">Tab 2</button>
</div>

<!-- Breadcrumbs -->
<nav class="breadcrumb">
  <span class="breadcrumb-item"><a href="#">Home</a></span>
  <span class="breadcrumb-item active">Current</span>
</nav>
```

---

## 🛠️ Utility Classes

### Layout
```html
<!-- Flexbox -->
<div class="d-flex justify-center items-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="d-grid grid-cols-3 gap-4">
  <div>Grid Item</div>
  <div>Grid Item</div>
  <div>Grid Item</div>
</div>
```

### Spacing
```html
<!-- Margin & Padding -->
<div class="m-4 p-6">Spaced content</div>
<div class="mx-auto">Centered horizontally</div>
<div class="space-y-4">Vertical spacing between children</div>
```

### Typography
```html
<!-- Text Sizes -->
<h1 class="text-4xl font-bold">Large Heading</h1>
<p class="text-lg text-secondary">Body text</p>

<!-- Text Effects -->
<p class="text-neumorphic-embossed">Embossed text</p>
<p class="text-neumorphic-glow">Glowing text</p>
```

### Neumorphic Effects
```html
<!-- Basic Effects -->
<div class="neumorphic-raised">Raised surface</div>
<div class="neumorphic-inset">Inset surface</div>
<div class="neumorphic-beveled">Beveled surface</div>
<div class="neumorphic-glow">Glowing surface</div>

<!-- Size Variants -->
<div class="neumorphic-raised neumorphic-sm">Small</div>
<div class="neumorphic-raised neumorphic-lg">Large</div>
```

---

## 🎨 Customization

### CSS Custom Properties
ChiaroscuroCSS is built on 100+ CSS custom properties for complete customization:

```css
:root {
  /* Colors */
  --accent-primary: #9c84c4;
  --bg-primary: #444254;
  --text-primary: #dcd9ea;
  
  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  
  /* Typography */
  --font-size-lg: 1.125rem;
  --font-weight-bold: 700;
  
  /* Shadows */
  --shadow-light: rgba(79, 76, 94, 0.7);
  --shadow-dark: rgba(26, 25, 33, 0.8);
}
```

### Creating Custom Themes
```css
[data-theme="custom"] {
  --bg-primary: #your-color;
  --bg-secondary: #your-color;
  --text-primary: #your-color;
  --accent-primary: #your-color;
  /* ... more variables */
}
```

### Modular Imports
```css
/* Import only what you need */
@import 'chiaroscuro-css/src/core/variables.css';
@import 'chiaroscuro-css/src/components/buttons.css';
@import 'chiaroscuro-css/src/utilities/layout.css';
```

---

## 📱 Responsive Design

All components and utilities include responsive variants:

```html
<!-- Responsive Grid -->
<div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <div>Item</div>
  <div>Item</div>
  <div>Item</div>
</div>

<!-- Responsive Typography -->
<h1 class="text-2xl md:text-4xl lg:text-6xl">Responsive Heading</h1>

<!-- Responsive Spacing -->
<div class="p-4 md:p-6 lg:p-8">Responsive padding</div>
```

---

## ♿ Accessibility

### WCAG 2.1 AA Compliance
- ✅ Color contrast ratios meet or exceed 4.5:1
- ✅ Focus indicators are clearly visible
- ✅ All interactive elements are keyboard accessible

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are automatically disabled */
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  /* Enhanced contrast automatically applied */
}
```

### Screen Reader Support
```html
<!-- Built-in accessibility features -->
<button class="btn" aria-label="Close dialog">×</button>
<div class="sr-only">Screen reader only content</div>
```

---

## 📦 Project Structure

```
chiaroscuro-css/
├── src/
│   ├── chiaroscuro.css          # Main entry point
│   ├── core/
│   │   ├── variables.css        # CSS custom properties
│   │   └── base.css             # Base styles & reset
│   ├── themes/
│   │   ├── serene.css           # Serene theme
│   │   ├── playful.css          # Playful theme
│   │   ├── mystical.css         # Mystical theme
│   │   └── professional.css     # Professional theme
│   ├── components/
│   │   ├── neumorphic.css       # Neumorphic effects
│   │   ├── buttons.css          # Button components
│   │   ├── forms.css            # Form components
│   │   ├── cards.css            # Card components
│   │   └── navigation.css       # Navigation components
│   └── utilities/
│       ├── layout.css           # Layout utilities
│       ├── spacing.css          # Spacing utilities
│       └── typography.css       # Typography utilities
├── docs/
│   ├── index.html               # Basic demo
│   └── showcase.html            # Comprehensive showcase
└── README.md
```

---

## 🎮 Live Demo

Experience ChiaroscuroCSS v2.0 in action:
- **[Basic Demo](docs/index.html)** - Simple component showcase
- **[Comprehensive Showcase](docs/showcase.html)** - Full feature demonstration

---

## 📈 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ Internet Explorer (not supported)

---

## 🤝 Contributing

ChiaroscuroCSS is open source and welcomes contributions! Here's how to get involved:

### Development Setup
```bash
git clone https://github.com/rubyrayjuntos/chiaroscuro-css.git
cd chiaroscuro-css
# No build step required - pure CSS!
```

### Contributing Guidelines
1. 🍴 Fork the repository
2. 🌿 Create a feature branch (`git checkout -b feature/amazing-feature`)
3. 🧪 Test your changes thoroughly
4. 💾 Commit your changes (`git commit -m 'Add amazing feature'`)
5. 📤 Push to the branch (`git push origin feature/amazing-feature`)
6. 🔀 Open a Pull Request

### What We're Looking For
- 🐛 Bug fixes and improvements
- 🧩 New components and utilities
- 🎨 Additional themes
- 📚 Documentation improvements
- ♿ Accessibility enhancements

---

## 🗺️ Roadmap

### Coming Soon
- 🔧 **React/Vue Components** - Framework-specific wrappers
- 🎨 **Additional Themes** - More personality-driven options
- 📦 **Sass/SCSS Version** - For teams using preprocessors
- 🎬 **Enhanced Animations** - More sophisticated motion design
- 🛠️ **Build Tools** - Optional build pipeline for optimization

### Future Considerations
- 🌐 **RTL Support** - Right-to-left language support
- 🎯 **Framework Integrations** - Angular, Svelte, and others
- 📱 **Mobile Components** - Touch-specific components
- 🎮 **Interactive Showcase** - Live code playground

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🌟 Credits

Created with ❤️ by [Ray Swan](https://ray.codes)

- 🔗 **Portfolio**: [ray.codes](https://ray.codes)
- 💼 **LinkedIn**: [linkedin.com/in/raycswan](https://linkedin.com/in/raycswan)
- 🐙 **GitHub**: [github.com/rubyrayjuntos](https://github.com/rubyrayjuntos)

---

## 💝 Support

If ChiaroscuroCSS has helped your project, consider:

- ⭐ **Star the repo** on GitHub
- 🐦 **Share it** on social media
- 💖 **Sponsor development** via GitHub Sponsors
- 🗣️ **Spread the word** in your community

---

<div align="center">

**🌒 ChiaroscuroCSS v2.0 - Light, shadow, and balance, redefined for the web.**

*Experience the art of neumorphic design with modern web standards.*

</div>
