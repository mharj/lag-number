/* eslint no-console: ["off"] */
/* eslint no-invalid-this: ["off"] */
const chai = require('chai');
const expect = chai.expect;
const LagNumber = require('../index');
chai.should();

describe('LagHumber', function() {
	describe('#constructor', function() {
		it('should fail if no lag defined', () => {
			expect(function() {
				new LagNumber();
			}).to.throw('lag option is undefined or not number');
		});
		it('should fail if lag is not number', () => {
			expect(function() {
				new LagNumber('asd');
			}).to.throw('lag option is undefined or not number');
		});
	}),
	describe('#set and #get', function() {
		it('should work when going 50 => 150 with 100ms as lag', () => {
			let now = new Date().getTime();
			let value = new LagNumber({lag: 100});
			expect(value.get()).to.be.null;
			value.set(50, 150, now);
			expect(value.get(now + 0))
				.to.be.a('number')
				.and.equal(50);
			expect(value.get(now + 50))
				.to.be.a('number')
				.and.equal(100);
			expect(value.get(now + 100))
				.to.be.a('number')
				.and.equal(150);
			expect(value.get(now + 150))
				.to.be.a('number')
				.and.equal(150);
		});
		it('should work when going -50 => -150 with 100ms as lag', () => {
			let now = new Date().getTime();
			let value = new LagNumber({lag: 100});
			expect(value.get()).to.be.null;
			value.set(-50, -150, now);
			expect(value.get(now + 0))
				.to.be.a('number')
				.and.equal(-50);
			expect(value.get(now + 50))
				.to.be.a('number')
				.and.equal(-100);
			expect(value.get(now + 100))
				.to.be.a('number')
				.and.equal(-150);
			expect(value.get(now + 150))
				.to.be.a('number')
				.and.equal(-150);
		});
		it('should work when going 50 => 150 with 100ms as rebase lag', () => {
			let now = new Date().getTime();
			let value = new LagNumber({lag: 100, min: 0, max: 200});
			expect(value.get()).to.be.null;
			value.set(50, 150, now);
			expect(value.get(now + 0))
				.to.be.a('number')
				.and.equal(50);
			expect(value.get(now + 50))
				.to.be.a('number')
				.and.equal(150);
			expect(value.get(now + 100))
				.to.be.a('number')
				.and.equal(150);
		});
	}),
	describe('#on target', function() {
		this.slow(150);
		it('should work when going -50 => -150 with 100ms as lag with event callback', (done) => {
			let value = new LagNumber({lag: 100});
			expect(value.get()).to.be.null;
			value.set(-50, -150);
			expect(value.get()).to.be.a('number');
			value.on('target', () => {
				expect(value.get())
					.to.be.a('number')
					.and.equal(-150);
				done();
			});
		});
	}),
	describe('#setPromise', function() {
		this.slow(250);
		it('should work when going 0 => 100 and 100 => 0 with callback and promise', (done) => {
			let value = new LagNumber({lag: 100});
			value
				.setPromise(0, 100, 10, (value) => expect(value).to.be.a('number'))
				.then(() => value.setPromise(100, 0, 10, (value) => expect(value).to.be.a('number')))
				.then(() => {
					done();
				});
		});
		it('should work when going 0 => 100 and 100 => 0 with callback and promise', (done) => {
			let value = new LagNumber({lag: 100, min: 0, max: 280});
			value
				.setPromise(0, 100, 10, (value) => {
					// console.log('value');
					expect(value).to.be.a('number');
				})
				.then(() => {
					console.log('done1');
					return value.setPromise(100, 0, 10, (value) => {
						// console.log('value');
						expect(value).to.be.a('number')
					});
				})
				.then(() => {
					console.log('done2');
					done();
				});
		});
	});
});
