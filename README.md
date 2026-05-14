# Photo Gallery

A React photo gallery app that fetches images recursively from a GitLab repository and renders them with thumbnail browsing and lazy loading.

## Features

- Fetches image files from a GitLab repository via the GitLab REST API
- Recursive directory traversal to collect all images
- Smooth gallery view with thumbnails using `react-image-gallery`
- Lazy loading for performance
- Personal access token support for private GitLab repos

## Tech Stack

- **Framework:** React 18
- **HTTP Client:** Axios
- **Gallery:** react-image-gallery

## Getting Started

### Prerequisites

- Node.js >= 14
- GitLab personal access token (for private repos)

### Installation

```bash
git clone https://github.com/amanshakya2001/photo-gallery-project.git
cd photo-gallery-project
npm install
```

### Configuration

Update the GitLab API config in the source with your:
- GitLab project ID
- Personal access token
- Branch name

### Running

```bash
npm start
```

## License

MIT
