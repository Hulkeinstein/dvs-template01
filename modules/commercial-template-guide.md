# HiStudy Commercial Educational Platform Template Development Guide

## Development Philosophy & Core Principles

- **Template Consistency**: Strictly adhere to existing commercial template design system and structure
- **Multi-Demo Support**: Flexible development considering 26 educational institution variations (universities, language schools, coaching centers, etc.)
- **Complete Theme System**: Apply Dark/Light Mode + RTL support to all components
- **Commercial Quality**: Maintain high-quality code and documentation meeting ThemeForest standards

## Global Coding Standards

### JavaScript/React
- Use ES6+ syntax while considering **IE11 compatibility** (apply polyfills when needed)
- Prioritize functional components and hooks
- Commercial template-level documentation with JSDoc comments
- Props validation with PropTypes (stability for template buyers)
- Maintain existing component naming conventions from template

### CSS/SCSS Template Standards
- Maintain **Bootstrap 5.x** foundation (template compatibility)
- Utilize existing template SCSS variable system
- Support **responsive design** with 4+ column layouts
- Comply with **Dark/Light mode** template structure
- Write **RTL support** CSS (Arabic, Hebrew, etc.)

### Browser Compatibility
- Support **IE11, Firefox, Safari, Opera, Chrome, Edge** - all browsers
- Cross-browser testing mandatory
- Proper use of polyfills and vendor prefixes

## Template-Specific Architecture Guidelines

### Multi-Demo System
- Support various educational institution layouts (universities, online schools, language centers, etc.)
- Control demo-specific component variations through props
- Design for easy customization by template buyers

### Advanced User Dashboards
- **Instructor Dashboard**: Course management, student analytics, revenue tracking
- **Student Dashboard**: Learning progress, achievements, certificate management
- **Admin Panel**: Complete system management and reporting
- Provide role-specific customized UI/UX

### Diverse Quiz Interfaces
- **8 Question Types**: Multiple choice, essay, drag-and-drop, matching, etc.
- **Timer Functionality**: Visual countdown and auto-submission
- **Real-time Feedback**: Immediate correct/incorrect indicators
- **Progress Tracking**: Detailed learning analytics data

### Theme & Internationalization System
- **Dark/Light Mode**: Cookie-based theme persistence
- **RTL Support**: Right-to-left languages like Arabic, Hebrew
- **Multi-language Support**: i18n system integration ready
- **Branding Customization**: Color, font, logo modification system

## Preferred Libraries (Template Based)

### UI Components
- **Bootstrap 5.x** - Template core framework
- **Font Awesome or Feather Icons** - Template icon system
- **AOS (Animate On Scroll)** - Scroll animations
- **Swiper.js** - Carousels and sliders

### Education-Specific Libraries
- **Jodit React** - Rich text editor
- **@dnd-kit** - Drag-and-drop quizzes
- **Chart.js or ApexCharts** - Learning analytics charts
- **React Player** - Video lecture player

### State Management (Maintain Template Structure)
- **Redux Toolkit** - Cart and global state
- **React Context** - Theme, language, layout settings
- **NextAuth.js** - Authentication system

## Template-Compliant Coding Patterns

### Component Documentation (Commercial Standard)
```javascript
/**
 * Course Card Component - Used across various educational institution demos
 * @param {Object} props - Component props
 * @param {Object} props.course - Course information object
 * @param {string} props.course.title - Course title
 * @param {string} props.course.instructor - Instructor name
 * @param {number} props.course.price - Course price
 * @param {string} props.variant - Demo type ('university'|'online-school'|'language-center')
 * @param {boolean} props.darkMode - Dark mode flag
 * @returns {JSX.Element} Course card component
 */
function CourseCard({ course, variant = 'university', darkMode = false }) {
  // Implementation following template structure
}
```

### Theme-Supporting CSS Patterns
```scss
// Utilize template's theme system
.course-card {
  background: var(--bs-body-bg);
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color);
  
  // Dark mode support
  [data-theme="dark"] & {
    background: var(--dark-bg-secondary);
    border-color: var(--dark-border-color);
  }
  
  // RTL support
  [dir="rtl"] & {
    text-align: right;
    .course-card__price {
      left: auto;
      right: 1rem;
    }
  }
}
```

### Multi-Demo Support Pattern
```javascript
// Handle demo-specific style variations
const getDemoStyles = (variant) => {
  const styles = {
    university: 'course-card--academic',
    'online-school': 'course-card--modern',
    'language-center': 'course-card--minimal',
    'coaching-center': 'course-card--professional'
  };
  return styles[variant] || styles.university;
};
```

## Template Quality Standards

### Code Quality (ThemeForest Standards)
- **Well Documented**: Detailed comments for all functions and components
- **Cross-browser Testing**: Thorough testing on supported browsers
- **Performance Optimization**: Image optimization, code splitting
- **Accessibility**: WCAG 2.1 guidelines compliance

### File Structure (Template Standards)
- **HTML Files**: Static preview HTML files
- **CSS/SCSS Files**: Structured stylesheets
- **JS Files**: Modularized JavaScript files
- **Documentation**: Detailed buyer documentation

## Development Workflow (Commercial Template Standards)

### When Developing New Features
1. **Template Consistency Check**: Harmony with existing design system
2. **Multi-Demo Consideration**: Functionality across all educational variations
3. **Theme Support**: Test both dark/light modes
4. **RTL Support**: Layout verification for right-to-left languages
5. **Browser Compatibility**: Test on supported browsers
6. **Documentation**: Usage documentation for buyers

### Performance Optimization (Template Standards)
- **Image Optimization**: WebP format support, lazy loading
- **Code Splitting**: Page-specific bundle separation
- **CSS Optimization**: Remove unused styles
- **JavaScript Optimization**: Tree shaking, compression

## Template Buyer Considerations

### Customization Ease
- **SCSS Variables**: Easy color, font, spacing changes
- **Component Props**: Simple configuration for appearance changes
- **Modular Structure**: Use only needed components
- **Clear Documentation**: Guides understandable by non-developers

### Extensibility
- **Plugin System**: Easy addition of new features
- **API Integration**: Connection with various backend systems
- **Multi-language Support**: Easy integration of additional languages
- **Payment Systems**: Support for various payment gateways

Following these guidelines will help develop the HiStudy project while maintaining commercial template quality and consistency.