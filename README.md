# SAATHI frontend

React 19 case-coordination client connected to the peer Django REST Framework
backend. The current implementation uses Vite and React Router; it is not a
Next.js application. A Next.js/BFF migration is a pending architecture decision,
primarily because production authentication should move refresh credentials to
HttpOnly cookies.

> Safety status: this is a controlled prototype. It does not confirm police,
> ambulance, counsellor, court, payment, or external-department delivery unless
> a backend provider acknowledgement explicitly says so.

## Run against the backend

Prerequisites: Node.js 20.19 or newer and the backend running on port 8000.

```sh
npm ci
npm run dev
```

The default browser API prefix is the same-origin `/api/v1`. During local
development Vite proxies `/api` to `VITE_API_PROXY_TARGET`. Keep the production
API same-origin; the client rejects absolute external API URLs.

Configuration lives in `.env.example`:

- Keep `VITE_DEMO_MODE=false` and `VITE_USE_MOCK_API=false` for the connected app.
- Set both flags to `true` only for an isolated, synthetic local demonstration.
- The two flags intentionally cannot be enabled independently.

Authorized district officers, state administrators, and national administrators
can open `/cases/new` from the case register. In connected mode the form posts
to `POST /api/v1/cases/`; in isolated demo mode it creates an in-memory synthetic
record only.

## Verification

```sh
npm run typecheck
npm run build
npm ls --depth=0
npm audit --omit=dev
```

There is not yet an ESLint rule set or frontend behavioral test suite. Auth
refresh races, role routing, pagination, SOS retry behavior, and workflow
commands require automated tests before production release.

## Known release gates

- Access and refresh JWTs currently live in `sessionStorage`; move production
  authentication to a same-origin BFF/HttpOnly-cookie design with CSRF controls.
- Collection screens currently present a loaded API page plus server totals;
  server-driven pagination/search/filter controls are still required.
- General case editing, bulk operations, and full audit review still need
  first-class UI workflows and behavioral coverage. Case creation is connected,
  but automated frontend test coverage remains a release gate.
- Live check-in, reporting, model analytics, and external integrations remain
  disabled until their backend contracts and assurance evidence exist.
