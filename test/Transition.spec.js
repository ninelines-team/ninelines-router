import {expect} from 'chai';
import {Transition} from '../src/Transition';

describe('Transition', () => {
	describe('#constructor', () => {
		it('should initialize transition', () => {
			let onStart = () => {};
			let onLeave = () => {};
			let onBeforeEnter = () => {};
			let onEnter = () => {};
			let onComplete = () => {};

			let transition = new Transition({
				from: 'index',
				to: 'article',
				onStart,
				onLeave,
				onBeforeEnter,
				onEnter,
				onComplete,
			});

			expect(transition.from).to.equal('index');
			expect(transition.to).to.equal('article');
			expect(transition.handlers.start).to.include(onStart);
			expect(transition.handlers.leave).to.include(onLeave);
			expect(transition.handlers.beforeEnter).to.include(onBeforeEnter);
			expect(transition.handlers.enter).to.include(onEnter);
			expect(transition.handlers.complete).to.include(onComplete);
		});
	});
});
