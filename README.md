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

## Example GET-request

http://localhost:3000/ServicePoint/?systemId=e186251e-1fb6-4f21-901c-cb6820aee164&servicePointId=3266&user=uusiesteettomyys%40hel.fi&validUntil=2021-07-08T11%3a34%3a16&name=Kallion+kirjasto&streetAddress=Viides+linja+11&postOffice=Helsinki&northing=6673631&easting=386500&checksum=90CE983598EB80B3A7332B700C0CA5E8C4FF3E6689CA4FB5C2000BCB578843C6

## dev notes:

remove code/components if not used:

- pages/servicepoint & styles
- common/ModalConfirmation & styles
- common/Notife & styles
- common/ToastNorification
- common/Hero
- components/SearchBox*.* (all files starting with)
- ~checkUser codeblocks in multiple SSR's
- all obsolete / commented / console.logs etc.
