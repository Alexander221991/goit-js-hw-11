import axios from 'axios';
import Notiflix from 'notiflix';

export async function requestPixabay(name, page = 1) {
	Notiflix.Loading.standard();

	const BASE_URL = 'https://pixabay.com/api/';
	const API_KEY = '40978174-ffe177c23d6ae125947cd54e5';

	const params = new URLSearchParams({
		key: API_KEY,
		q: name,
		image_type: 'photo',
		orientation: 'horizontal',
		safesearch: true,
		page: page,
		per_page: 40,
	});

	const response = await axios.get(`${BASE_URL}`, { params });

	Notiflix.Loading.remove();

	return response;
}
