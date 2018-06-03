import {expect} from 'chai';
import {Route} from '../src/Route';

describe('Route', () => {
	describe('#constructor', () => {
		it('should initialize route', () => {
			let onBeforeEnter = () => {};
			let onEnter = () => {};
			let onLeave = () => {};

			let route = new Route({
				path: '/',
				name: 'index',
				onBeforeEnter,
				onEnter,
				onLeave,
			});

			expect(route.path).to.equal('/');
			expect(route.name).to.equal('index');
			expect(route.handlers.beforeEnter).to.include(onBeforeEnter);
			expect(route.handlers.enter).to.include(onEnter);
			expect(route.handlers.leave).to.include(onLeave);
		});

		it('should initialize case sensitive route', () => {
			let route = new Route({
				path: '/about',
				options: {
					sensitive: true,
				},
			});

			expect('/about').to.match(route.regexp);
			expect('/About').to.not.match(route.regexp);
		});

		it('should initialize case insensitive route', () => {
			let route = new Route({
				path: '/about',
				options: {
					sensitive: false,
				},
			});

			expect('/about').to.match(route.regexp);
			expect('/About').to.match(route.regexp);
		});
	});

	describe('#execPath', () => {
		it('should return params', () => {
			let route = new Route({
				path: '/:year/:month/:day',
			});

			expect(route.execPath('/2018/05/26')).to.deep.equal({
				year: '2018',
				month: '05',
				day: '26',
			});
		});

		it('should return false', () => {
			let route = new Route({
				path: '/',
			});

			expect(route.execPath('/different-page')).to.be.false;
		});
	});

	describe('#generatePath', () => {
		let routeWithoutParams = new Route({
			path: '/',
		});

		let routeWithParams = new Route({
			path: '/article/:id',
		});

		it('should generate path without params', () => {
			expect(routeWithoutParams.generatePath()).to.equal('/');
		});

		it('should generate path with params', () => {
			let path = routeWithParams.generatePath({
				params: {
					id: 1,
				},
			});

			expect(path).to.equal('/article/1');
		});

		it('should generate path with query', () => {
			let path = routeWithoutParams.generatePath({
				query: {
					x: 42,
				},
			});

			expect(path).to.equal('/?x=42');
		});

		it('should generate path with hash', () => {
			let path = routeWithoutParams.generatePath({
				hash: '#anchor',
			});

			expect(path).to.equal('/#anchor');
		});

		it('should generate path with hash (without hash sign)', () => {
			let path = routeWithoutParams.generatePath({
				hash: 'anchor',
			});

			expect(path).to.equal('/#anchor');
		});

		it('should generate path with params and query', () => {
			let path = routeWithParams.generatePath({
				params: {
					id: 1,
				},
				query: {
					x: 42,
				},
			});

			expect(path).to.equal('/article/1?x=42');
		});

		it('should generate path with params and hash', () => {
			let path = routeWithParams.generatePath({
				params: {
					id: 1,
				},
				hash: '#anchor',
			});

			expect(path).to.equal('/article/1#anchor');
		});

		it('should generate path with query and hash', () => {
			let path = routeWithoutParams.generatePath({
				query: {
					x: 42,
				},
				hash: '#anchor',
			});

			expect(path).to.equal('/?x=42#anchor');
		});

		it('should generate path with params, query and hash', () => {
			let path = routeWithParams.generatePath({
				params: {
					id: 1,
				},
				query: {
					x: 42,
				},
				hash: '#anchor',
			});

			expect(path).to.equal('/article/1?x=42#anchor');
		});
	});
});
