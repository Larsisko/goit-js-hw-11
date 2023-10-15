import FeatchAPIService from './js/fetchAPI';
import buttonUPService from './js/btnUP';
import btnLoadService from './js/btnLoad';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { checkPosition } from './js/endlessScroll';
import { btnUpload } from './js/loadingBtn';
import throttle from 'lodash.throttle';

const refs = {
  formEl: document.querySelector('#search-form'),
  galleryEl: document.querySelector('.gallery'),
  loadBtnEl: document.querySelector('.load-more'),
  loadAnimEl: document.querySelector('.load-more__anim'),
};

const featchAPI = new FeatchAPIService();
const buttonUP = new buttonUPService();
const buttonLoad = new btnLoadService(refs.loadBtnEl, refs.loadAnimEl);
let pressedBtnSearch = false;
let isLoading = false;

buttonUP.addEventListener();

refs.formEl.addEventListener('submit', onSearch);

const lightbox = new SimpleLightbox('.gallery a');

function onSearch(e) {
  e.preventDefault();

  if (btnUpload === 'endlessBtn') {
    refs.loadBtnEl.removeEventListener('click', onLoad);
    window.addEventListener('scroll', throttle(infinityScroll, 250));
    buttonLoad.disabled();
    buttonLoad.hide();
  } else if (btnUpload === 'loadMoreBtn') {
    window.removeEventListener('scroll', infinityScroll);
    refs.loadBtnEl.addEventListener('click', onLoad);
  }

  featchAPI.query = e.currentTarget.elements.searchQuery.value.trim();

  if (featchAPI.query.length === 0) {
    Notify.failure("We're sorry, but you want to find nothing");
    return;
  }

  featchAPI.endCollection = false;
  featchAPI.initialPage();
  refs.galleryEl.innerHTML = '';

  if (btnUpload === 'loadMoreBtn') {
    buttonLoad.show();
    buttonLoad.disabled();
  }

  featchAPI
    .fetchArticles()
    .then(photos => {
      if (photos.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      Notify.success(`Hooray! We found ${featchAPI.total} images.`);

      if (btnUpload === 'loadMoreBtn') {
        buttonLoad.hide();
      }

      refs.galleryEl.insertAdjacentHTML('beforeend', renderPhotos(photos));

      if (btnUpload === 'loadMoreBtn') {
        checkCollection();
        buttonLoad.enabled();
      }

      lightbox.refresh();
      pressedBtnSearch = true;
      isLoading = false;
    })
    .catch(error => {
      Notify.failure(error.message);
    });
}

function onLoad() {
  if (btnUpload === 'loadMoreBtn') {
    buttonLoad.show();
    buttonLoad.disabled();
  }
  if (!pressedBtnSearch || isLoading) return;

  isLoading = true;

  featchAPI
    .fetchArticles()
    .then(photos => {
      if (btnUpload === 'loadMoreBtn') {
        buttonLoad.hide();
      }

      refs.galleryEl.insertAdjacentHTML('beforeend', renderPhotos(photos));

      if (featchAPI.endCollection) {
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      scrollGallery();

      if (btnUpload === 'loadMoreBtn') {
        checkCollection();
        buttonLoad.enabled();
      }

      lightbox.refresh();
      isLoading = false;
    })
    .catch(error => {
      Notify.failure(error.message);
    });
}

function checkCollection() {
  if (featchAPI.endCollection) {
    buttonLoad.hide();
  } else if (!featchAPI.endCollection) {
    buttonLoad.show();
  }
}

function renderPhotos(photos) {
  return photos
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
        <a href="${largeImageURL}"> <img src="${webformatURL}" alt="${tags}" loading="lazy" class="photo-card__img"/></a>
      <div class="photo-card__info">
        <div><p class="info-item">
          <b class="info-item__name">Likes</b>
          <b class="info-item__value">${likes}</b>
        </p>
        <p class="info-item">
          <b class="info-item__name">Views</b>
          <b class="info-item__value">${views}</b>
        </p></div>
        <div><p class="info-item">
          <b class="info-item__name">Comments</b>
          <b class="info-item__value">${comments}</b>
        </p>
        <p class="info-item">
          <b class="info-item__name">Downloads</b>
          <b class="info-item__value">${downloads}</b>
        </p></div>
      </div>
    </div>`;
      }
    )
    .join('');
}
function infinityScroll() {
  checkPosition(onLoad);
}
function scrollGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.5,
    behavior: 'smooth',
  });
}
