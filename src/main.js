import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

const loaderElement = document.querySelector('.loader');
const searchForm = document.querySelector('.form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
let gallery;

const fetchCart = async searchParamsDefaults => {
  const response = await axios.get(`https://pixabay.com/api/`, {
    params: searchParamsDefaults,
  });
  return response;
};

const thenCatch = searchParamsDefaults => {
  fetchCart(searchParamsDefaults)
    .then(response => {
      if (searchParamsDefaults.page === Math.ceil(response.data.totalHits / 40)) {
        iziToast.error({
          message: "We're sorry, but you've reached the end of search results.",
          position: 'center',
        });
        loadMoreButton.style.display = 'none';
        loaderElement.style.display = 'none';
      }
      return response.data;
    })
    .then(json => {
      const marcup = generateGalleryHTML(json.hits);
      if (marcup.length < 1) {
        iziToast.error({
          message: 'Sorry, there are no images matching your search query. Please try again!',
          position: 'center',
        });
        loaderElement.style.display = 'none';
      } else {
        galleryContainer.insertAdjacentHTML('beforeend', marcup);
        if (searchParamsDefaults.page < Math.ceil(json.totalHits / 40)) {
          loadMoreButton.style.display = 'block';
        }

        loaderElement.style.display = 'none';
        if (gallery) {
          gallery.refresh();
        }
        if (searchParamsDefaults.page > 1) {
          window.scrollBy({
            top: 2 * document.querySelector('.gallery-item').getBoundingClientRect().height,
            behavior: 'smooth',
          });
        }
      }
    })
    .catch(err => {
      console.log(err);
    });
};

let searchParamsDefaults = {
  key: '41631198-f5cd04d694ed896bf4215baa6',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
  page: 1,
  per_page: 40,
};

const formSubmit = event => {
  event.preventDefault();
  loadMoreButton.style.display = 'none';
  if (galleryContainer.children.length > 0) galleryContainer.innerHTML = '';
  loaderElement.style.display = 'inline-block';
  searchParamsDefaults.q = searchForm.searchQuery.value;
  searchParamsDefaults.page = 1;
  searchForm.reset();
  thenCatch(searchParamsDefaults);
};

const nextElements = () => {
  loaderElement.style.display = 'inline-block';
  searchParamsDefaults.page++;
  thenCatch(searchParamsDefaults);
};

searchForm.addEventListener('submit', formSubmit);
loadMoreButton.addEventListener('click', nextElements);

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
  gallery = new SimpleLightbox('.gallery a');
});