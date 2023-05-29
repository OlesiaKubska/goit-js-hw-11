// PixabayAPI.js

const API_KEY = '36691988-31241ee49ae4977171e194e7f';

class PixabayAPI {
    constructor(API_KEY) {
        this.API_KEY = API_KEY;
        this.BASE_URL = 'https://pixabay.com/api/';
    }


    async fetchImages(searchQuery, page, perPage) {
        
        try {
            const API_URL = `${this.BASE_URL}?key=${this.API_KEY}&q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}`;
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error('Unable to fetch images from Pixabay API.');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

export default PixabayAPI;