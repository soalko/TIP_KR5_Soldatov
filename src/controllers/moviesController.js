const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/movies.json');

// Вспомогательная функция для работы с данными
const readData = async () => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { movies: [] };
    }
};

const writeData = async (data) => {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
};

// Генерация нового ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const moviesController = {
    // Получить все фильмы с пагинацией
    getAllMovies: async (req, res) => {
        try {
            const data = await readData();
            let movies = data.movies;

            // Пагинация через query параметры
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortBy = req.query.sortBy || 'addedDate';
            const order = req.query.order || 'desc';

            // Сортировка
            movies.sort((a, b) => {
                if (order === 'asc') {
                    return a[sortBy] > b[sortBy] ? 1 : -1;
                }
                return a[sortBy] < b[sortBy] ? 1 : -1;
            });

            // Пагинация
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedMovies = movies.slice(startIndex, endIndex);

            const totalPages = Math.ceil(movies.length / limit);

            res.json({
                movies: paginatedMovies,
                pagination: {
                    page,
                    limit,
                    totalItems: movies.length,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении фильмов' });
        }
    },

    // Получить фильм по ID
    getMovieById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await readData();
            const movie = data.movies.find(m => m.id === id);

            if (!movie) {
                return res.status(404).json({ error: 'Фильм не найден' });
            }

            res.json(movie);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении фильма' });
        }
    },

    // Добавить новый фильм
    addMovie: async (req, res) => {
        try {
            const { title, description, genre, year, director, rating, posterUrl } = req.body;

            if (!title) {
                return res.status(400).json({ error: 'Название фильма обязательно' });
            }

            const data = await readData();
            const newMovie = {
                id: generateId(),
                title,
                description: description || '',
                genre: genre || 'Не указан',
                year: year || new Date().getFullYear(),
                director: director || 'Неизвестно',
                rating: rating || 0,
                posterUrl: posterUrl || '',
                addedDate: new Date().toISOString(),
                watched: false,
                priority: data.movies.length + 1
            };

            data.movies.push(newMovie);
            await writeData(data);

            res.status(201).json(newMovie);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при добавлении фильма' });
        }
    },

    // Обновить фильм
    updateMovie: async (req, res) => {
        try {
            const { id } = req.params;
            const updates = req.body;

            const data = await readData();
            const movieIndex = data.movies.findIndex(m => m.id === id);

            if (movieIndex === -1) {
                return res.status(404).json({ error: 'Фильм не найден' });
            }

            // Сохраняем ID и дату добавления
            updates.id = id;
            updates.addedDate = data.movies[movieIndex].addedDate;
            updates.updatedDate = new Date().toISOString();

            data.movies[movieIndex] = { ...data.movies[movieIndex], ...updates };
            await writeData(data);

            res.json(data.movies[movieIndex]);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при обновлении фильма' });
        }
    },

    // Удалить фильм
    deleteMovie: async (req, res) => {
        try {
            const { id } = req.params;

            const data = await readData();
            const movieIndex = data.movies.findIndex(m => m.id === id);

            if (movieIndex === -1) {
                return res.status(404).json({ error: 'Фильм не найден' });
            }

            data.movies.splice(movieIndex, 1);
            await writeData(data);

            res.json({ message: 'Фильм успешно удален' });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при удалении фильма' });
        }
    },

    // Получить фильмы по жанру
    getMoviesByGenre: async (req, res) => {
        try {
            const { genre } = req.params;

            const data = await readData();
            const filteredMovies = data.movies.filter(movie =>
                movie.genre.toLowerCase() === genre.toLowerCase()
            );

            res.json({
                genre,
                movies: filteredMovies,
                count: filteredMovies.length
            });
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при фильтрации по жанру' });
        }
    }
};

module.exports = moviesController;