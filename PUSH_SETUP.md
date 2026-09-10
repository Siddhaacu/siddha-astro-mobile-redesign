# Siddha Astro Daily Panchangam Notifications

The web app uses standards-based Web Push. On iPhone/iPad, the site must be added to the Home Screen as a web app before push permission can be granted.

## Netlify environment variables

Set these in Netlify Site configuration → Environment variables:

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` — for example `mailto:admin@siddhaastro.in`

Generate one VAPID key pair and keep it permanently. Do not commit the private key to GitHub.

```bash
npx web-push generate-vapid-keys --json
```

Copy the returned `publicKey` to `VAPID_PUBLIC_KEY` and `privateKey` to `VAPID_PRIVATE_KEY`.

## Daily schedule

`panchang-notify` is scheduled for `30 1 * * *`, which is 07:00 Asia/Kolkata because Netlify scheduled functions use UTC.

## User setup

### Android

1. Open the Siddha Astro website.
2. Tap **Enable** under Daily Panchangam.
3. Allow notifications.
4. The user will receive the daily Panchangam notification at approximately 7:00 AM IST.

### iPhone / iPad

1. Open Siddha Astro in Safari.
2. Add it to the Home Screen and open it as a web app.
3. Open Siddha Astro from the Home Screen.
4. Tap **Enable** under Daily Panchangam.
5. Allow notifications.

Web Push for Home Screen web apps is supported on iOS/iPadOS 16.4 and later. The permission request is intentionally triggered by the user's tap on **Enable**.
