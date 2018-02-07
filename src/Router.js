import URL from 'url-parse';
import {EventEmitter} from './EventEmitter';
import {Route} from './Route';
import {Transition} from './Transition';

export class Router extends EventEmitter {
	constructor() {
		super();

		this.routes = [];
		this.transitions = [];
		this.route = null;
		this.params = null;
		this.query = null;

		this.handlers = {
			notFound: [],
		};
	}

	/**
	 * @param {string|Route|{path, name, onBeforeEnter, onEnter, onLeave}} path
	 * @param {string|Function|{name, onBeforeEnter, onEnter, onLeave}} [name]
	 * @param {Function|{onBeforeEnter, onEnter, onLeave}} [onBeforeEnter]
	 * @param {Function} [onEnter]
	 * @param {Function} [onLeave]
	 * @returns {Route}
	 */
	addRoute(path, name, onBeforeEnter, onEnter, onLeave) {
		let route;

		if (typeof path === 'string') {
			route = this.routes.find((route) => route.path === path);

			if (!route) {
				if (typeof name === 'object') {
					let options = name;

					return this.addRoute(path, options.name, options.onBeforeEnter, options.onEnter, options.onLeave);
				}

				if (typeof name === 'string') {
					route = new Route(path, name);
				} else {
					route = new Route(path);
				}

				this.routes.push(route);
			}
		} else if (path instanceof Route) {
			route = this.routes.find((route) => route.path === path.path);

			if (!route) {
				route = path;
				this.routes.push(route);
			}
		} else if (typeof path === 'object') {
			let options = path;

			return this.addRoute(options.path, options.name, options.onBeforeEnter, options.onEnter, options.onLeave);
		} else {
			throw new Error('Параметр path должен иметь тип string|Route|Object');
		}

		if (typeof name === 'object') {
			let options = name;

			return this.addRoute(path, options.name, options.onBeforeEnter, options.onEnter, options.onLeave);
		}

		if (typeof onBeforeEnter === 'object') {
			let options = onBeforeEnter;

			return this.addRoute(path, name, options.onBeforeEnter, options.onEnter, options.onLeave);
		}

		if (arguments.length === 2) {
			if (typeof name === 'function') {
				onEnter = name;
			}
		} else if (arguments.length === 3) {
			if (typeof name === 'function') {
				onEnter = name;
				onLeave = onBeforeEnter;
				onBeforeEnter = null;
			} else {
				onEnter = onBeforeEnter;
				onBeforeEnter = null;
			}
		} else if (arguments.length === 4) {
			if (typeof name === 'function') {
				onLeave = onEnter;
				onEnter = onBeforeEnter;
				onBeforeEnter = name;
			} else {
				onLeave = onEnter;
				onEnter = onBeforeEnter;
				onBeforeEnter = null;
			}
		}

		if (onBeforeEnter) {
			route.on('beforeEnter', onBeforeEnter);
		}

		if (onEnter) {
			route.on('enter', onEnter);
		}

		if (onLeave) {
			route.on('leave', onLeave);
		}

		return route;
	}

	/**
	 * @param {string} pathOrName
	 * @returns {Route|null}
	 */
	getRoute(pathOrName) {
		if (pathOrName) {
			return this.routes.find((route) => route.name === pathOrName || route.path === pathOrName) || null;
		}

		return null;
	}

	/**
	 * @param {string|Route|Transition|{from, to, onStart, onLeave, onBeforeEnter, onEnter, onComplete}} from
	 * @param {string|Route|Function|{onStart, onLeave, onBeforeEnter, onEnter, onComplete}} [to]
	 * @param {Function|{onStart, onLeave, onBeforeEnter, onEnter, onComplete}} [onStart]
	 * @param {Function} [onLeave]
	 * @param {Function} [onBeforeEnter]
	 * @param {Function} [onEnter]
	 * @param {Function} [onComplete]
	 * @returns {Transition}
	 */
	addTransition(from, to, onStart, onLeave, onBeforeEnter, onEnter, onComplete) {
		let transition;

		if (typeof from === 'string') {
			let route = this.routes.find((route) => route.name === from);

			if (route) {
				from = route;
			} else {
				from = this.addRoute(from);
			}
		} else if (from instanceof Route) {
			from = this.addRoute(from);
		} else if (from instanceof Transition) {
			transition = this.transitions.find((transition) => (
				transition.from.path === from.from.path &&
				transition.to.path === from.to.path
			));

			if (!transition) {
				transition = from;
				this.transitions.push(transition);
			}
		} else if (typeof from === 'object') {
			let options = from;

			return this.addTransition(
				options.from,
				options.to,
				options.onStart,
				options.onLeave,
				options.onBeforeEnter,
				options.onEnter,
				options.onComplete
			);
		} else {
			throw new Error('Параметр from должен иметь тип string|Route|Transition|Object');
		}

		if (from instanceof Route && (typeof to === 'string' || to instanceof Route)) {
			if (typeof to === 'string') {
				let route = this.routes.find((route) => route.name === to);

				if (route) {
					to = route;
				} else {
					to = this.addRoute(to);
				}
			} else {
				to = this.addRoute(to);
			}

			transition = this.transitions.find((transition) => (
				transition.from.path === from.path &&
				transition.to.path === to.path
			));

			if (!transition) {
				transition = new Transition(from, to);
				this.transitions.push(transition);
			}
		} else if (from instanceof Transition && typeof to === 'object' && !(to instanceof Transition)) {
			let options = to;

			return this.addTransition(
				from,
				options.onStart,
				options.onLeave,
				options.onBeforeEnter,
				options.onEnter,
				options.onComplete
			);
		} else if (!(from instanceof Transition && typeof to === 'function')) {
			throw new Error('Параметр to должен иметь тип string|Route|Object|Function');
		}

		if (typeof onStart === 'object') {
			let options = onStart;

			return this.addTransition(
				from,
				to,
				options.onStart,
				options.onLeave,
				options.onBeforeEnter,
				options.onEnter,
				options.onComplete
			);
		}

		if (from instanceof Transition) {
			if (arguments.length === 2) {
				onEnter = to;
			} else if (arguments.length === 3) {
				onLeave = to;
				onEnter = onStart;
				onStart = null;
			} else if (arguments.length === 4) {
				onEnter = onLeave;
				onLeave = to;
				onBeforeEnter = onStart;
				onStart = null;
			} else if (arguments.length === 5) {
				onEnter = onLeave;
				onLeave = to;
				onComplete = onBeforeEnter;
				onBeforeEnter = onStart;
				onStart = null;
			} else {
				onComplete = onEnter;
				onEnter = onBeforeEnter;
				onBeforeEnter = onLeave;
				onLeave = onStart;
				onStart = to;
			}
		} else {
			// from, to, onStart, onLeave, onBeforeEnter, onEnter, onComplete

			if (arguments.length === 3) {
				onEnter = onStart;
				onStart = null;
			} else if (arguments.length === 4) {
				onEnter = onLeave;
				onLeave = onStart;
				onStart = null;
			} else if (arguments.length === 5) {
				onEnter = onBeforeEnter;
				onBeforeEnter = onLeave;
				onLeave = onStart;
				onStart = null;
			} else if (arguments.length === 6) {
				onComplete = onEnter;
				onEnter = onBeforeEnter;
				onBeforeEnter = onLeave;
				onLeave = onStart;
				onStart = null;
			}
		}

		if (onStart) {
			transition.on('start', onStart);
		}

		if (onLeave) {
			transition.on('leave', onLeave);
		}

		if (onBeforeEnter) {
			transition.on('beforeEnter', onBeforeEnter);
		}

		if (onEnter) {
			transition.on('enter', onEnter);
		}

		if (onComplete) {
			transition.on('complete', onComplete);
		}

		return transition;
	}

	/**
	 * @param {string} path
	 * @param {string} [method]
	 */
	resolve(path, method = 'push') {
		let url = new URL(path, true);
		let routeFound = false;

		for (let route of this.routes) {
			let params = route.execPath(url.pathname);

			if (params) {
				routeFound = true;

				let prevState = {
					route: this.route,
					params: this.params,
					query: this.query,
				};

				let nextState = {
					route,
					params,
					query: url.query,
				};

				let transition = this.transitions.find((transition) => (
					transition.from === this.route &&
					transition.to === route
				));

				if (transition) {
					transition.trigger('start', [prevState, nextState])
						.then(Promise.all([
							() => transition.trigger('leave', [prevState, nextState]),
							() => Promise.resolve(this.route ? this.route.trigger('leave', [prevState, nextState]) : null),
						]))
						.then(Promise.all([
							() => transition.trigger('beforeEnter', [prevState, nextState]),
							() => route.trigger('beforeEnter', [prevState, nextState]),
						]))
						.then(() => {
							this.route = route;
							this.query = url.query;
							this.params = params;

							if (method === 'push' || method === 'replace') {
								history[`${method}State`](null, '', path);
							}
						})
						.then(Promise.all([
							() => transition.trigger('enter', [prevState, nextState]),
							() => route.trigger('enter', [prevState, nextState]),
						]))
						.then(() => transition.trigger('complete', [prevState, nextState]));
				} else {
					Promise.resolve(this.route ? this.route.trigger('leave', [prevState, nextState]) : null)
						.then(() => route.trigger('beforeEnter', [prevState, nextState]))
						.then(() => {
							this.route = route;
							this.params = params;
							this.query = url.query;

							if (method === 'push' || method === 'replace') {
								history[`${method}State`](null, '', path);
							}
						})
						.then(() => route.trigger('enter', [prevState, nextState]));
				}
			}
		}

		if (!routeFound) {
			this.trigger('notFound', [path, url.query]);
		}
	}

	/**
	 * @param {string|Route|{path, params, query, hash, method}} path
	 * @param {Object} [params]
	 * @param {Object} [query]
	 * @param {string} [hash]
	 * @param {string} [method]
	 */
	navigate(path, params, query, hash, method = 'push') {
		let route;

		if (!(path instanceof Route)) {
			if (typeof path === 'object') {
				let options = path;

				return this.navigate(
					options.path,
					options.params,
					options.query,
					options.hash,
					typeof options.method !== 'undefined' ? options.method : 'push'
				);
			} else if (typeof path !== 'string') {
				throw new Error('Параметр path должен иметь тип string|Route|Object');
			}
		}

		if (path instanceof Route) {
			route = path;
		} else if (typeof path === 'string') {
			route = this.routes.find((route) => route.name === path);
		}

		if (arguments.length === 2) {
			if (typeof params !== 'object') {
				method = params;
				params = null;
			}
		} else if (arguments.length === 3) {
			if (typeof query !== 'object') {
				method = query;
				query = null;
			}
		} else if (arguments.length === 4) {
			if (['push', 'replace', 'none'].includes(hash)) {
				method = hash;
				hash = null;
			}
		}

		if (route) {
			path = route.generatePath(params, query, hash);
		}

		this.resolve(path, method);
	}

	bindLinks() {
		document.querySelectorAll('[data-router-link]').forEach((link) => {
			if (!link.isBound) {
				link.isBound = true;

				link.addEventListener('click', (event) => {
					event.preventDefault();
					this.navigate(link.href);
				});
			}
		});
	}

	listen() {
		window.addEventListener('popstate', () => {
			this.resolve(location.pathname + location.search + location.hash, 'none');
		});
	}

	start() {
		this.bindLinks();
		this.listen();
		this.resolve(location.pathname + location.search + location.hash);
	}
}
