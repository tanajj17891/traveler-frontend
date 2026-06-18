# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
### Frontend Deployment
- S3 bucket littletraveler.net has static website hosting enabled
- CloudFront distribution sits in front of S3 and handles HTTPS
- TLS certificate created via ACM covers littletraveler.net and *.littletraveler.net
- Route 53 A and AAAA records point littletraveler.net to the CloudFront distribution
- CloudFront default root object is set to index.html
- npm run build , Re-upload the contents of the dist folder to the littletraveler.net S3 bucket

### REDPLOYING frontend
- npm run build
- Go to AWS S3 → littletraveler.net bucket
- Select all existing files and folders → click Delete
- Click Upload → drag in all contents of the dist folder (files + assets folder)
- Click Upload
- Go to CloudFront → littletraveler distribution
- Click Invalidations tab → Create invalidation
- Enter /* as the path → click Create invalidation

### How are we fixing the email?
- we save ID token that contains email
- pre propulate the form
- read only 
### What is Rem?
- 1rem stands for "root em" and equals the font-size of the root element (the <html> tag).
- If you explicitly change the font-size of your <html> element in your CSS stylesheet, 1rem

### What is content, padding, brorder and margin?
- Content: The text, images, or child items.
- Padding: The internal breathing room surrounding the content.
- Border: The line wrapping around the padding and content.
- Margin: The empty space outside the border used to separate the element from other elements.
