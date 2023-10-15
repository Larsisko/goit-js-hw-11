import axios from 'axios';
const apiKey = '39979366-9904944878946fdfb016ae5ad';
const perPage = 40;

export async function searchImages(query, page) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: perPage,
        page: page,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
