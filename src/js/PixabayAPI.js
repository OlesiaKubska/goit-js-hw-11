// PixabayAPI.js

import axios from "axios";

const API_KEY = '36691988-31241ee49ae4977171e194e7f';

async function fetchImages(keyword, page, perPage) {
    const API_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(keyword)}&page=${page}&per_page=${perPage}`;

    try {
        const response = await axios.get(API_URL);
        const data = response.data;
        return data;
    } catch (error) {
        throw new Error('Error fetching images');
    }
}

export { fetchImages };