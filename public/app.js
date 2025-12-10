class MovieApp {
    constructor() {
        this.baseUrl = '/api/movies';
        this.init();
    }

    init() {
        this.loadMovies();
        this.setupEventListeners();
    }

    async loadMovies() {
        try {
            this.showLoading();
            const response = await fetch(`${this.baseUrl}?limit=20`);
            const data = await response.json();
            this.displayMovies(data.movies);
        } catch (error) {
            this.showError('Ошибка загрузки фильмов');
        }
    }


    async addMovie(event) {
        event.preventDefault();

        const movieData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            genre: document.getElementById('genre').value,
            year: parseInt(document.getElementById('year').value),
            director: document.getElementById('director').value,
            rating: parseFloat(document.getElementById('rating').value),
            posterUrl: document.getElementById('posterUrl').value
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            });

            if (response.ok) {
                const newMovie = await response.json();
                this.loadMovies();
                document.getElementById('movieForm').reset();
                this.showMessage('Фильм успешно добавлен!');
            } else {
                this.showError('Ошибка при добавлении фильма');
            }
        } catch (error) {
            this.showError('Ошибка соединения');
        }
    }

    async deleteMovie(id) {
        if (!confirm('Удалить этот фильм из списка?')) return;

        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadMovies();
                this.showMessage('Фильм удален');
            }
        } catch (error) {
            this.showError('Ошибка при удалении фильма');
        }
    }

    async markAsWatched(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ watched: true })
            });

            if (response.ok) {
                this.loadMovies();
                this.showMessage('Фильм отмечен как просмотренный');
            }
        } catch (error) {
            this.showError('Ошибка при обновлении фильма');
        }
    }

    displayMovies(movies) {
        const container = document.getElementById('moviesContainer');

        if (!movies || movies.length === 0) {
            container.innerHTML = '<div class="no-movies">Нет фильмов в списке</div>';
            return;
        }

        container.innerHTML = movies.map(movie => `
      <div class="movie-card">
        <h3>${movie.title} (${movie.year})</h3>
        <div class="movie-info">
          <span class="genre">${movie.genre}</span>
          <span class="director">${movie.director}</span>
          <span class="rating">⭐ ${movie.rating}/10</span>
        </div>
        <div class="movie-description">${movie.description}</div>
        <div class="movie-actions">
          <button class="action-btn watch-btn" onclick="app.markAsWatched('${movie.id}')">
            ${movie.watched ? '✓ Просмотрено' : 'Отметить просмотренным'}
          </button>
          <button class="action-btn delete-btn" onclick="app.deleteMovie('${movie.id}')">
            Удалить
          </button>
        </div>
      </div>
    `).join('');
    }

    showLoading() {
        const container = document.getElementById('moviesContainer');
        container.innerHTML = '<div class="loading">Загрузка фильмов...</div>';
    }

    showError(message) {
        const container = document.getElementById('moviesContainer');
        container.innerHTML = `<div class="error">${message}</div>`;
    }

    showMessage(message) {
        const alert = document.createElement('div');
        alert.className = 'alert success';
        alert.textContent = message;
        alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 1000;
    `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    setupEventListeners() {
        // Форма добавления фильма
        document.getElementById('movieForm').addEventListener('submit', (e) => this.addMovie(e));
    }
}

// Инициализация приложения
const app = new MovieApp();