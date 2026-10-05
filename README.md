<div align="center">
<h1>Stoat Self-Hosted &mdash; fork</h1>
Self-hosting Stoat using Docker
</div>
<br/>

> [!NOTE]
> This is a fork of
> [stoatchat/self-hosted](https://github.com/stoatchat/self-hosted)
> maintained at `https://git.entitybtw.ru/entitybtw/stoat-selfhosted`.
> Every application image referenced by `compose.yml` is published by this fork
> under [`entbtw/stoat`](https://hub.docker.com/r/entbtw/stoat) on Docker Hub
> instead of `ghcr.io/stoatchat/*`, so an instance keeps pulling images even if
> the upstream registry goes away.

## What this fork adds

**Voice & video**

- The voice connection recovers on its own: LiveKit node probing with a hard
  timeout, exponential-backoff rejoin with fresh tokens, and listeners for
  `reconnecting`/`reconnected` so the UI no longer sits on "Connecting…" forever.
- The inline call card reserves its own height in the chat column instead of
  being painted over the messages, and the navigation rail sizes itself to
  translated labels instead of clipping them.
- Video adapts to the link: `adaptiveStream` + `dynacast`, a three-rung simulcast
  ladder for every screen share quality, `contentHint: detail` for 720p/1080p
  sharing, and a camera capture sized from `limits().video_resolution` — which
  also stops the client publishing something `voice-ingress` kicks you for.
- A **Soundboard** in the call card, built like the emoji picker: a searchable
  grid of tiles with the sound's icon and name, a preview row that doubles as
  the toolbar (play, rename, picture, emoji, clear, remove) and a footer with
  the volume, the master mute and the add button. Every sound can be decorated
  with an uploaded picture, a unicode emoji or a server emoji, announced over
  LiveKit's data channel and played back by every participant locally, so
  deafen, per-user volume and the soundboard volume all apply per listener.
  Clips can be silenced for everybody, for one user, for one server, or for the
  whole server by its staff — and whoever starts a clip shows a badge with the
  icon while it plays. mp3, wav, ogg, opus, flac, m4a, aac, webm and aiff are
  all accepted (files are decoded once before upload so a broken format is
  rejected with a message rather than silently uploaded). The library lives in
  the synced settings store, so it follows your account between devices, and
  the picker is translated.
- A **shared server soundboard**: anybody with `ManageCustomisation` can publish
  a sound for everybody in the server's voice channels, and a moderator with
  `MuteMembers` can silence one member's soundboard for everybody on that
  server. Both are ordinary server fields, so they show up with the server and
  broadcast to everyone. The picker keeps your library and the server's in
  separate sections and shares a sound between them in one click.
- Soundboard volume and mutes apply **while the clip is playing**, not just to
  the next one: the playback pass re-runs whenever a clip starts, so the
  master volume, deafen and the per-user and per-server soundboard mutes land
  on the clip that is already running. A clip started under a mute stays
  paused - shown as paused in the picker - until the mute is lifted, the
  volume slider keeps the full 0-200% it displays, and a user volume set to
  0 stays silence instead of falling back to 100%.
- A scrub keeps the clip on its feet: the timeline remembers which sound it
  belongs to, so pausing, moving the playhead and pressing play resumes from
  the new spot instead of restarting from the beginning.

**Interface & localisation**

- Russian is complete: every message in the `ru` catalog is translated, and
  twenty-four labels that were still hardcoded English — the search
  placeholders, the friends-list section headings, dialog titles and their
  action buttons, sidebar tooltips and assorted aria-labels — are now in the
  catalogs like everything else. Three catalogs (`sq`, `sv`, `nb-NO`) carried
  plural syntax no compiler would accept, so those messages silently never
  compiled; they are fixed.
- The screenshare button reads its own state: it offers "share" before you
  share and "stop sharing" while you are, instead of the other way around.
- The soundboard's footer stops overrunning the menu: the volume row wraps
  onto a second line when the server button would push it past the fixed
  width, instead of running into the border.
- A sound pressed while the call is still joining plays locally and waits
  its turn to reach the others: announcing into a half-open connection used
  to start a negotiation in the middle of the join, which could drop the
  call before it finished connecting.
- Long text truncates instead of pushing controls out of clipped containers
  (channel headers, profile cards, settings sidebar).
- Roughly thirty labels that were hardcoded English — friend profile actions,
  profile section titles, pinned/search sidebars, several settings entries, the
  composer pickers, the desktop titlebar, the account-deletion flow and three
  modals — are now in the translation catalogs.

**Account & identity**

- You can now change your **username and discriminator yourself** from
  Settings → Account: the tag field takes any free 4-digit tag from the
  allowed pool, keeps the current one, or re-rolls it — the pair is checked
  against every existing account, reserved tags are refused, and an actual
  tag change is rate limited once per 24 h. The new tag reaches *everybody
  who needs it*: your own sessions and shared-server members through the
  regular `UserUpdate` fan-out, and friends who share no server with you
  over their private topics — a DM-only friend no longer sits on a stale
  `name#tag`. Relationships, servers and roles key off the immutable user id,
  so nothing you hold is touched by the rename. "Taken" and "not allowed"
  tag errors, and the `Your username is now X#Y` confirmation, are translated
  in every client catalog that is filled.

**Admin panel**

- A standalone **admin panel** (`entbtw/stoat-admin`) is served by Caddy at
  `https://<domain><ADMIN_PANEL_PATH>` — `/admin-panel` by default. The path is
  set once in `compose.yml` (or `.env` via `ADMIN_PANEL_PATH`) and is used for
  both the Caddy route and the panel's session cookie.
- Log in with a privileged account's login (email, `username` or
  `username#discriminator`) and password: the panel verifies the same argon2
  hash the backend wrote and refuses anybody who is not `privileged`. Sessions
  live in their own `admin_sessions` collection behind an HttpOnly cookie,
  expire after seven days (configurable with `SESSION_TTL_DAYS`) and are
  revoked the moment the account loses its rights. Failed logins are rate
  limited per IP.
- User management: search by email, username or ID, a detail view with the
  account's **current data** (login email and its normalised form, verification
  status, the read-only argon2 password hash, MFA, badges/flags, sessions,
  suspension), **detailed profile editing** — username, discriminator (typed
  explicitly or re-rolled automatically with one click), display name and
  pronouns, all validated exactly like the backend and broadcast as `UserUpdate`
  to the user's own channel, every member channel **and every friend's
  private topic** (DM-only friends see the new tag too) — **email change**
  (normalised like `util/email.rs`, duplicate-checked against both unique
  indexes, forced to `Verified` so the account stays loginable), **password
  reset** (re-hashed with the backend's own argon2 parameters
  `$argon2i$v=19$m=4096,t=3,p=1`, every session of that user is deleted and
  connected clients receive `DeleteAllSessions`), grant/revoke administrator
  rights and disable/enable an account (disabling also kicks all sessions).
- Server management: a list with channel/member counts, owners and
  descriptions, **renaming** (name 1–32 chars, description up to 1024 — the same
  rules as `DataEditServer`, published as `ServerUpdate` on the server channel),
  and **deletion that repeats the backend's full cascade** — messages with their
  attachment records, detached emojis, channels with invites/unreads/webhooks,
  members/bans, server attachments, audit logs — followed by Redis voice-state
  cleanup (`node:`/`vc:`/`vc_members:` keys) and a `ServerDelete` event so
  connected members watch the server disappear instead of erroring into it.
- The UI is **fully multilingual — all 69 Stoat languages**, picked from a
  dropdown on the login card and in the sidebar (persisted in `localStorage`,
  otherwise matched from the browser language: exact code, then sensible
  fallbacks like `zh-cn → zh-Hans`, `no → nb-NO`, `pt → pt-BR`, then the base
  language, then English). Everything except ru/en lazy-loads from
  `public/i18n/<code>.js`, so the boot payload stays small; RTL scripts
  (ar/fa/ur/ckb) flip the document direction, `Intl` formatting degrades
  gracefully for the joke locales, and every API error is localised by its
  machine-readable `code` with the server message as fallback. The design
  follows the canonical Stoat client — the same Material 3 token names, shape
  scale, sidebar + rounded content pane, filled inputs and dialog metrics —
  with no brand logo, and the layout is **mobile-ready**: the sidebar becomes
  a sticky single-line top bar, tables scroll horizontally instead of
  crushing columns, dialogs go near-fullscreen with stacked full-width
  actions, toolbars/pagers wrap, and inputs render at 16 px so iOS Safari
  never auto-zooms. Async views are guarded by a render-generation counter
  with null-checked DOM writes, so fast navigation can no longer trip over
  removed elements.
- The panel talks to MongoDB directly (no extra API, no extra schema); it only
  needs the `admin-panel` service in `compose.yml`.

### Images used by `compose.yml`

| Service           | Image                              |
| ----------------- | ---------------------------------- |
| `web`             | `entbtw/stoat:latest`              |
| `api`             | `entbtw/stoat:latest-api`          |
| `events`          | `entbtw/stoat:latest-events`       |
| `autumn`          | `entbtw/stoat:latest-file-server`  |
| `january`         | `entbtw/stoat:latest-proxy`        |
| `gifbox`          | `entbtw/stoat:latest-gifbox`       |
| `crond`           | `entbtw/stoat:latest-crond`        |
| `pushd`           | `entbtw/stoat:latest-pushd`        |
| `voice-ingress`   | `entbtw/stoat:latest-voice-ingress`|
| `livekit`         | `entbtw/stoat:latest-livekit`      |
| `admin-panel`     | `entbtw/stoat-admin:latest`        |

`compose.yml` deliberately tracks `latest` and `latest-<component>` so the
example stays universal — the tags move together whenever a release is pushed.
The same release is also published under a pinned version (`v0.0.10`,
`v0.0.10-api`, …, `v0.0.10-web`); swap any `latest-*` tag for its pinned
counterpart when you want a reproducible deploy. The admin panel is versioned
on its own and published as `v0.0.3` alongside `latest`.

The backend images are built from `v0.15.5`, the web image from the `for-web`
fork; `livekit` is a mirror of `ghcr.io/stoatchat/livekit-server:v1.9.13`.
Infrastructure images (MongoDB, Valkey, RabbitMQ, MinIO, Caddy) are still pulled
straight from their upstream registries.

## Source branches

Everything this fork ships lives as a branch of this one repository:

| Branch       | Contents                                              |
| ------------ | ----------------------------------------------------- |
| `main`       | This deployment repo — `compose.yml`, config, docs    |
| `for-web`    | The web client fork                                   |
| `stoatchat`  | The backend fork                                      |
| `stoat.js`   | The JavaScript SDK fork (a submodule of `for-web`)    |

The original upstreams (`stoatchat/self-hosted`, `stoatchat/for-web`,
`stoatchat/stoatchat`, `stoatchat/javascript-client-sdk`) are configured as the
`upstream` remote in each working copy.

This repository contains configurations and instructions that can be used for deploying a full instance of Stoat, including the back-end, web front-end, file server, and metadata and image proxy.

## Table of Contents

- [Disclaimers and Information](#disclaimers-and-information)
- [Deployment](#deployment)
  - [Securing your server](#securing-your-server)
  - [Configuring your domain](#configuring-your-domain)
  - [Install Required Dependencies](#install-required-dependencies)
- [Configuration](#configuration)
- [Updating](#updating)
- [Additional Notes](#additional-notes)
  - [Placing Behind Another Reverse-Proxy or Another Port](#placing-behind-another-reverse-proxy-or-another-port)
  - [Insecurely Expose the Database](#insecurely-expose-the-database)
  - [Mongo Compatibility](#mongo-compatibility)
  - [KeyDB Compatibility](#keydb-compatibility)
  - [Why ports 7881 and 50000-50100/udp aren't in the Caddyfile](#why-ports-7881-and-50000-50100udp-arent-in-the-caddyfile)
  - [Getting kicked on video enabled instances when turning on video](#getting-kicked-on-video-enabled-instances-when-turning-on-video)
- [Notices](#notices)
- [Security Advisories](#security-advisories)
- [Guides](Guides.md)

## Disclaimers and Information

> [!WARNING]
> If you are updating an instance from before February 28, 2026, please consult the [notices section](#notices) at the bottom.

> [!IMPORTANT]
> A list of security advisories is [provided at the bottom](#security-advisories).

> [!NOTE]
> Currently, most official clients do not support self-hosted instances. The web client works well, and when you use the [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/What_is_a_progressive_web_app) the experience is close to a native app. For more instructions regarding clients please see the [Guides](Guides.md) section of the readme.

> [!NOTE]
> Please consult _[What can I do with Stoat and how do I self-host?](https://developers.stoat.chat/faq)_ on our developer site for information about licensing and brand use.

> [!TIP]
> For guides on how to perform common configuration alterations like using NGINX or setting your instance to invite only, see the [Guides](Guides.md) section of the readme.

## Deployment

To get started, find yourself a suitable server to deploy onto, we recommend starting with at least 2 vCPUs and 2 GB of memory.

> [!TIP]
>
> **We've partnered with Hostinger to bring you a 20% discount off VPS hosting!**
>
> 👉 https://www.hostinger.com/vps-hosting?REFERRALCODE=REVOLTCHAT
>
> We recommend using the _KVM 2_ plan at minimum!\
> Our testing environment for self-hosted currently sits on a KVM 2 instance, and we are happy to assist with issues.

The instructions going forward will use Hostinger as an example hosting platform, but you should be able to adapt these to other platforms as necessary. There are important details throughout.

![Select the location](.github/guide/hostinger-1.location.webp)

When asked, choose **Ubuntu Server** as your operating system; this is used by us in production, and we recommend its use.

![Select the operating system](.github/guide/hostinger-2.os.webp)

If you've chosen to go with Hostinger, they include integrated malware scanning, which may be of interest:

![Consider malware scanning](.github/guide/hostinger-3.malware.webp)

You should set a secure root password for login (_or disable password login after setup, which is explained later! but you shouldn't make the password trivial until after this is secured at least!_) and we recommend that you configure an SSH key:

![Configuration unfilled](.github/guide/hostinger-4.configuration.webp)
![Configuration filled](.github/guide/hostinger-5.configuration.webp)

Make sure to confirm everything is correct!

![Confirmation](.github/guide/hostinger-6.complete.webp)

Wait for your VPS to be created...

| ![Wait for creation](.github/guide/hostinger-7.wait.webp) | ![Wait for creation](.github/guide/hostinger-8.connect.webp) |
| --------------------------------------------------------- | ------------------------------------------------------------ |

After installation, SSH into the machine:

```bash
# use the provided IP address to connect:
ssh root@<ip address>
# .. if you have a SSH key configured
ssh root@<ip address> -i path/to/id_rsa
```

### Securing your server

```bash
# update the system
apt-get update && apt-get upgrade -y

# configure firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw allow 7881/tcp
ufw allow 50000:50100/udp
ufw default deny
ufw enable

# if you have configured an SSH key, disable password authentication:
sudo sed -E -i 's|^#?(PasswordAuthentication)\s.*|\1 no|' /etc/ssh/sshd_config
if ! grep '^PasswordAuthentication\s' /etc/ssh/sshd_config; then echo 'PasswordAuthentication no' |sudo tee -a /etc/ssh/sshd_config; fi

# reboot to apply changes
reboot
```

> [!NOTE]
> If you are using another cloud provider, or you are doing this on a physical machine, you will need to forward ports 80, 443, 7881 and 50000-50100/udp.

### Configuring your domain

Your system is now ready to proceed with installation, but before we continue, you should configure your domain.

![Cloudflare DNS configuration](.github/guide/cloudflare-dns.webp)

Your domain (or a subdomain) should point to the server's IP (A and AAAA records) or CNAME to the hostname provided.

### Install required dependencies


```bash
# ensure Git is installed
apt-get update
apt-get install ca-certificates curl git micro
```

> [!NOTE]
> Installing docker is different per platform and this guide only covers installing on Ubuntu Server. You can find more about installing docker on other platforms [here](https://docs.docker.com/engine/install/).

```bash
# install docker
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Configuration

Now, we can pull in the configuration for Stoat:

```bash
git clone https://git.entitybtw.ru/entitybtw/stoat-selfhosted stoat
cd stoat
```

Generate a configuration file by running:

```bash
chmod +x ./generate_config.sh
./generate_config.sh your.domain
```

The generate_config.sh script will create the neccessary secrets required to create a Stoat instance, and the secrets will be inserted into a file named `secrets.env`. You should back up this file, as losing it may result in you losing access to all files on your Stoat instance.

You can find [more options here](https://github.com/stoatchat/stoatchat/blob/main/crates/core/config/Revolt.toml), some noteworthy configuration options:

- Email verification
- Captcha
- A custom S3 server
- iOS & Android notifications (Requires Apple/Google developer accounts)

If you'd like to edit the configuration, just run:

```bash
micro Revolt.toml
```

Finally, we can start up Stoat. First, run it in the foreground with:

```bash
docker compose up
```

If it runs without any critical errors, you can stop it with <kbd>Ctrl</kbd> + <kbd>C</kbd> and run it detached (in the background) by appending `-d`.

```bash
docker compose up -d
```

## Updating

Before updating, ensure you consult the notices at the top of this README, **as well as** [the notices](#notices) at the bottom, to check if there are any important changes to be aware of.

Pull the latest version of this repository:

```bash
git pull
```

Ensure that your secrets in `Revolt.toml` and `secrets.env` match. If your secrets don't match, copy the secrets from `Revolt.toml` to `secrets.env`. The following step will **overwrite** your existing configuration. If you have custom configuration settings you will need to copy them over afterwards. Alternatively, you can forgo running the configurator, but you may miss out on new features.

Run the configuration script with your domain and pass the overwrite flag:

```bash
./generate_config.sh --overwrite your.domain
```

Then pull all the latest images:

```bash
docker compose pull
```

Then restart the services:

```bash
docker compose up -d
```

## Additional Notes

### Placing Behind Another Reverse-Proxy or Another Port

During configuration using `generate_config.sh` you will be asked if you'd like to place Stoat behind another reverse proxy. Enter `y` to configure for reverse proxy. This will expose your caddy on port 8880, and you can reverse proxy to <http://localhost:8880>

See [guides](Guides.md) for more information about placing Stoat behind other reverse proxies.

### Insecurely Expose the Database

You can insecurely expose the database by adding a port definition:

```yml
# compose.override.yml
services:
  database:
    ports:
      - "27017:27017"
```

Docker will bypass your ufw rules when you do this. This means that if the port is open, the database will be publically accessible and anyone will be able to modify it.

### Mongo Compatibility

Older processors may not support the latest MongoDB version; you may pin to MongoDB 4.4 and update the healthcheck as such:

```yml
# compose.override.yml
services:
  database:
    image: mongo:4.4
    . . .
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongo localhost:27017/test --quiet
      . . .
```

### KeyDB Compatibility

Some systems (including ARM systems) may not support the latest KeyDB version; you may use redis or valkey instead as such:

```yml
# compose.override.yml
services:
  redis:
    image: valkey/valkey:8
```

### Why ports 7881 and 50000-50100/udp aren't in the Caddyfile

Livekit requires ports 7881/tcp and 50000-50100/udp to be openly accessible on the internet. These ports are used for the RTC protocol. Caddy does not support RTC without significant configuration changes that are out of scope of this repo.

### Getting kicked on video enabled instances when turning on video

The server kicks any user who publishes a video track larger than the maximum size defined in `Revolt.toml`. If you would like to increase the maximum size allowed on your Stoat instance, you can do so by modifying the `video_resolution` field under `[features.limits.new_user]` and `[features.limits.default]` to a larger value in your `Revolt.toml`. For example, 4k would be : `[3996, 2160]`.

The web client in this fork reads that limit and sizes its camera capture to fit
it, so web users no longer get kicked — a fresh 720p camera on a stock
`new_user` limit of `[1080, 720]` used to exceed it. Other clients may still be
affected.

## Notices

<details>
<summary>If you deployed Stoat before October 5, 2025...</summary>

> If you deployed Stoat before [2022-10-29](https://github.com/minio/docs/issues/624#issuecomment-1296608406), you may have to tag the `minio` image release if it's configured in "fs" mode.
>
> ```yml
> image: minio/minio:RELEASE.2022-10-24T18-35-07Z
> ```

> If you deployed Stoat before [2023-04-21](https://github.com/stoatchat/stoatchat/commit/32542a822e3de0fc8cc7b29af46c54a9284ee2de), you may have to flush your Redis database.
>
> ```bash
> # for stock Redis and older KeyDB images:
> docker compose exec redis redis-cli
> # ...or for newer KeyDB images:
> docker compose exec redis keydb-cli
>
> # then run:
> FLUSHDB
> ```

> As of 30th September 2024, Autumn has undergone a major refactor, which requires a manual migration.
>
> To begin, add a temporary container that we can work from:
>
> ```yml
> # compose.override.yml
> services:
>   migration:
>     image: node:21
>     volumes:
>       - ./migrations:/cwd
>     command: "bash -c 'while true; do sleep 86400; done'"
> ```
>
> Then switch to the shell:
>
> ```bash
> docker compose up -d database migration
> docker compose exec migration bash
> ```
>
> Now we can run the migration:
>
> ```bash
> cd /cwd
> npm i mongodb
> node ./20240929-autumn-rewrite.mjs
> ```

> As of November 28, 2024, the following breaking changes have been applied:
>
> - Rename config section `api.vapid` -> `pushd.vapid`
> - Rename config section `api.fcm` -> `pushd.fcm`
> - Rename config section `api.apn` -> `pushd.apn`
>
> These will NOT automatically be applied to your config and must be changed/added manually.
>
> The following components have been added to the compose file:
>
> - Added `rabbit` (RabbitMQ) and `pushd` (Stoat push daemon)

> As of October 5, 2025, the following breaking changes have been applied:
>
> - Rename docker compose project from revolt to stoat
>
> These will NOT automatically be applied to your environment.
>
> You must run the environment with the old revolt name to apply the update. After you run `docker compose pull` during the upgrade procedure, you must run `docker compose -p revolt down`. You may then continue with the upgrade procedure.
</details>

<br />

> [!IMPORTANT]
> As of February 28, 2026, the configuration script will load secrets into `secrets.env`. You must copy your existing secrets into secrets.env to prevent `generate_config.sh` from overwriting your secrets. If your secrets are overwritten you will lose access to all files on your Stoat instance.
>
> Copy secrets.env.example to secrets.env
>
> ```bash
> cp secrets.env.example secrets.env
> ```
>
> Begin the process of copying  your secrets to secrets.env. You can view where each secret is located by reading the `secrets.env` file. Open the file with micro and read the instructions.
>
> ```bash
> micro secrets.env
> ```
>
> All of your secrets can be found in `Revolt.toml` and should be copied to your `secrets.env` file. After all 5 secrets are copied over, you are safe to run `generate_config.sh` to get new configuration options.

> [!IMPORTANT]
> If you deployed Stoat before September 17th 2026 your minio environment will automatically migrate to silo. Stoat maintainers recommend backing up your minio directory. In the default configuration, this directory is at `data/minio`.
>
> ```bash
> sudo cp data/minio data/minio-bak
> ```

## Security Advisories

You can find information about security advisories on Stoat repositories on Github. Listed below are the latest versions that contain remediations, and links to the security advisory pages.

- backend - 0.15.0 - [stoatchat/stoatchat](https://github.com/stoatchat/stoatchat/security/advisories)
- for-web - 0.14.1 - [stoatchat/for-web](https://github.com/stoatchat/for-web/security/advisories)