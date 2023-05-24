import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from "axios";

    // Отримання посилань на необхідні елементи DOM
const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// Ініціалізація стану
let currentPage = 1;
let currentQuery = '';

// Функція для виконання HTTP-запиту до Pixabay API
async function fetchImages(query, page) {
    const apiKey = '36691988-31241ee49ae4977171e194e7f';
    const perPage = 40; // Кількість зображень на сторінці

    const url = `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data.hits;
        } else {
            throw new Error('Request failed');
        }
    } catch (error) {
        console.log(error);
        return [];
    }
}

searchForm.addEventListener('submit', performSearch);
loadMoreBtn.addEventListener('click', loadMoreImages);

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

function renderImages(images) {
    const fragment = document.createDocumentFragment();

    for (const image of images) {
        const photoCard = createPhotoCard(image);
        fragment.appendChild(photoCard);
    }

    galleryContainer.appendChild(fragment);
    initializeLightbox();
    scrollToNextGroup();
}

//функція, loadMoreImages, виконує запит на отримання наступної сторінки зображень та додає їх до галереї.
async function loadMoreImages() {
    currentPage += 1;
    const image = await fetchImages(currentQuery, currentPage);

    if (image.length > 0) {
        renderImages(images);
    } else {
        loadMoreBtn.style.display = 'none';
        Notify.info("We're sorry, but you've reached the end of search results.");
    }
}

function createPhotoCard(image) {
    const { webformatURL, largeImageURL, tags, likes, views, comments, downloads } = image;

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

// Функція для очищення галереї
function clearGallery() {
    galleryContainer.innerHTML = '';
}

function scrollToNextGroup() {

    const { height: cardHeight } = galleryContainer
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

//Функція performSearch виконує пошук зображень за введеним користувачем запитом. Вона очищує галерею, виконує запит до API та відображає результати.
async function performSearch(event) {
    event.preventDefault();
    clearGallery();

    const formData = new FormData(searchForm);
    const query = formData.get('searchQuery');

    if (query.trim() === '') {
        Notiflix.Notify.failure('Please enter a search query.');
        return;
    }

    currentQuery = query;
    currentPage = 1;

    const images = await fetchImages(query, currentPage);

    if (images.length > 0) {
        renderImages(images);
        loadMoreBtn.style.display = 'block';
    } else {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
    }
}