# Trashify mobile release

The installable web app uses the same server, account and data on desktop and mobile. Serve the production build over HTTPS.

- Android Chrome. Open Trashify and use the browser's install action or the install prompt.
- iPhone Safari. Open Trashify, tap Share, then Add to Home Screen.

Test on a physical phone for each platform. Install, launch from the home screen, register or sign in, book and track a pickup, then sign out. With a separate collector account, start an assigned pickup. Test location denied, a location outside the pickup area, and an approved test location. Switch the phone offline, check that the reconnect page appears and confirm that normal navigation and sign-in work again when connected.

Pickup actions require an active connection. The service worker caches the offline page. It does not cache account, booking or report responses.

The repository contains a Capacitor configuration and no native release projects. A future native release can call the same Trashify backend after adding native session handling, platform permissions, release signing and device tests. Keep ResolveGrid credentials on the server.
