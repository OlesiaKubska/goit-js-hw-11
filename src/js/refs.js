// refs.js

// Експортуємо, щоб було доступно у інших модулях
export const refs = {
    // Посилання на форму пошуку
    searchForm: document.querySelector('#search-form'),

    // Посилання на текстове поле для пошуку
    searchInput: document.querySelector('input[name="searchQuery"]'),

    // Посилання на кнопку "Search"
    searchButton: document.querySelector('button[type="submit"]'),

    // Посилання на галерею зображень
    gallery: document.querySelector('.gallery'),

    // Посилання на кнопку "Load more"
    loadMoreButton: document.querySelector('.load-more'),
}