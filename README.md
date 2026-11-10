# Trashify

Trashify coordinates waste pickups and sanitation follow-up in Abuja. Residents book by building postcode, collectors confirm collection, and estate or municipal teams monitor service reliability and address resident reports.

## Local setup

Use Node.js 22.13 or newer and pnpm.

```sh
pnpm install
pnpm dev
```

Open [Trashify locally](http://localhost:3000). Set the following in a local `.env.local` or the server's environment.

| Variable | Purpose |
| --- | --- |
| `TRASHIFY_ORIGIN` | Exact external origin, such as `https://your-trashify-domain`, with no trailing slash. Set this behind a proxy. |
| `TRASHIFY_DB_PATH` | Absolute path on a persistent local disk, writable only by the application operator. Defaults to `.data/trashify.sqlite`. Use one app instance per file. |
| `RESOLVEGRID_API_URL` | Full ResolveGrid resolver endpoint, ending in `/v1/resolve` or `/api/v1/resolve`. |
| `RESOLVEGRID_SERVICE_TOKEN` | Private token shared with the ResolveGrid API for verified pickup locations. |
| `RESOLVEGRID_NIPOST_API_KEY` | Optional server-side override. Prefer setting the NIPOST credential directly on ResolveGrid. |
| `TRASHIFY_ALLOW_SAMPLE_ADDRESSES` | Set to `1` for a separate fake-data demo. Leave unset for field use. |
| `TRASHIFY_CLIENT_IP_HEADER` | Optional client IP header inserted by a trusted proxy that strips any client-provided value. Without this setting, a shared request limit applies. |

The database stores accounts, hashed sessions and invitations, pickups, and sanitation reports. Back it up using a SQLite-aware backup and test restoration before enrolling households. A server with a persistent volume is required. Static hosting or an ephemeral serverless filesystem cannot persist this database.

## Reviewer demo

Share the deployed `/demo` link with reviewers. It opens the resident, collector, estate and municipal workspaces without registration. Visitors can switch roles and keep their sample bookings and reports within the same two-hour session. The demo uses isolated records, a sample postcode and simulated collector location. It works without a ResolveGrid connection or live account. Expired demo data is removed when a new demo starts.

## Access and onboarding

- Residents create their own accounts. An estate invitation connects a new resident to that estate's workspace.
- Collectors register and wait for approval. The operator checks their licence, vehicle, allowed waste streams and postal zones, then grants access. The collector chooses when to go available.
- Estate and municipal users register with one-time invitations issued for their email and workspace. Municipal invitations are scoped to explicit digital postcode districts. Estate accounts and enrolled residents share the same estate slug.
- The operator can issue a one-time password reset after verifying account ownership. The user enters the code on `/reset`. Trashify invalidates existing sessions when a password changes.

Run these commands against the same database as the app. Values below are examples.

```sh
pnpm access invite estate manager@example.test sunrise-estate
pnpm access invite resident resident@example.test sunrise-estate
pnpm access invite municipal officer@example.test FC-02-A09,FC-02-A07
pnpm access approve collector@example.test FC-02-A09 VERIFIED-LICENCE "Mini truck" mixed,plastics
pnpm access reset resident@example.test
pnpm access revoke collector@example.test
```

Give invitations and reset codes privately to the intended recipients. Revoking a collector returns their unfinished assignments to the queue. A suitable collector can pick them up when they go available. Codes expire automatically. This pilot uses operator-issued codes and has no automated email delivery or verification for self-service resident accounts.

## Connect and deploy ResolveGrid

Deploy the ResolveGrid API version that supports strict postcode lookup first. Set its `NIPOST_API_KEY` and a random `RESOLVEGRID_SERVICE_TOKEN`, then set the same service token in Trashify. Use a staging key and approved test buildings for the pitch. Switch to an approved live key and test its supported lookup or reverse lookup path before dispatching real pickups.

Exact digital postcodes go straight to lookup. Landmark queries use ResolveGrid to suggest a building. A pickup needs official building coordinates or an official reverse match. If NIPOST does not return building coordinates, the resident enters the exact postcode and chooses **Verify postcode at my location** while at the pickup. ResolveGrid compares the device point to the nearest official building and checks it matches the entered postcode within 50 metres. Trashify uses the digital postcode district (for example, `FC-02-A09`) for dispatch and workspace scopes.

## Test before release

```sh
pnpm lint
pnpm build
pnpm test:pilot
```

The test suite uses an isolated database and a stub resolver. For staging, exercise the full flow with ResolveGrid, a real approved test postcode, separate accounts and the PWA over HTTPS. See the [mobile release checklist](MOBILE_APP_GUIDE.md) and the [public-health pilot methods](PUBLIC_HEALTH.md).

## Deploy with Docker

The image runs one Trashify server and keeps the database on a volume mounted at `/data`. Create a `.env` file next to `compose.yaml` with `TRASHIFY_ORIGIN` and the ResolveGrid settings from the table above, then build and start it.

```sh
docker compose up -d --build
```

The app listens on `127.0.0.1:3000` (set `TRASHIFY_PORT` to change it). Put an HTTPS reverse proxy in front of it and set `TRASHIFY_ORIGIN` to the public `https://` origin. Sign-in cookies are sent over HTTPS only. Run one container per database.

Run operator commands inside the container so they use the same database.

```sh
docker compose exec trashify node scripts/access.mjs invite municipal officer@example.test FC-02-A09
```

On a platform that builds the `Dockerfile` directly, attach a persistent volume at `/data` and make it writable by uid 1000. `docker compose down -v` deletes the volume and all pilot data.

Serve the production build over HTTPS and keep secrets out of client settings. This release uses one persistent Node server. Keep a private staging deployment for rehearsals and use test data when demonstrating the app.
