import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів 
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';
import { PixabayAPI } from './PixabayAPI';
import { refs } from './refs.js';

const pixabayAPI = new PixabayAPI();

// Функція для очищення галереї
function clearGallery() {
    refs.gallery.innerHTML = '';
}

// Ініціалізація стану
let currentPage = 1;
let currentQuery = '';
let totalHits = 0;
const perPage = 40; // Кількість зображень на сторінці

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

refs.loadMoreButton.style.display = 'none';

// Обробка події сабміту форми пошуку
refs.searchForm.addEventListener('submit', handleSearch);

// Обробка події кліку на кнопку "Завантажити ще"
refs.loadMoreButton.addEventListener('click', loadMoreImages);

// Функція для виконання HTTP-запиту до Pixabay API
async function fetchImages(query, page) {
    const API_KEY = '36691988-31241ee49ae4977171e194e7f';
    const API_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;

    try {
        const response = await axios.get(API_URL);
        const data = response.data;
        return data.hits;
    } catch (error) {
        throw new Error('Error fetching image');
    }
}

function toggleLoadMoreButton(visible) {
    if (visible) {
        refs.loadMoreButton.style.display = 'block';
    } else {
        refs.loadMoreButton.style.display = 'none';
    }
}

//Функція для обробки сабміту форми пошуку
function handleSearch(event) {
    event.preventDefault();

    const formData = new FormData(refs.searchForm);
    const query = formData.get('searchQuery');

    if (query.trim() === '') {
        Notify.failure('Please enter a search query.');
        return;
    }

    currentQuery = query;
    currentPage = 1;
    totalHits = 0;
    refs.loadMoreButton.style.display = 'none';
    searchImages(query);
}

function searchImages(query) {
    fetchImages(query, currentPage)
        .then(images => {
            renderImages(images);
            if (images.length > 0) {
                toggleLoadMoreButton(true);
                totalHits = images[0].totalHits;
                Notify.success(`Hooray! We found ${totalHits} images.`); // Виведення повідомлення зі значенням totalHits
            } else {
                toggleLoadMoreButton(false);
                Notify.info("We're sorry, but you've reached the end of search results.");
                lightbox.refresh();
            }
        })
        .catch(() => {
            Notify.failure("Error fetching images. Please try again later.");
        });
}

//функція, loadMoreImages, виконує запит на отримання наступної сторінки зображень та додає їх до галереї.
function loadMoreImages() {
    currentPage++;
    if (totalHits > 0 && (currentPage - 1) * perPage >= totalHits) {
        // Досягнуто кінця колекції
        refs.loadMoreButton.style.display = 'none';
        Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }
    searchImages(currentQuery);
}

function renderImages(images) {
    const fragment = document.createDocumentFragment();

    images.forEach(
        ({ largeImageURL,
            webformatURL,
            tags,
            likes,
            views,
            comments,
            downloads, }) => {
            const imageHTML = `<a class="gallery__item" href="${largeImageURL}">
                        <div class="photo-card">
                            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                            <div class="info">
                                <p class="info-item"><b>Likes</b> ${likes}</p>
                                <p class="info-item"><b>Views</b> ${views}</p>
                                <p class="info-item"><b>Comments</b> ${comments}</p>
                                <p class="info-item"><b>Downloads</b> ${downloads}</p>
                            </div>
                        </div>
                    </a>`;
            const tempElement = document.createElement('template');
            tempElement.innerHTML = imageHTML;
            fragment.appendChild(tempElement.content.firstChild);
        }
    );

    refs.gallery.appendChild(fragment);

    lightbox.refresh();

    scrollToNextGroup();
}

// Функція для прокручування до наступної групи зображень
function scrollToNextGroup() {

    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

function initialize() {
    toggleLoadMoreButton(false);
    clearGallery();
}

initialize();