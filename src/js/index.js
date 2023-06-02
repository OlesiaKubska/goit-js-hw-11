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
                lightbox.refresh();
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

    images.forEach((image) => {
        const photoCard = createPhotoCard(image);
        fragment.appendChild(photoCard);
    });

    refs.gallery.appendChild(fragment);
    
    lightbox.refresh();

    scrollToNextGroup();
}

// Функція для відображення зображень у галереї
function createPhotoCard(image) {
    const { webformatURL, tags, likes, views, comments, downloads } = image;

    const card = document.createElement('div');
    card.classList.add('photo-card');

    const link = document.createElement('a');
    link.href = webformatURL;
    link.dataset.simplelightbox = 'gallery'; // атрибут для lightbox

    const imageElement = document.createElement('img');
    imageElement.src = webformatURL;
    imageElement.alt = tags;
    imageElement.loading = 'lazy';

    link.appendChild(imageElement);

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
    card.appendChild(link);
    card.appendChild(info);

    return card;
}

// Функція для створення елемента інформації
function createInfoItem(label, value) {
    const item = document.createElement('p');
    item.classList.add('info-item');
    item.innerHTML = `<b>${label}</b> ${value}`;
    return item;
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