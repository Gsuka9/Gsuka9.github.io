const API_KEY = "77031890a99c5ebdd61158def45ba79a";
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let currentCategory = 'popular'; // 'popular', 'top_rated', or 'upcoming'

const main = document.getElementById("section");
const loadMoreBtn = document.getElementById('load-more');
const loader = document.getElementById("loader");
const searchForm = document.getElementById("form");
const searchInput = document.getElementById("query");
const navLinks = document.querySelectorAll('.main-nav a');

async function fetchMovies(page, query = '', category = 'popular') {
  isLoading = true;
  loader.style.display = 'block';
  loadMoreBtn.disabled = true;
  
  try {
    let url;
    if (query) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
      url = `https://api.themoviedb.org/3/movie/${category}?api_key=${API_KEY}&page=${page}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch movies');
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Error:", error);
    showErrorToast('Failed to load movies. Please try again.');
    return [];
  } finally {
    isLoading = false;
    loader.style.display = 'none';
    loadMoreBtn.disabled = false;
  }
}

function displayMovies(movies) {
  if (currentPage === 1) {
    main.innerHTML = '';
  }
  
  if (movies.length === 0 && currentPage === 1) {
    main.innerHTML = '<div class="no-results">No movies found. Try a different search.</div>';
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
        class="movie-poster" 
        alt="${movie.title}"
        loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${movie.title}</h3>
        <p class="movie-rating">${movie.vote_average?.toFixed(1) || 'N/A'}</p>
      </div>
      <div class="movie-overlay">
        <p class="movie-overview">${movie.overview || 'No overview available.'}</p>
        <button class="view-details" data-id="${movie.id}">
          View Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    main.appendChild(card);
  });
  
  loadMoreBtn.style.display = movies.length > 0 ? 'flex' : 'none';
}

async function loadMoreMovies() {
  if (isLoading) return;
  
  currentPage++;
  const movies = await fetchMovies(currentPage, currentSearchQuery, currentCategory);
  
  if (movies.length === 0) {
    showToast('No more movies to load');
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  displayMovies(movies);
  
  setTimeout(() => {
    loadMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 300);
}

async function loadMoreMovies() {
  if (isLoading) return;
  
  currentPage++;
  const movies = await fetchMovies(currentPage, currentSearchQuery, currentCategory);
  
  if (movies.length === 0) {
    showToast('No more movies to load');
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  displayMovies(movies);
  
  // Removed the auto-scroll behavior
  // The button will stay in place while new content loads above it
}

// Handle search
async function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  
  if (query === currentSearchQuery) return;
  
  currentSearchQuery = query;
  currentPage = 1;
  
  const movies = await fetchMovies(currentPage, query, currentCategory);
  displayMovies(movies);
}

// Debounce search input
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    handleSearch(e);
  }, 500);
});

// Handle category change
function handleCategoryChange(category) {
  return async function(e) {
    e.preventDefault();
    
    // Update active state
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Reset and fetch new category
    currentCategory = category;
    currentSearchQuery = '';
    currentPage = 1;
    searchInput.value = '';
    
    const movies = await fetchMovies(currentPage, '', currentCategory);
    displayMovies(movies);
  };
}

// Add event listeners to nav links
navLinks.forEach(link => {
  const category = link.getAttribute('data-category');
  link.addEventListener('click', handleCategoryChange(category));
});

searchForm.addEventListener('submit', handleSearch);

// Initial load
fetchMovies(currentPage).then(movies => {
  displayMovies(movies);
  // Set popular as active by default
  document.querySelector('.main-nav a[data-category="popular"]').classList.add('active');
});

// Load more on click
loadMoreBtn.addEventListener('click', loadMoreMovies);

// Show error toast
function showErrorToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-error';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Replace the existing click handler with this:
document.addEventListener('click', async (e) => {
  if (e.target.closest('.view-details')) {
    const movieId = e.target.closest('.view-details').dataset.id;
    await showMovieDetails(movieId);
  }
});

async function showMovieDetails(movieId) {
  try {
    loader.style.display = 'block';
    
    // Fetch detailed movie information
    const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`;
    const res = await fetch(detailsUrl);
    
    if (!res.ok) throw new Error('Failed to fetch movie details');
    const movieDetails = await res.json();
    
    // Display the details in a modal
    displayMovieDetailsModal(movieDetails);
  } catch (error) {
    console.error("Error:", error);
    showErrorToast('Failed to load movie details. Please try again.');
  } finally {
    loader.style.display = 'none';
  }
}

function displayMovieDetailsModal(movie) {
  // Create modal HTML
  const modal = document.createElement('div');
  modal.className = 'movie-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      <div class="modal-header" style="background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), 
        url(${movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : 'https://via.placeholder.com/1280x720?text=No+Backdrop'});">
        <div class="header-content">
          <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
               class="modal-poster" 
               alt="${movie.title}">
          <div class="header-info">
            <h2>${movie.title} <span>(${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'})</span></h2>
            <div class="meta-info">
              <span>${movie.runtime ? `${Math.floor(movie.runtime/60)}h ${movie.runtime%60}m` : 'N/A'}</span>
              <span>•</span>
              <span>${movie.genres?.map(g => g.name).join(', ') || 'N/A'}</span>
              <span>•</span>
              <span>${movie.vote_average?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <h3>Overview</h3>
            <p>${movie.overview || 'No overview available.'}</p>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <section class="cast-section">
          <h3>Top Cast</h3>
          <div class="cast-scroller">
            ${movie.credits?.cast.slice(0, 10).map(actor => `
              <div class="cast-member">
                <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                     alt="${actor.name}">
                <p class="actor-name">${actor.name}</p>
                <p class="character">${actor.character}</p>
              </div>
            `).join('') || '<p>No cast information available</p>'}
          </div>
        </section>
        
        ${movie.videos?.results.length > 0 ? `
        <section class="videos-section">
          <h3>Videos</h3>
          <div class="video-container">
            <iframe width="560" height="315" 
                    src="https://www.youtube.com/embed/${movie.videos.results[0].key}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
          </div>
        </section>
        ` : ''}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  // Add close handler
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
  });
  
  // Close when clicking outside content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      document.body.style.overflow = 'auto';
    }
  });
}