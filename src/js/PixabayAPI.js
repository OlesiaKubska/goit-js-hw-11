// PixabayAPI.js
import axios from "axios";

export class PixabayAPI {
    #BASE_URL = 'https://pixabay.com/api/';
    #API_KEY = '36691988-31241ee49ae4977171e194e7f';

    constructor() {
        this.page = 1;
        this.query = null;
        this.perPage = 40; // Кількість зображень на сторінці
    }
    
    fetchPhotosByQuery() {
        return axios.get(`${this.#BASE_URL}/?`, {
            params: {
                image_type: 'photo',
                orientation: 'horizontal',
                q: this.page,
                per_page: this.perPage,
                key: this.#API_KEY,
                safesearch: true,
            },
        });
    }
}

// const API_KEY = '36691988-31241ee49ae4977171e194e7f';

// class PixabayAPI {
    
//     }


//     async fetchImages(searchQuery, page) {
        
//         try {
//             const API_URL = `${this.BASE_URL}?key=${this.API_KEY}&q=${encodeURIComponent(searchQuery)}&page=${page}&per_page=${perPage}`;
            
//             const response = await fetch(API_URL);
            
//             if (!response.ok) {
//                 throw new Error('Unable to fetch images from Pixabay API.');
//             }

//             const data = await response.json();
//             return data;
//         } catch (error) {
//             console.error(error);
//             throw error;
//         }
//     }
// }

// export default PixabayAPI;