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
                q: this.query,
                page: this.page,
                per_page: this.perPage,
                key: this.#API_KEY,
            },
        });
    }
}