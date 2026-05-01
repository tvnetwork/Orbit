## Adding a language

1. Copy [`_template.ts`](C:/Users/DELL/Documents/GitHub/Orbit/src/languages/_template.ts) to a new file such as `sw.ts`.
2. Fill the `translation` object with the locale's strings.
3. Import that file in [`index.ts`](C:/Users/DELL/Documents/GitHub/Orbit/src/languages/index.ts).
4. Add the locale to `baseResources`.
5. Add its metadata to `availableLanguages`.
6. Run `npm run i18n:check` to see any missing keys.

Only languages listed in `availableLanguages` appear in the UI.
