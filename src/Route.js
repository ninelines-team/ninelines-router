import pathToRegexp from 'path-to-regexp';
import URL from 'url-parse';
import {EventEmitter} from './EventEmitter';

export class Route extends EventEmitter {
	/**
	 * @param {string} path
	 * @param {string} [name]
	 * @param {Object} [options]
	 */
	constructor(path, name, options) {
		super();

		this.path = path;
		this.name = name;
		this.paramsInfo = [];
		this.regexp = pathToRegexp(path, this.paramsInfo, options);
		this.compiled = pathToRegexp.compile(path);

		this.handlers = {
			beforeEnter: [],
			enter: [],
			leave: [],
		};
	}

	/**
	 * @param {string} path
	 * @returns {Object|boolean}
	 */
	execPath(path) {
		let match = this.regexp.exec(path);

		if (!match) {
			return false;
		}

		let params = {};

		this.paramsInfo.forEach((paramInfo, index) => {
			params[paramInfo.name] = match[index + 1];
		});

		return params;
	}

	/**
	 * @param {Object} params
	 * @param {Object} [query]
	 * @param {string} [hash]
	 * @returns {string}
	 */
	generatePath(params, query, hash) {
		let path = this.compiled(params);
		let url = new URL(path, true);

		if (query) {
			Object.keys(query).forEach((key) => {
				url.query[key] = query[key];
			});
		}

		if (hash) {
			if (!hash.startsWith('#')) {
				hash = `#${hash}`;
			}

			url.hash = hash;
		}

		return url.toString().replace(url.origin, '');
	}
}
