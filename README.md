# VyntaJobs

This repository lives in the `Orbit` workspace, but the actual app/product name is VyntaJobs. It is a React + Vite application for the VyntaJobs marketplace experience, with Firebase authentication, Firestore integration, and an i18next translation system organized in isolated per-language files.

## Stack

- React 19
- Vite 6
- TypeScript
- Firebase Auth + Firestore
- i18next + react-i18next
- Tailwind CSS 4

## Local Setup

Prerequisites:

- Node.js 20+
- npm

Install dependencies:

```bash
npm install
```

Create your local environment from [.env.example](C:/Users/DELL/Documents/GitHub/Orbit/.env.example) and provide the values you need for local development.

Run the app:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Translations

Languages are stored in [src/languages](C:/Users/DELL/Documents/GitHub/Orbit/src/languages), one file per locale. The shared registry in [src/languages/index.ts](C:/Users/DELL/Documents/GitHub/Orbit/src/languages/index.ts) controls which languages are available in the UI.

Currently registered languages:

- `en` English
- `es` Spanish
- `fr` French
- `de` German
- `it` Italian
- `pt` Portuguese
- `ar` Arabic
- `ja` Japanese
- `zh` Chinese
- `hi` Hindi
- `ru` Russian

Useful translation commands:

```bash
npm run i18n:check
npm run i18n:translate
```

- `npm run i18n:check` reports missing keys against English.
- `npm run i18n:translate` fills missing keys and can generate registered locale files from the English source.

To add a new language:

1. Copy [src/languages/_template.ts](C:/Users/DELL/Documents/GitHub/Orbit/src/languages/_template.ts) to a new locale file.
2. Register the file in [src/languages/index.ts](C:/Users/DELL/Documents/GitHub/Orbit/src/languages/index.ts).
3. Run `npm run i18n:check`.
4. Review or refine the generated copy before shipping.

## Notes

- The app uses runtime fallback to English for any untranslated keys.
- Translation coverage should still be reviewed by a human before release, especially for newly generated locales.
