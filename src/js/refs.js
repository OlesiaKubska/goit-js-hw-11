// refs.js

// Посилання на форму пошуку
const searchForm = document.querySelector('#search-form');

// Посилання на текстове поле для пошуку
const searchInput = document.querySelector('input[name="searchQuery"]');

// Посилання на кнопку "Search"
const searchButton = document.querySelector('button[type="submit"]');

// Посилання на галерею зображень
const gallery = document.querySelector('.gallery');

// Посилання на кнопку "Load more"
const loadMoreButton = document.querySelector('.load-more');

// Експортуємо посилання, щоб їх було доступно у інших модулях
export { searchForm, searchInput, searchButton, gallery, loadMoreButton };