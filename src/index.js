import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";// Описаний в документації
// Додатковий імпорт стилів
import "simplelightbox/dist/simple-lightbox.min.css";

import axios from "axios";
axios.get('/users')
    .then(res => {
    console.log(res.data);
    });

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let currentSearchQuery = '';

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleFormSubmit(event) {
    event.preventDefault();
    const searchQuery = form.searchQuery.value.trim();

    if (searchQuery === '') {
        return;
    }

    currentSearchQuery = searchQuery;
    page = 1;
    clearGallery();
    searchImages(searchQuery);
}

function searchImages(searchQuery) {
    const apiKey = 'YOUR_API_KEY';
    const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

    axios.get(url)
        .then(response => {
            const images = response.data.hits;
            const totalHits = response.data.totalHits;

            if (images.length === 0) {
                showNotification('Sorry, there are no images matching your search query. Please try again.');
            } else {
                showNotification(`Hooray! We found ${totalHits} images.`);
                renderImages(images);
                showLoadMoreButton();
            }
        })
        .catch(error => {
            console.error(error);
        });
}

function renderImages(images) {
    const fragment = document.createDocumentFragment();

    for (const image of images) {
        const photoCard = createPhotoCard(image);
        fragment.appendChild(photoCard);
    }

    gallery.appendChild(fragment);
    initializeLightbox();
    scrollToNextGroup();
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

function clearGallery() {
    gallery.innerHTML = '';
}

function showLoadMoreButton() {
    loadMoreBtn.style.display = 'block';
}

function hideLoadMoreButton() {
    loadMoreBtn.style.display = 'none';
}

function loadMoreImages() {
    page++;
    searchImages(currentSearchQuery);
}

function showNotification(message) {
    Notify.info(message, {
        timeout: 3000,
        position: 'bottom-right',
    });
}

function scrollToNextGroup() {

    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}