# Photo Gallery

A React photo gallery that works out-of-the-box with **Lorem Picsum** (no setup), and can also browse images from any **GitLab repository** when you supply a project path and an optional access token.

## Features

- **Two sources** — Lorem Picsum (zero-config) and GitLab (recursive image walk through any repo).
- **Switch sources** from the navbar; your config (project path, token, theme) persists in `localStorage`.
- **Token handling** — your GitLab Personal Access Token never leaves the browser. No server, no logging.
- **Light/dark theme** — sun/moon toggle, respects OS preference on first load.
- **Loading skeleton**, **error state with retry**, and **empty state** — never a blank screen.
- **Lazy loading** + thumbnails via [`react-image-gallery`](https://github.com/xiaolin/react-image-gallery).

## Tech Stack

- React 18
- axios
- react-image-gallery

## Getting Started

```bash
git clone https://github.com/amanshakya2001/photo-gallery-project.git
cd photo-gallery-project
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000). The Picsum source loads automatically.

## Using the GitLab source

1. Click **GitLab** in the navbar.
2. Enter the project path (e.g. `your-username/your-repo`) and a branch.
3. For public repos, leave the token blank. For private repos, paste a Personal Access Token with the `read_api` scope. Create one at *gitlab.com → User Settings → Access Tokens*.
4. Click **Load photos**.

> Tokens are stored in your browser's `localStorage` and are only ever sent to `gitlab.com`. Never paste a token into anything you don't trust.

## License

MIT
