const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');

// Получить все фильмы с пагинацией
router.get('/', moviesController.getAllMovies);

// Получить фильм по ID
router.get('/:id', moviesController.getMovieById);

// Добавить новый фильм
router.post('/', moviesController.addMovie);

// Обновить фильм
router.put('/:id', moviesController.updateMovie);

// Удалить фильм
router.delete('/:id', moviesController.deleteMovie);

// Фильтрация по жанру
router.get('/genre/:genre', moviesController.getMoviesByGenre);

module.exports = router;