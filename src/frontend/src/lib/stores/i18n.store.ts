import en from '$lib/i18n/en.json';

import { getLocalStorageLang, setLocalStorageItem } from '$lib/utils/local-storage.utils';
import { writable, type Readable } from 'svelte/store';

const loadI18nFile = async (lang: Languages): Promise<I18n> => {
	return {
		lang: lang,
		...(await import(`../i18n/`+ lang +`.json`))
	};
};

const enI18n = (): I18n => {
	return {
		lang: 'en',
		...en
	} as I18n;
};

const loadLanguage = (lang: Languages): Promise<I18n> => {
	switch (lang) {
		case 'en':
			return Promise.resolve(enI18n());
		default:
			return loadI18nFile(lang);
	}
};

const switchLanguage = (lang: Languages) => setLocalStorageItem({ key: 'lang', value: lang });

export interface I18nStore extends Readable<I18n> {
	init: () => Promise<void>;
	switchLang: (lang: Languages) => Promise<void>;
}

const initI18n = (): I18nStore => {
	const { subscribe, set } = writable<I18n>({
		lang: 'en',
		...en
	});

	return {
		subscribe,

		init: async () => {
			const lang: Languages = getLocalStorageLang();

			if (lang === 'en') {
				switchLanguage(lang);
				// No need to reload the store, English is already the default
				return;
			}

			const bundle: I18n = await loadLanguage(lang);
			set(bundle);

			switchLanguage(lang);
		},

		switchLang: async (lang: Languages) => {
			const bundle: I18n = await loadLanguage(lang);
			set(bundle);

			switchLanguage(lang);
		}
	};
};

export const i18n = initI18n();
