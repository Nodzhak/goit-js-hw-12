import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

const loader = document.querySelector('.loader');
const searchFormElement = document.querySelector('.form');
const galleryContainerElement = document.querySelector('.gallery');
const loadMoreButtonElement = document.querySelector('.load-more');
let galleryLightbox;

const fetchData = async searchParams => {
  const response = await axios.get('https://pixabay.com/api/', {
    params: searchParams,
  });
  return response;
};

const handleFetchData = async (searchParams) => {
  try {
    const response = await fetchData(searchParams);
    const totalPages = Math.ceil(response.data.totalHits / 40);

    if (searchParams.page === totalPages) {
      iziToast.error({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
      loadMoreButtonElement.style.display = 'none';
      loader.style.display = 'none';
    }

    const json = response.data;
    const galleryMarkup = generateGalleryHTML(json.hits);

    if (galleryMarkup.length < 1) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      loader.style.display = 'none';
    } else {
      galleryContainerElement.insertAdjacentHTML('beforeend', galleryMarkup);

      if (searchParams.page < Math.ceil(json.totalHits / 40)) {
        loadMoreButtonElement.style.display = 'block';
      }

      loader.style.display = 'none';

      if (galleryLightbox) {
        galleryLightbox.refresh();
      }

      if (searchParams.page > 1) {
        window.scrollBy({
          top: 2 * document.querySelector('.gallery-item').getBoundingClientRect().height,
          behavior: 'smooth',
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

let searchParams = {
  key: '41631198-f5cd04d694ed896bf4215baa6',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  page: 1,
  per_page: 40,
};

const handleSubmitForm = event => {
  event.preventDefault();
  loadMoreButtonElement.style.display = 'none';
  if (galleryContainerElement.children.length > 0) galleryContainerElement.innerHTML = '';
  loader.style.display = 'inline-block';
  const searchQueryValue = searchFormElement.searchQuery.value;

  if (searchQueryValue.includes(' ')) {
    iziToast.error({
      message: 'Search query cannot contain spaces. Please try again!',
      position: 'topRight',
    });
    loader.style.display = 'none';
    return;
  }

  searchParams.q = searchQueryValue;
  searchParams.page = 1;
  searchFormElement.reset();
  handleFetchData(searchParams);
};

const handleNextElements = () => {
  loader.style.display = 'inline-block';
  searchParams.page++;
  handleFetchData(searchParams);
};

searchFormElement.addEventListener('submit', handleSubmitForm);
loadMoreButtonElement.addEventListener('click', handleNextElements);

function generateGalleryHTML(hits) {
  return hits.reduce((html, hit) => {
    const { largeImageURL, webformatURL, tags, likes, views, comments, downloads } = hit;
    return (
      html +
      `<li class="gallery-item">
        <a href="${largeImageURL}"> 
          <img class="gallery-img" src="${webformatURL}" alt="${tags}" />
        </a>
        <div class="gallery-text-box">
          <p>Likes: <span class="text-value">${likes}</span></p>
          <p>Views: <span class="text-value">${views}</span></p>
          <p>Comments: <span class="text-value">${comments}</span></p>
          <p>Downloads: <span class="text-value">${downloads}</span></p>
        </div>
      </li>`
    );
  }, '');
}

document.addEventListener('DOMContentLoaded', () => {
  galleryLightbox = new SimpleLightbox('.gallery a');
});


