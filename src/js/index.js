import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';

    // Отримання посилань на необхідні елементи DOM
const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// Ініціалізація стану
let currentPage = 1;
let currentQuery = '';
const perPage = 40; // Кількість зображень на сторінці

loadMoreBtn.style.display = 'none';

searchForm.addEventListener('submit', performSearch);
loadMoreBtn.addEventListener('click', loadMoreImages);

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

function performSearch(event) {
    event.preventDefault();
    clearGallery();

    const formData = new FormData(searchForm);
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
            loadMoreBtn.style.display = 'block';
        } else {
            Notify.info('Sorry, there are no images matching your search query. Please try again.');
        }
    } catch (error) {
        Notify.failure('Error fetching images. Please try again later.');
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

    galleryContainer.appendChild(fragment);

    const lightbox = new SimpleLightbox('.gallery a');
    lightbox.refresh();
    
    scrollToNextGroup();
}

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

function createInfoItem(label, value) {
    const item = document.createElement('p');
    item.classList.add('info-item');
    item.innerHTML = `<b>${label}:</b> ${value}`;
    return item;
}

function scrollToNextGroup() {

    const cardHeight = galleryContainer
        .querySelector('.photo-card')
        .offsetHeight;

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

// Функція для очищення галереї
function clearGallery() {
    galleryContainer.innerHTML = '';
}

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
    loadMoreBtn.style.display = 'none';
    searchForm.addEventListener('submit', performSearch);
    loadMoreBtn.addEventListener('click', loadMoreImages);
}

initialize();