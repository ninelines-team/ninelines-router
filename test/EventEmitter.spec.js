import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {EventEmitter} from '../src/EventEmitter';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('EventEmitter', () => {
	let eventEmitter = new EventEmitter();

	beforeEach(() => {
		eventEmitter.handlers = {};
	});

	describe('#on', () => {
		it('should add event listener', () => {
			let handler = () => {};

			eventEmitter.on('some-event', handler);

			expect(eventEmitter.handlers['some-event']).to.include(handler);
		});

		it('should return this', () => {
			expect(eventEmitter.on('some-event', () => {})).to.equal(eventEmitter);
		});
	});

	describe('#off', () => {
		it('should remove event listener', () => {
			let handlerOne = () => {};
			let handlerTwo = () => {};

			eventEmitter.on('some-event', handlerOne);
			eventEmitter.on('some-event', handlerTwo);
			eventEmitter.off('some-event', handlerTwo);

			expect(eventEmitter.handlers['some-event']).to.include(handlerOne).and.not.include(handlerTwo);
		});

		it('should not remove event listener', () => {
			let handlerOne = () => {};
			let handlerTwo = () => {};

			eventEmitter.on('some-event', handlerOne);
			eventEmitter.off('some-event', handlerTwo);

			expect(eventEmitter.handlers['some-event']).to.include(handlerOne)
		});

		it('should remove all event listeners', () => {
			let handlerOne = () => {};
			let handlerTwo = () => {};

			eventEmitter.on('some-event', handlerOne);
			eventEmitter.on('some-event', handlerTwo);
			eventEmitter.off('some-event');

			expect(eventEmitter.handlers['some-event']).to.be.empty;
		});

		it('should return this', () => {
			expect(eventEmitter.off('some-event')).to.equal(eventEmitter);
		});
	});

	describe('#trigger', () => {
		it('should trigger event listener', async () => {
			let handler = sinon.spy();

			eventEmitter.on('some-event', handler);
			await eventEmitter.trigger('some-event');

			expect(handler).to.be.calledOnce;
		});

		it('should not trigger event listener', async () => {
			let handler = sinon.spy();

			eventEmitter.on('some-event', handler);
			await eventEmitter.trigger('another-event');

			expect(handler).to.be.not.called;
		});

		it('should trigger event listener with params', async () => {
			let handler = sinon.spy();

			eventEmitter.on('some-event', handler);
			await eventEmitter.trigger('some-event', [1, 2, 3]);

			expect(handler).to.be.calledWithExactly(1, 2, 3);
		});

		it('should trigger event listener in context', async () => {
			let handler = sinon.spy();
			let context = {};

			eventEmitter.on('some-event', handler);
			await eventEmitter.trigger('some-event', [], context);

			expect(handler).to.be.calledOn(context);
		});

		it('should return promise', () => {
			expect(eventEmitter.trigger('some-event')).to.be.an.instanceOf(Promise);
		});

		it('should trigger event listener that return false', () => {
			eventEmitter.on('some-event', () => {
				return false;
			});

			return expect(eventEmitter.trigger('some-event')).to.be.rejected;
		});

		it('should trigger event listener that return rejected promise', () => {
			eventEmitter.on('some-event', () => {
				return Promise.reject();
			});

			return expect(eventEmitter.trigger('some-event')).to.be.rejected;
		});
	});
});
