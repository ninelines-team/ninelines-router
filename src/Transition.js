import {EventEmitter} from './EventEmitter';

export class Transition extends EventEmitter {
	/**
	 * @param {Route|string} from
	 * @param {Route|string} to
	 * @param {Function} onStart?
	 * @param {Function} onLeave?
	 * @param {Function} onBeforeEnter?
	 * @param {Function} onEnter?
	 * @param {Function} onComplete?
	 */
	constructor({from, to, onStart, onLeave, onBeforeEnter, onEnter, onComplete} = {}) {
		super();

		this.from = from;
		this.to = to;

		this.handlers = {
			start: [],
			leave: [],
			beforeEnter: [],
			enter: [],
			complete: [],
		};

		if (onStart) {
			this.on('start', onStart);
		}

		if (onLeave) {
			this.on('leave', onLeave);
		}

		if (onBeforeEnter) {
			this.on('beforeEnter', onBeforeEnter);
		}

		if (onEnter) {
			this.on('enter', onEnter);
		}

		if (onComplete) {
			this.on('complete', onComplete);
		}
	}
}
