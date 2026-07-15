# AfriDATAi Brand Implementation Guide

## Brand Guidelines Compliance

This implementation follows the AfriDATAi Brand Guidelines with exact color and typography specifications.

## Colors

### Primary Brand Colors
- **AfriDATAi Red**: `#C1272D` (RGB: 193, 39, 45)
- **AfriDATAi Black**: `#1A1A1A` (RGB: 26, 26, 26)
- **AfriDATAi White**: `#FFFFFF` (RGB: 255, 255, 255)

### Usage
- Primary Red: Used for CTAs, highlights, branding elements
- Black: Used for main text, dark backgrounds
- White: Used for light backgrounds, contrast text

## Typography

### Font Hierarchy
1. **Montserrat** (Primary Font)
   - Used for: Headings, titles, CTAs, navigation, branding
   - Weights: 300-900
   
2. **Raleway** (Secondary Font)
   - Used for: Body text, paragraphs, descriptions, captions
   - Weights: 300-900

### Implementation
- CSS variables: `--font-primary` (Montserrat), `--font-secondary` (Raleway)
- Automatic font assignment via CSS classes
- Full weight range imported for design flexibility

## Dark Mode Support

### Theme System
- **Light Mode**: Default, brand compliant
- **Dark Mode**: Uses AfriDATAi Black with strategic red accents
- **Auto Mode**: Follows system preference

### Implementation
- CSS custom properties for theme switching
- Accessible color contrast ratios
- Smooth transitions between themes
- Eye strain reduction for extended use

## Components

### Theme Toggle
- Location: `src/components/ThemeToggle.jsx`
- Cycles through: Light → Dark → Auto
- Persists preference in localStorage
- Respects system preference when set to Auto

### Usage Example
```jsx
import ThemeToggle from './components/ThemeToggle';

function Header() {
  return (
    <header>
      {/* Other header content */}
      <ThemeToggle />
    </header>
  );
}
```

## File Structure

```
src/
├── styles/
│   ├── tokens.css         # Brand design tokens
│   ├── index.css          # Global styles & typography
│   └── homepage.css       # Homepage-specific styles
├── components/
│   └── ThemeToggle.jsx    # Theme switching component
└── ...
```

## Brand Compliance Checklist

- [x] AfriDATAi Red (#C1272D) implemented
- [x] AfriDATAi Black (#1A1A1A) implemented  
- [x] Montserrat for headings and CTAs
- [x] Raleway for body text
- [x] Dark mode with brand colors
- [x] Theme switching functionality
- [x] Accessible color contrast
- [x] Consistent typography hierarchy

## Next Steps

1. Test theme switching across all pages
2. Verify accessibility compliance (WCAG)
3. Add theme toggle to main navigation
4. Test with different logo variations
5. Implement responsive typography scaling