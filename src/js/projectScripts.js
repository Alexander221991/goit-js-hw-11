import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import { createMarkup } from './marcup.js';
import { requestPixabay } from './pixabay.js';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
	form: document.querySelector('.search-form'),
	input: document.querySelector('.search-input'),
	gallery: document.querySelector('.gallery'),
	targetBox: document.querySelector('.observe-box'),
};

let page = 1;
let searchItem = '';
let totalResult = 0;

let lightbox = new SimpleLightbox('.gallery-link', {
	captionDelay: 250,
	captionsData: 'alt',
});

let options = {
	root: null,
	rootMargin: '300px',
	threshold: 1.0,
};

let observer = new IntersectionObserver(onLoad, options);

function onLoad(entries, observer) {
	entries.forEach(entry => {
		if (entry.isIntersecting && page < Math.ceil(totalResult / 40)) {
			requestPixabay(searchItem, (page += 1)).then(
				({ data: { hits: arrayCards } }) => {
					const markup = createMarkup(arrayCards);
					refs.gallery.insertAdjacentHTML('beforeend', markup);

					lightbox.refresh();
				}
			);
		} else if (entry.isIntersecting && page >= Math.ceil(totalResult / 40)) {
			observer.unobserve(refs.targetBox);
			Notiflix.Notify.info(
				"We're sorry, but you've reached the end of search results."
			);
		}
	});
}

function onSubmit(e) {
	e.preventDefault();
	page = 1;

	refs.gallery.innerHTML = '';

	observer.unobserve(refs.targetBox);

	searchItem = refs.input.value;

	if (!searchItem) {
		Notiflix.Notify.failure(`You have to write something in the search`);
		return;
	}

	requestPixabay(searchItem, page)
		.then(({ data: { hits: arrayCards, totalHits: totalCards } }) => {
			if (arrayCards.length === 0) {
				throw new Error();
			}

			const markup = createMarkup(arrayCards);
			refs.gallery.insertAdjacentHTML('beforeend', markup);

			Notiflix.Notify.success(`Hooray! We found ${totalCards} images.`);

			lightbox.refresh();

			observer.observe(refs.targetBox);

			totalResult = totalCards;
		})

		.catch(() =>
			Notiflix.Notify.failure(
				'Sorry, there are no images matching your search query. Please try again.'
			)
		);

	refs.form.reset();
}
refs.form.addEventListener('submit', onSubmit);

window.addEventListener('scroll', () => {
	if (window.scrollY > 100 && !(document.activeElement === refs.input)) {
		refs.form.style.opacity = '0.8';
	} else {
		refs.form.style.opacity = '1';
	}
});
refs.input.addEventListener('focus', () => {
	refs.form.style.opacity = '1';
});
