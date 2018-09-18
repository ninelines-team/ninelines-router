export class EventEmitter {
	constructor() {
		this.handlers = {};
	}

	/**
	 * @param {string} eventName
	 * @param {Function} handler
	 * @returns {EventEmitter}
	 */
	on(eventName, handler) {
		if (!this.handlers[eventName]) {
			this.handlers[eventName] = [];
		}

		if (handler) {
			this.handlers[eventName].push(handler);
		}

		return this;
	}

	/**
	 * @param {string} eventName
	 * @param {Function} handler?
	 * @returns {EventEmitter}
	 */
	off(eventName, handler = null) {
		if (handler) {
			let index = this.handlers[eventName].indexOf(handler);

			if (index !== -1) {
				this.handlers[eventName].splice(index, 1);
			}
		} else {
			this.handlers[eventName] = [];
		}

		return this;
	}

	/**
	 * @param {string} eventName
	 * @param {Array} params?
	 * @param {*} context?
	 * @returns {Promise}
	 */
	trigger(eventName, params = [], context = null) {
		if (!this.handlers[eventName]) {
			this.handlers[eventName] = [];
		}

		return Promise.all(this.handlers[eventName].map((handler) => {
			return new Promise((resolve, reject) => {
				let result = context ? handler.call(context, ...params) : handler(...params);

				if (result === false) {
					reject();
				} else {
					if (!(result instanceof Promise)) {
						console.warn(`ninelines-router: event handler should return Promise or false (event = "${eventName}")`);
					}

					Promise.resolve(result).then(resolve, reject);
				}
			});
		}));
	}
}
