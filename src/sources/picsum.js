// Lorem Picsum — public, no auth required. Returns curated photo metadata.
// Docs: https://picsum.photos
import axios from 'axios';

export async function fetchPicsumImages({ page = 1, limit = 30 } = {}) {
  const url = `https://picsum.photos/v2/list?page=${page}&limit=${limit}`;
  const { data } = await axios.get(url);
  return data.map((p) => ({
    original: `https://picsum.photos/id/${p.id}/1600/900`,
    thumbnail: `https://picsum.photos/id/${p.id}/240/160`,
    originalAlt: `Photo by ${p.author}`,
    thumbnailAlt: `Thumbnail by ${p.author}`,
    description: `Photo by ${p.author}`,
  }));
}
