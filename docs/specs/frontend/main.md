# SPEC: `frontend/src/main.tsx`

## Purpose

The frontend's entrypoint — mounts the React tree onto `#root` and wraps it in the app's
router and strict-mode.

## Exports / Props

None — this module has no exports; it's the Vite entry script referenced by `index.html`.

## Behavior

- Uses `ReactDOM.createRoot(document.getElementById('root')!)` — the non-null assertion assumes
  `index.html` always has a `#root` element (it does, and this isn't user-configurable).
- Wraps `<App />` in `React.StrictMode` and `BrowserRouter` — every route in `App.tsx` depends
  on `BrowserRouter` being present here.
- Imports `./index.css` for global styles — there's no CSS framework or CSS-in-JS, just this
  one global stylesheet plus inline `style={{...}}` props scattered through components/pages.

## Dependencies

- Imports `App` from `App.tsx` and `./index.css`.
- Imports `BrowserRouter` from `react-router-dom`.
- Not imported by anything else — it's the Vite/HTML entrypoint.
