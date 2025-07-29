// 📌 Urls and Fetchs
const API_KEY = 'd7a4f2e262f2710f616c8d4e47285e1c';
const URL_BASE = 'https://api.themoviedb.org/3/';

async function searchMoviesBySearch(query) {
    try {
        const response = await fetch(`${URL_BASE}search/movie?api_key=${API_KEY}&query=${query}`);
        if(!response.ok) throw new Error(`Error al encontrar pelicula: ${query}`);

        const data = await response.json();
        return data.results;
    } catch(error) {
        console.log(error);
        return [];
    }
}

async function fetchPopularMovies() {
    try {
        const response = await fetch(`${URL_BASE}movie/popular?api_key=${API_KEY}`);
        if(!response.ok) throw new Error('Error al buscar lista de peliculas');

        const data = await response.json();
        return data.results;
    } catch(error) {
        console.log(error);
        return [];
    }
}

async function fecthId(id) {
    try {
        const response = await fetch(`${URL_BASE}movie/${id}?api_key=${API_KEY}`);
        if(!response.ok) throw new Error(`No se encontró pelicula con el id ${id}`);

        const data = await response.json();
        return data;
    } catch(error) {
        console.log(error);
        return [];
    }
}

// 📌 DOM Events
document.getElementById('form-id').addEventListener('submit', async (e) => {
    e.preventDefault();

    const moviename = document.getElementById('name').value.trim();
    const display = document.getElementById('results');    
    document.getElementById('results-cont').style.display = 'flex';

    if(moviename) {
        
        const movies = await searchMoviesBySearch(moviename);
        displayMovies(movies, display);
    } else {
        display.innerHTML = "<h2 style='color: red;'>Fill name field<h2>";     
    }
    
    e.target.reset();
});

document.addEventListener('DOMContentLoaded', async () => {
    const featured = await fetchPopularMovies();
    const display = document.getElementById('featured');
    displayMovies(featured, display);
    
    displayWL(load());
    console.log(load())
});

document.getElementById('close').addEventListener('click', () => {
    document.getElementById('details-cont').style.display = 'none';
})

// 📌 Display Elements
function displayMovies(movies, display) {
    display.innerHTML = '';

    display.innerHTML = movies.map(movie => `
        <div>
        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" data-id="${movie.id}" loading="lazy">
        </div>
    `).join('');

    display.addEventListener('click', async (e) => {
        const cont = document.getElementById('details-cont');
        cont.style.display = 'flex';

        const id = e.target.dataset.id;
        const search = await fecthId(id);
        displayMovieDetails(search);
    });
}

function displayMovieDetails(movie) {
    console.log(movie)
    const display = document.getElementById('details')
    display.innerHTML = '';

    display.innerHTML = `
    <div class="movie-details">
        <div class="img-cont">
            <img src="https://image.tmdb.org/t/p/original/${movie.poster_path}" alt="Poster">
        </div>
        <div class="info-cont">
            <h1>${movie.title} (${movie.release_date})</h1>
            <p>Genres: ${movie.genres.map(genre => genre.name).join(', ')}</p>
            <p>Languages: ${movie.spoken_languages.map(languaje => languaje.english_name).join(', ')}</p>
            <p>${movie.overview}</p>
            <p>Production Companies: ${movie.production_companies.map(companie => companie.name).join(', ')}</p>
            <p>Vote Average: ${movie.vote_average} - Popularity: ${movie.popularity}</p>
            <button class="add-to-watch-later-btn" id="add-to-watch-later-btn" data-id=${movie.id}>Watch Later</button>
        </div>
    </div>
    `;

    display.addEventListener('click', async (e) => {
        if(e.target.classList.contains('add-to-watch-later-btn')) {
            const id = e.target.dataset.id;
            save(id);
            alert('Added!')
            console.log(load())
        } else {
            alert('Failed to save to watch later');
        }
    });
}

async function displayWL(movies) {
    const display = document.getElementById('watch-later');
    display.innerHTML = '';

    for(let movie of movies) {
        const mov = await fecthId(movie);
        display.innerHTML += `
        <div>
            <img src="https://image.tmdb.org/t/p/w200${mov.poster_path}" alt="${mov.title}">
            <button class="remove-btn" data-id="${mov.id}">Eliminar</button>
        </div>`;
    }

    display.addEventListener('click', (e) => {
        if(e.target.classList.contains('remove-btn')) {
            const id = e.target.dataset.id;
            let movies = load();
            movies = movies.filter(movie => movie !== id);
            localStorage.setItem('wlaterID', JSON.stringify(movies));
            displayWL(movies);
            alert('¡Eliminada de la lista!');
        }
    });
}

// 📌 Load and Save in Watch Later
function save(id) {
    if(!id) return;

    let movies = load();
    if(!movies.find(movie => movie === id)) {
        movies.push(id);
        localStorage.setItem('wlaterID', JSON.stringify(movies));
        displayWL(movies);
    } else {
        console.log('Pelicula ya añadidia a "Ver mas Tarde"');
    }
}

function load() {
    return JSON.parse(localStorage.getItem('wlaterID')) || [];
}