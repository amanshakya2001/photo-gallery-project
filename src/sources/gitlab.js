// GitLab — recursively fetch image files from a repo.
// All credentials come from the caller. Never hard-coded.
import axios from 'axios';

const IMG_EXT = /\.(jpg|jpeg|png|gif|webp|avif)$/i;

export async function fetchGitLabImages({ projectPath, branch = 'main', token = '' }) {
  if (!projectPath) {
    throw new Error('GitLab project path is required (e.g. "group/repo").');
  }

  const baseUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectPath)}`;
  const headers = token ? { 'PRIVATE-TOKEN': token } : {};
  const collected = [];

  async function walk(dir = '') {
    const url = `${baseUrl}/repository/tree?per_page=100&path=${encodeURIComponent(dir)}&ref=${encodeURIComponent(branch)}`;
    const { data } = await axios.get(url, { headers });

    for (const item of data) {
      if (item.type === 'blob' && IMG_EXT.test(item.name)) {
        const src = `https://gitlab.com/${projectPath}/-/raw/${branch}/${item.path}`;
        collected.push({
          original: src,
          thumbnail: src,
          originalAlt: item.name,
          thumbnailAlt: item.name,
        });
      } else if (item.type === 'tree') {
        await walk(item.path);
      }
    }
  }

  await walk();
  return collected;
}
