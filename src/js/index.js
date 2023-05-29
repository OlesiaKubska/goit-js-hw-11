import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';
import PixabayAPI from './PixabayAPI';
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

function handleSearch(event) {
    event.preventDefault();
    performSearch(event);
}

// Функція для обробки події пошуку
function performSearch(event) {
    event.preventDefault();
    clearGallery();

    const formData = new FormData(refs.searchForm);
    const query = formData.get('searchQuery');

    if (query.trim() === '') {
        Notify.failure('Please enter a search query.');
        return;
    }

    currentQuery = query;
    currentPage = 1;
    
    searchImages(query);
}

async function searchImages(query) {
    try {
        const images = await fetchImages(query, currentPage);
        renderImages(images);
        if (images.length > 0) {
            refs.loadMoreButton.style.display = 'block';
            const totalHits = images[0].totalHits;
            Notify.success("Hooray! We found ${totalHits} images.");
        } else {
            Notify.info("We're sorry, but you've reached the end of search results.");
        }
    } catch (error) {
        Notify.failure("Error fetching images. Please try again later.");
    }
}

//функція, loadMoreImages, виконує запит на отримання наступної сторінки зображень та додає їх до галереї.
function loadMoreImages() {
    currentPage++;
    searchImages(currentQuery);
}

function renderImages(images) {
    const fragment = document.createDocumentFragment();

    images.forEach((image) => {
        const photoCard = createPhotoCard(image);
        fragment.appendChild(photoCard);
    });

    refs.gallery.appendChild(fragment);

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();
    
    scrollToNextGroup();
}

// Функція для відображення зображень у галереї
function createPhotoCard(image) {
    const { webformatURL, tags, likes, views, comments, downloads } = image;

    const card = document.createElement('div');
    card.classList.add('photo-card');

    const imageElement = document.createElement('img');
    imageElement.src = webformatURL;
    imageElement.alt = tags;
    imageElement.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');

    const likesInfo = createInfoItem('Likes', likes);
    const viewsInfo = createInfoItem('Views', views);
    const commentsInfo = createInfoItem('Comments', comments);
    const downloadsInfo = createInfoItem('Downloads', downloads);

    info.appendChild(likesInfo);
    info.appendChild(viewsInfo);
    info.appendChild(commentsInfo);
    info.appendChild(downloadsInfo);

    card.appendChild(imageElement);
    card.appendChild(info);

    return card;
}

// Функція для створення елемента інформації
function createInfoItem(label, value) {
    const item = document.createElement('p');
    item.classList.add('info-item');
    item.innerHTML = `<b>${label}:</b> ${value}`;
    return item;
}

// Функція для прокручування до наступної групи зображень
function scrollToNextGroup() {

    const cardHeight = refs.gallery
        .querySelector('.photo-card')
        .offsetHeight;

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

// Ініціалізація функціональності
function initializeLightbox() {
    const lightbox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
        fadeSpeed: 400,
    });

    lightbox.refresh();
}

function initialize() {
    refs.loadMoreButton.style.display = 'block';
    refs.searchForm.addEventListener('submit', performSearch);
    refs.loadMoreButton.addEventListener('click', loadMoreImages);
    initializeLightbox();
}

initialize();