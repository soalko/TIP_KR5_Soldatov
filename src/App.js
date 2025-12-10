const express = require('express');
const cors = require('cors');
const moviesRouter = require('./routes/movies');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Статические файлы
app.use(express.static('public'));

// Маршруты API
app.use('/api/movies', moviesRouter);

// Базовый маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API списка фильмов "Хочу посмотреть"',
        endpoints: {
            getAllMovies: 'GET /api/movies',
            getMovieById: 'GET /api/movies/:id',
            addMovie: 'POST /api/movies',
            updateMovie: 'PUT /api/movies/:id',
            deleteMovie: 'DELETE /api/movies/:id',
            searchMovies: 'GET /api/movies/search?query=...',
            filterByGenre: 'GET /api/movies/genre/:genre'
        }
    });
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`API доступно по адресу: http://localhost:${PORT}/api/movies`);
    console.log(`Веб-интерфейс: http://localhost:${PORT}`);
});