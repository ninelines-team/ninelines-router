import {EventEmitter} from './EventEmitter';

export class Transition extends EventEmitter {
	/**
	 * @param {Route} from
	 * @param {Route} to
	 */
	constructor(from, to) {
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
	}
}
