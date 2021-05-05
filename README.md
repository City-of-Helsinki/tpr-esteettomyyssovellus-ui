# tpr-esteettomyyssovellus-ui
TPR Esteettömyyssovellus UI

## About

**WIP**

## Getting started

    npm install

## Development

    npm run dev

## Test/Production

    npm run build
    npm run start

## Project structure

- .<foldername> automatically generated | should be gitignored
- components: React components and modular components .scss 
- locales: all translated text as JSON
- pages: pages for nextjs router
- public: general assets | nextjs needs this folder
- state: handling state | should have: reducers (slices, reducers etc), store | using redux-toolkit
- styles: general styles and mixins
- types: files for TS types and enum constrants/default values
- utils: helper functions

* node -v: 14.0.0 | using nvm-sh/nvm for node version management