import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Route} from '../src/Route';
import {Transition} from '../src/Transition';
import {Router} from '../src/Router';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('Router', () => {
	describe('#constructor', () => {
		it('should initialize router', () => {
			let onStart = () => {};
			let onLeave = () => {};
			let onBeforeEnter = () => {};
			let onEnter = () => {};
			let onComplete = () => {};
			let onNotFound = () => {};

			let router = new Router({
				onStart,
				onLeave,
				onBeforeEnter,
				onEnter,
				onComplete,
				onNotFound,
			});

			expect(router.handlers.start).to.include(onStart);
			expect(router.handlers.leave).to.include(onLeave);
			expect(router.handlers.beforeEnter).to.include(onBeforeEnter);
			expect(router.handlers.enter).to.include(onEnter);
			expect(router.handlers.complete).to.include(onComplete);
			expect(router.handlers.notFound).to.include(onNotFound);
		});
	});

	describe('#addRoute', () => {
		let router = new Router();

		beforeEach(() => {
			router.routes = [];
		});

		it('should add route using options', () => {
			let route = router.addRoute({
				path: '/',
			});

			expect(router.routes).to.include(route);
		});

		it('should add route using route', () => {
			let route = new Route({
				path: '/',
			});

			router.addRoute(route);

			expect(router.routes).to.include(route);
		});

		it('should not add existing route (by route)', () => {
			let route = new Route({
				path: '/',
			});

			router.addRoute(route);
			router.addRoute(route);

			expect(router.routes).to.have.lengthOf(1);
		});

		it('should not add existing route (by path)', () => {
			router.addRoute({
				path: '/',
			});

			router.addRoute({
				path: '/',
			});

			expect(router.routes).to.have.lengthOf(1);
		});

		it('should not add existing route (by name)', () => {
			router.addRoute({
				path: '/',
				name: 'index',
			});

			router.addRoute({
				path: '/index',
				name: 'index',
			});

			expect(router.routes).to.have.lengthOf(1);
		});

		it('should return null', () => {
			expect(router.addRoute(null)).to.be.null;
		});
	});

	describe('#addTransition', () => {
		let router = new Router();

		beforeEach(() => {
			router.routes = [];
			router.transitions = [];
		});

		it('should add transition using options', () => {
			let transition = router.addTransition({
				from: '/',
				to: '/about',
			});

			expect(router.transitions).to.include(transition);
		});

		it('should add transition using transition', () => {
			let transition = new Transition({
				from: '/',
				to: '/about',
			});

			router.addTransition(transition);

			expect(router.transitions).to.include(transition);
		});

		it('should add transition by route names', () => {
			let routeOne = router.addRoute({
				path: '/',
				name: 'index',
			});

			let routeTwo = router.addRoute({
				path: '/about',
				name: 'about',
			});

			let transition = router.addTransition({
				from: 'index',
				to: 'about',
			});

			expect(transition.from).to.equal(routeOne);
			expect(transition.to).to.equal(routeTwo);
		});

		it('should add transition by route paths', () => {
			let routeOne = router.addRoute({
				path: '/',
			});

			let routeTwo = router.addRoute({
				path: '/about',
			});

			let transition = router.addTransition({
				from: '/',
				to: '/about',
			});

			expect(transition.from).to.equal(routeOne);
			expect(transition.to).to.equal(routeTwo);
		});

		it('should add transition with null from', () => {
			let transition = router.addTransition({
				from: null,
				to: '/',
			});

			expect(transition.from).to.be.null;
			expect(router.routes).to.have.lengthOf(1).and.include(transition.to);
			expect(router.transitions).to.have.lengthOf(1);
		});

		it('should add routes from transition', () => {
			let transition = router.addTransition({
				from: '/',
				to: '/about',
			});

			expect(router.routes).to.include(transition.from).and.include(transition.to);
		});

		it('should not add existing transition (by transition)', () => {
			let transition = new Transition({
				from: '/',
				to: '/about',
			});

			router.addTransition(transition);
			router.addTransition(transition);

			expect(router.transitions).to.have.lengthOf(1);
		});

		it('should not add existing transition (by path)', () => {
			router.addTransition({
				from: '/',
				to: '/about',
			});

			router.addTransition({
				from: '/',
				to: '/about',
			});

			expect(router.transitions).to.have.lengthOf(1);
		});

		it('should not add existing transition (by name)', () => {
			let routeA1 = router.addRoute({
				path: '/a-1',
				name: 'a',
			});

			let routeA2 = router.addRoute({
				path: '/a-2',
				name: 'a',
			});

			let routeB1 = router.addRoute({
				path: '/b-1',
				name: 'b',
			});

			let routeB2 = router.addRoute({
				path: '/b-2',
				name: 'b',
			});

			router.addTransition({
				from: routeA1,
				to: routeB1,
			});

			router.addTransition({
				from: routeA2,
				to: routeB2,
			});

			expect(router.transitions).to.have.lengthOf(1);
		});

		it('should return null', () => {
			expect(router.addTransition(null)).to.be.null;
		});
	});

	describe('#getRouteByPath', () => {
		let router = new Router();

		let route = router.addRoute({
			path: '/',
		});

		it('should return route', () => {
			expect(router.getRouteByPath('/')).to.equal(route);
		});

		it('should return undefined', () => {
			expect(router.getRouteByPath('/about')).to.be.undefined;
		});
	});

	describe('#getRouteByName', () => {
		let router = new Router();

		let route = router.addRoute({
			path: '/',
			name: 'index',
		});

		it('should return route', () => {
			expect(router.getRouteByName('index')).to.equal(route);
		});

		it('should return undefined', () => {
			expect(router.getRouteByName('about')).to.be.undefined;
		});
	});

	describe('#getTransitionByRoutes', () => {
		let router = new Router();

		let routeOne = router.addRoute({
			path: '/',
		});

		let routeTwo = router.addRoute({
			path: '/about',
		});

		let transition = router.addTransition({
			from: routeOne,
			to: routeTwo,
		});

		it('should return transition', () => {
			expect(router.getTransitionByRoutes(routeOne, routeTwo)).to.equal(transition);
		});

		it('should return undefined', () => {
			expect(router.getTransitionByRoutes(routeTwo, routeOne)).to.be.undefined;
		});
	});

	describe('#getTransitionByRoutePaths', () => {
		let router = new Router();

		let routeOne = router.addRoute({
			path: '/',
		});

		let routeTwo = router.addRoute({
			path: '/about',
		});

		let transition = router.addTransition({
			from: routeOne,
			to: routeTwo,
		});

		it('should return transition', () => {
			expect(router.getTransitionByRoutePaths('/', '/about')).to.equal(transition);
		});

		it('should return undefined', () => {
			expect(router.getTransitionByRoutePaths('/about', '/')).to.be.undefined;
		});
	});

	describe('#getTransitionByRouteNames', () => {
		let router = new Router();

		let routeOne = router.addRoute({
			path: '/',
			name: 'index',
		});

		let routeTwo = router.addRoute({
			path: '/about',
			name: 'about',
		});

		let transition = router.addTransition({
			from: routeOne,
			to: routeTwo,
		});

		it('should return transition', () => {
			expect(router.getTransitionByRouteNames('index', 'about')).to.equal(transition);
		});

		it('should return undefined', () => {
			expect(router.getTransitionByRouteNames('about', 'index')).to.be.undefined;
		});
	});

	describe('#resolve', () => {
		beforeEach(() => {
			history.replaceState(null, '', '/');
		});

		it('should return promise', () => {
			let router = new Router();

			expect(router.resolve('/')).to.be.an.instanceOf(Promise);
		});

		it('should correctly trigger events chain', async () => {
			let handlerRouterStart = sinon.spy();
			let handlerRouterLeave = sinon.spy();
			let handlerRouterBeforeEnter = sinon.spy();
			let handlerRouterEnter = sinon.spy();
			let handlerRouterComplete = sinon.spy();

			let handlerIndexBeforeEnter = sinon.spy();
			let handlerIndexEnter = sinon.spy();
			let handlerIndexLeave = sinon.spy();

			let handlerArticleBeforeEnter = sinon.spy();
			let handlerArticleEnter = sinon.spy();
			let handlerArticleLeave = sinon.spy();

			let historyPushState = sinon.spy(history, 'pushState');

			let router = new Router({
				onStart: handlerRouterStart,
				onLeave: handlerRouterLeave,
				onBeforeEnter: handlerRouterBeforeEnter,
				onEnter: handlerRouterEnter,
				onComplete: handlerRouterComplete,
			});

			let routeIndex = router.addRoute({
				path: '/',
				name: 'index',
				onBeforeEnter: handlerIndexBeforeEnter,
				onEnter: handlerIndexEnter,
				onLeave: handlerIndexLeave,
			});

			let routeArticle = router.addRoute({
				path: '/article/:id',
				name: 'article',
				onBeforeEnter: handlerArticleBeforeEnter,
				onEnter: handlerArticleEnter,
				onLeave: handlerArticleLeave,
			});

			let prevState = sinon.match({
				route: routeIndex,
				params: {},
				query: {},
			});

			let nextState = sinon.match({
				route: routeArticle,
				params: {
					id: '1',
				},
				query: {},
			});

			router.route = routeIndex;
			router.params = {};
			router.query = {};

			await router.resolve('/article/1');

			expect(handlerRouterStart)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState);

			expect(handlerRouterLeave)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterStart);

			expect(handlerIndexLeave)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterLeave);

			expect(handlerRouterBeforeEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerIndexLeave);

			expect(handlerArticleBeforeEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterBeforeEnter);

			expect(historyPushState)
				.to.be.calledOnce
				.and.calledWithExactly(null, '', '/article/1')
				.and.calledImmediatelyAfter(handlerArticleBeforeEnter);

			expect(handlerRouterEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(historyPushState);

			expect(handlerArticleEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterEnter);

			expect(handlerArticleLeave)
				.to.be.not.called;

			expect(handlerRouterComplete)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerArticleEnter);

			history.pushState.restore();
		});

		it('should correctly trigger events chain with transition', async () => {
			let handlerRouterStart = sinon.spy();
			let handlerRouterLeave = sinon.spy();
			let handlerRouterBeforeEnter = sinon.spy();
			let handlerRouterEnter = sinon.spy();
			let handlerRouterComplete = sinon.spy();

			let handlerTransitionStart = sinon.spy();
			let handlerTransitionLeave = sinon.spy();
			let handlerTransitionBeforeEnter = sinon.spy();
			let handlerTransitionEnter = sinon.spy();
			let handlerTransitionComplete = sinon.spy();

			let handlerIndexBeforeEnter = sinon.spy();
			let handlerIndexEnter = sinon.spy();
			let handlerIndexLeave = sinon.spy();

			let handlerArticleBeforeEnter = sinon.spy();
			let handlerArticleEnter = sinon.spy();
			let handlerArticleLeave = sinon.spy();

			let historyPushState = sinon.spy(history, 'pushState');

			let router = new Router({
				onStart: handlerRouterStart,
				onLeave: handlerRouterLeave,
				onBeforeEnter: handlerRouterBeforeEnter,
				onEnter: handlerRouterEnter,
				onComplete: handlerRouterComplete,
			});

			let routeIndex = router.addRoute({
				path: '/',
				name: 'index',
				onBeforeEnter: handlerIndexBeforeEnter,
				onEnter: handlerIndexEnter,
				onLeave: handlerIndexLeave,
			});

			let routeArticle = router.addRoute({
				path: '/article/:id',
				name: 'article',
				onBeforeEnter: handlerArticleBeforeEnter,
				onEnter: handlerArticleEnter,
				onLeave: handlerArticleLeave,
			});

			router.addTransition({
				from: 'index',
				to: 'article',
				onStart: handlerTransitionStart,
				onLeave: handlerTransitionLeave,
				onBeforeEnter: handlerTransitionBeforeEnter,
				onEnter: handlerTransitionEnter,
				onComplete: handlerTransitionComplete,
			});

			let prevState = sinon.match({
				route: routeIndex,
				params: {},
				query: {},
			});

			let nextState = sinon.match({
				route: routeArticle,
				params: {
					id: '1',
				},
				query: {},
			});

			router.route = routeIndex;
			router.params = {};
			router.query = {};

			await router.resolve('/article/1');

			expect(handlerRouterStart)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState);

			expect(handlerTransitionStart)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterStart);

			expect(handlerRouterLeave)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerTransitionStart);

			expect(handlerTransitionLeave)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterLeave);

			expect(handlerIndexLeave)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerTransitionLeave);

			expect(handlerRouterBeforeEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerIndexLeave);

			expect(handlerTransitionBeforeEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterBeforeEnter);

			expect(handlerArticleBeforeEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerTransitionBeforeEnter);

			expect(historyPushState)
				.to.be.calledOnce
				.and.calledWithExactly(null, '', '/article/1')
				.and.calledImmediatelyAfter(handlerArticleBeforeEnter);

			expect(handlerRouterEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(historyPushState);

			expect(handlerTransitionEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterEnter);

			expect(handlerArticleEnter)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerTransitionEnter);

			expect(handlerArticleLeave)
				.to.be.not.called;

			expect(handlerRouterComplete)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerArticleEnter);

			expect(handlerTransitionComplete)
				.to.be.calledOnce
				.and.calledWithExactly(prevState, nextState)
				.and.calledImmediatelyAfter(handlerRouterComplete);

			history.pushState.restore();
		});

		it('should not call pushState or replaceState', async () => {
			let router = new Router();
			let historyPushState = sinon.spy(history, 'pushState');
			let historyReplaceState = sinon.spy(history, 'replaceState');

			router.route = router.addRoute({
				path: '/',
			});

			await router.resolve('/');

			await router.resolve('/', {
				method: 'push',
			});

			await router.resolve('/', {
				method: 'none',
			});

			expect(historyPushState).to.be.not.called;
			expect(historyReplaceState).to.be.not.called;

			history.pushState.restore();
			history.replaceState.restore();
		});

		it('should call replaceState', async () => {
			let router = new Router();
			let historyReplaceState = sinon.spy(history, 'replaceState');

			router.route = router.addRoute({
				path: '/',
			});

			await router.resolve('/', {
				method: 'replace',
			});

			expect(historyReplaceState)
				.to.be.calledOnce
				.and.calledWithExactly(null, '', '/');

			history.replaceState.restore();
		});

		it('should trigger notFound', async () => {
			let handlerRouterNotFound = sinon.spy();

			let router = new Router({
				onNotFound: handlerRouterNotFound,
			});

			router.addRoute({
				path: '/',
				name: 'index',
			});

			await router.resolve('/article/1');

			expect(handlerRouterNotFound)
				.to.be.calledOnce
				.and.calledWithExactly('/article/1', {});
		});
	});

	describe('#navigate', () => {
		let router = new Router();
		let routerResolve;

		router.addRoute({
			path: '/about',
			name: 'about',
		});

		router.addRoute({
			path: '/article/:id',
			name: 'article',
		});

		beforeEach(() => {
			history.replaceState(null, '', '/');
			router.route = null;
			router.params = null;
			router.query = null;

			routerResolve = sinon.spy(router, 'resolve');
		});

		afterEach(() => {
			router.resolve.restore();
		});

		it('should return promise', () => {
			expect(router.navigate('/')).to.be.an.instanceOf(Promise);
		});

		it('should navigate to path', async () => {
			await router.navigate('/article/1');

			expect(routerResolve).to.be.calledWithExactly('/article/1', {
				method: 'push',
			});
		});

		it('should navigate to route by path', async () => {
			await router.navigate('/about', {
				query: {
					x: 42,
				},
				hash: '#anchor',
			});

			expect(routerResolve).to.be.calledWithExactly('/about?x=42#anchor', {
				method: 'push',
			});
		});

		it('should navigate to route by name', async () => {
			await router.navigate('article', {
				params: {
					id: 1,
				},
				query: {
					x: 42,
				},
				hash: '#anchor',
			});

			expect(routerResolve).to.be.calledWithExactly('/article/1?x=42#anchor', {
				method: 'push',
			});
		});

		it('should navigate to route by route', async () => {
			await router.navigate(router.getRouteByName('about'));

			expect(routerResolve).to.be.calledWithExactly('/about', {
				method: 'push',
			});
		});

		it('should not navigate to same location', async () => {
			await router.navigate('/');

			expect(routerResolve).to.be.not.called;
		});

		it('should call resolve with method = "replace"', async () => {
			await router.navigate('about', {
				method: 'replace',
			});

			expect(routerResolve).to.be.calledWithExactly('/about', {
				method: 'replace',
			});
		});
	});

	describe('#bindLinks', () => {
		let router = new Router();

		it('should add event listener to link and check click', () => {
			let link = document.createElement('a');
			let linkAddEventListener = sinon.spy(link, 'addEventListener');
			let routerNavigate = sinon.spy(router, 'navigate');

			link.href = '/';
			link.dataset.routerLink = '';
			document.body.appendChild(link);

			router.bindLinks();
			link.click();

			expect(link.isBound).to.be.true;
			expect(linkAddEventListener).to.be.calledOnce;
			expect(routerNavigate).to.be.calledOnce.and.calledWithExactly('/');

			router.navigate.restore();
		});

		it('should not add event listener to already bound link', () => {
			let link = document.createElement('a');
			let linkAddEventListener = sinon.spy(link, 'addEventListener');

			link.href = '/';
			link.dataset.routerLink = '';
			document.body.appendChild(link);

			router.bindLinks();
			router.bindLinks();

			expect(linkAddEventListener).to.be.calledOnce;
		});
	});

	describe('#listen', () => {
		let router = new Router();

		router.addRoute({
			path: '/',
		});

		router.addRoute({
			path: '/about',
		});

		it('should add popstate listener', () => {
			let windowAddEventListener = sinon.spy(window, 'addEventListener');

			router.listen();

			expect(windowAddEventListener).to.be.calledOnce.and.calledWith('popstate');

			window.addEventListener.restore();
		});

		it('should go back', async () => {
			await router.navigate('/?step=1');
			await router.navigate('/about?step=2');

			let routerResolve = sinon.spy(router, 'resolve');

			history.back();

			return new Promise((resolve) => {
				setTimeout(() => {
					expect(routerResolve).to.be.calledOnce.and.calledWithExactly('/?step=1', {
						method: 'none',
					});

					resolve();
				}, 0);
			});
		});
	});

	describe('#start', () => {
		it('should bind links, add listener and resolve current location', async () => {
			let router = new Router();
			let routerBindLinks = sinon.spy(router, 'bindLinks');
			let routerListen = sinon.spy(router, 'listen');
			let routerResolve = sinon.spy(router, 'resolve');

			history.replaceState(null, '', '/');

			let routeIndex = router.addRoute({
				path: '/',
			});

			await router.start();

			expect(routerBindLinks).to.be.calledOnce;
			expect(routerListen).to.be.calledOnce;

			expect(routerResolve).to.be.calledOnce.and.calledWithExactly('/', {
				method: 'none',
			});

			expect(router.route).to.equal(routeIndex);
		});
	});
});
