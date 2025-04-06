const API_KEY = '81c0741f'; // Replace with your OMDb API key
const APILINK = `https://www.omdbapi.com/?s=movie&type=movie&apikey=${API_KEY}`;

const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const loader = document.getElementById("loader");

function showLoader() {
    loader.style.display = 'block';
    main.style.display = 'none';
}

function hideLoader() {
    loader.style.display = 'none';
    main.style.display = 'block';
}

function displayMovies(movies) {
    main.innerHTML = "";
    const div_row = document.createElement('div');
    div_row.setAttribute('class', 'row');

    if (!movies || movies.length === 0) {
        main.innerHTML = "<p style='color:white;'>No movies found.</p>";
        return;
    }

    movies.forEach(movie => {
        const div_column = document.createElement('div');
        div_column.setAttribute('class', 'column');

        const div_card = document.createElement('div');
        div_card.setAttribute('class', 'card');

        const image = document.createElement('img');
        image.setAttribute('class', 'thumbnail');
        
        const title = document.createElement('h3');
        title.setAttribute('id', 'title');

        const center = document.createElement('center');

        title.innerText = movie.Title || "No Title";
        image.src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x350?text=No+Image";
        image.alt = title.innerText;

        center.appendChild(image);
        div_card.appendChild(center);
        div_card.appendChild(title);
        div_column.appendChild(div_card);
        div_row.appendChild(div_column);
    });

    main.appendChild(div_row);
}

function fetchMovies(url) {
    showLoader();
    fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log("OMDb API Response:", data);
        if (data.Response === "True") {
            displayMovies(data.Search || []);
        } else {
            main.innerHTML = `<p style='color:white;'>${data.Error || 'No movies found'}</p>`;
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        main.innerHTML = `<p style='color:white;'>Error loading movies. Check console.</p>`;
    })
    .finally(() => {
        hideLoader();
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchItem = search.value.trim();

    if (searchItem) {
        const SEARCHAPI = `https://www.omdbapi.com/?s=${encodeURIComponent(searchItem)}&type=movie&apikey=${API_KEY}`;
        fetchMovies(SEARCHAPI);
        search.value = "";
    }
});

// Initial Load
fetchMovies(APILINK);