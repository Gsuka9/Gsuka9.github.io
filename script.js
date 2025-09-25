const API_KEY = "77031890a99c5ebdd61158def45ba79a";
let currentPage = 1;
let isLoading = false;
let currentSearchQuery = '';
let currentCategory = 'popular-movies'; // 'popular-movies', 'top_rated-movies', 'upcoming-movies', 'popular-series'

const main = document.getElementById("section");
const loadMoreBtn = document.getElementById('load-more');
const loader = document.getElementById("loader");
const searchForm = document.getElementById("form");
const searchInput = document.getElementById("query");
const navLinks = document.querySelectorAll('.main-nav a');

async function fetchContent(page, query = '', category = 'popular-movies') {
  isLoading = true;
  loader.style.display = 'block';
  loadMoreBtn.disabled = true;
  
  try {
    let url;
    const isSeries = category.includes('series');
    const endpoint = isSeries ? 'tv' : 'movie';
    const categoryType = category.split('-')[0]; // e.g., 'popular', 'top_rated', 'upcoming'

    if (query) {
      url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
      url = `https://api.themoviedb.org/3/${endpoint}/${categoryType === 'popular' && isSeries ? 'popular' : categoryType}?api_key=${API_KEY}&page=${page}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${isSeries ? 'series' : 'movies'}`);
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("Error:", error);
    showErrorToast(`Failed to load ${category.includes('series') ? 'series' : 'movies'}. Please try again.`);
    return [];
  } finally {
    isLoading = false;
    loader.style.display = 'none';
    loadMoreBtn.disabled = false;
  }
}

function displayContent(content) {
  if (currentPage === 1) {
    main.innerHTML = '';
  }
  
  if (content.length === 0 && currentPage === 1) {
    main.innerHTML = '<div class="no-results">No movies or series found. Try a different search.</div>';
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  content.forEach(item => {
    const isSeries = currentCategory.includes('series');
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
      <img src="${item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
        class="movie-poster" 
        alt="${isSeries ? item.name : item.title}"
        loading="lazy">
      <div class="movie-info">
        <h3 class="movie-title">${isSeries ? item.name : item.title}</h3>
        <p class="movie-rating">${item.vote_average?.toFixed(1) || 'N/A'}</p>
      </div>
      <div class="movie-overlay">
        <p class="movie-overview">${item.overview || 'No overview available.'}</p>
        <button class="view-details" data-id="${item.id}" data-type="${isSeries ? 'tv' : 'movie'}">
          View Details <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    main.appendChild(card);
  });
  
  loadMoreBtn.style.display = content.length > 0 ? 'flex' : 'none';
}

async function loadMoreContent() {
  if (isLoading) return;
  
  currentPage++;
  const content = await fetchContent(currentPage, currentSearchQuery, currentCategory);
  
  if (content.length === 0) {
    showToast('No more content to load');
    loadMoreBtn.style.display = 'none';
    return;
  }
  
  displayContent(content);
}

// Handle search
async function handleSearch(e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  
  if (query === currentSearchQuery) return;
  
  currentSearchQuery = query;
  currentPage = 1;
  
  const content = await fetchContent(currentPage, query, currentCategory);
  displayContent(content);
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
    
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    e.target.classList.add('active');
    
    currentCategory = category;
    currentSearchQuery = '';
    currentPage = 1;
    searchInput.value = '';
    
    const content = await fetchContent(currentPage, '', currentCategory);
    displayContent(content);
  };
}

// Add event listeners to nav links
navLinks.forEach(link => {
  const category = link.getAttribute('data-category');
  link.addEventListener('click', handleCategoryChange(category));
});

searchForm.addEventListener('submit', handleSearch);

// Initial load
fetchContent(currentPage).then(content => {
  displayContent(content);
  document.querySelector('.main-nav a[data-category="popular-movies"]').classList.add('active');
});

// Load more on click
loadMoreBtn.addEventListener('click', loadMoreContent);

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

// Show toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-message';
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

// Handle click events for details
document.addEventListener('click', async (e) => {
  if (e.target.closest('.view-details')) {
    const button = e.target.closest('.view-details');
    const contentId = button.dataset.id;
    const contentType = button.dataset.type;
    await showContentDetails(contentId, contentType);
  }
});

async function showContentDetails(contentId, contentType) {
  try {
    loader.style.display = 'block';
    
    const detailsUrl = `https://api.themoviedb.org/3/${contentType}/${contentId}?api_key=${API_KEY}&append_to_response=credits,videos`;
    const res = await fetch(detailsUrl);
    
    if (!res.ok) throw new Error(`Failed to fetch ${contentType === 'tv' ? 'series' : 'movie'} details`);
    const contentDetails = await res.json();
    
    displayContentDetailsModal(contentDetails, contentType);
  } catch (error) {
    console.error("Error:", error);
    showErrorToast(`Failed to load ${contentType === 'tv' ? 'series' : 'movie'} details. Please try again.`);
  } finally {
    loader.style.display = 'none';
  }
}

function displayContentDetailsModal(content, contentType) {
  const isSeries = contentType === 'tv';
  const modal = document.createElement('div');
  modal.className = 'movie-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal">&times;</button>
      <div class="modal-header" style="background-image: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7), 
        url(${content.backdrop_path ? `https://image.tmdb.org/t/p/w1280${content.backdrop_path}` : 'https://via.placeholder.com/1280x720?text=No+Backdrop'});">
        <div class="header-content">
          <img src="${content.poster_path ? `https://image.tmdb.org/t/p/w500${content.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}" 
               class="modal-poster" 
               alt="${isSeries ? content.name : content.title}">
          <div class="header-info">
            <h2>${isSeries ? content.name : content.title} <span>(${isSeries ? content.first_air_date?.substring(0, 4) : content.release_date?.substring(0, 4) || 'N/A'})</span></h2>
            <div class="meta-info">
              <span>${isSeries ? `${content.number_of_seasons || 'N/A'} Season${content.number_of_seasons > 1 ? 's' : ''}` : content.runtime ? `${Math.floor(content.runtime/60)}h ${content.runtime%60}m` : 'N/A'}</span>
              <span>•</span>
              <span>${content.genres?.map(g => g.name).join(', ') || 'N/A'}</span>
              <span>•</span>
              <span>${content.vote_average?.toFixed(1) || 'N/A'}/10</span>
            </div>
            <h3>Overview</h3>
            <p>${content.overview || 'No overview available.'}</p>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <section class="cast-section">
          <h3>Top Cast</h3>
          <div class="cast-scroller">
            ${content.credits?.cast.slice(0, 10).map(actor => `
              <div class="cast-member">
                <img src="${actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : 'https://via.placeholder.com/200x300?text=No+Image'}" 
                     alt="${actor.name}">
                <p class="actor-name">${actor.name}</p>
                <p class="character">${actor.character}</p>
              </div>
            `).join('') || '<p>No cast information available</p>'}
          </div>
        </section>
        
        ${content.videos?.results.length > 0 ? `
        <section class="videos-section">
          <h3>Videos</h3>
          <div class="video-container">
            <iframe width="560" height="315" 
                    src="https://www.youtube.com/embed/${content.videos.results[0].key}" 
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
  document.body.style.overflow = 'hidden';
  
  modal.querySelector('.close-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
      document.body.style.overflow = 'auto';
    }
  });
}

// Sticky header shadow effect
window.addEventListener('scroll', () => {
  const topnav = document.querySelector('.topnav');
  if (window.scrollY > 0) {
    topnav.classList.add('scrolled');
  } else {
    topnav.classList.remove('scrolled');
  }
});
