import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів 
import "simplelightbox/dist/simple-lightbox.min.css";

import { PixabayAPI } from './PixabayAPI';
import { refs } from './refs.js';
import { markupImage } from './markupImage';

const pixabayAPI = new PixabayAPI();

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
});

let totalHits = 0; // Оголошуємо totalHits як глобальну змінну

refs.loadMoreButton.classList.add('is-hidden');

// Обробка події сабміту форми пошуку
refs.searchForm.addEventListener('submit', handleSearch);

// Обробка події кліку на кнопку "Завантажити ще"
refs.loadMoreButton.addEventListener('click', loadMoreImages);

//Функція для обробки сабміту форми пошуку
async function handleSearch(event) {
    event.preventDefault();

    const formData = new FormData(refs.searchForm);
    const query = formData.get('searchQuery');

    if (query.trim() === '') {
        Notify.failure('Please enter a search query.');
        return;
    }

    pixabayAPI.query = query;
    pixabayAPI.page = 1;
    refs.loadMoreButton.classList.add('is-hidden');

    clearGallery();
    searchImages();
}

// Функція для перевірки, чи досягнуто кінця колекції зображень
function isEndOfResults(totalHits) {
    return pixabayAPI.page * pixabayAPI.perPage >= totalHits;
}

async function searchImages() {
    
    try {
        const response = await pixabayAPI.fetchPhotosByQuery();
        const { hits, total } = response.data;
        totalHits = total;
        renderImages(hits);

        if (pixabayAPI.page === 1) {
            Notify.success(`Hooray! We found ${totalHits} images.`); // Виведення повідомлення зі значенням totalHits
        }
        
        if (isEndOfResults(totalHits)) {
            Notify.info("We're sorry, but you've reached the end of search results.");
            hideLoadMoreButton();
            return;
        }
        
        if (totalHits > pixabayAPI.perPage) {
            showLoadMoreButton();
        }
    } catch (error) {
        Notify.failure("Error fetching images. Please try again later.");
    }
}
    
function showLoadMoreButton() {
    const loadMoreButton = document.querySelector('.load-more');
    loadMoreButton.classList.remove('is-hidden');
}

function hideLoadMoreButton() {
    refs.loadMoreButton.classList.add('is-hidden');
}

//функція, loadMoreImages, виконує запит на отримання наступної сторінки зображень та додає їх до галереї.
async function loadMoreImages() {
    if (isEndOfResults()) {
        Notify.info("We're sorry, but you've reached the end of search results.");
        hideLoadMoreButton();
        return;
    }
    pixabayAPI.page++;
    try {
        const response = await pixabayAPI.fetchPhotosByQuery();
        const { hits } = response.data;
        renderImages(hits);
    } catch (error) {
        Notify.failure("Error fetching images. Please try again later.");
    }
}

// Функція для очищення галереї
function clearGallery() {
    refs.gallery.innerHTML = '';
}

function renderImages(images, totalHits) {
    const markup = markupImage(images);

    refs.gallery.insertAdjacentHTML('beforeend', markup);
    
    scrollToNextGroup();
    
    lightbox.refresh();
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
    clearGallery();
}

initialize();