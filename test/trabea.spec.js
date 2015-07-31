/* eslint-env mocha */

import Trabea from '../src/trabea';
import expect from 'expect';

describe('Trabea', function () {
	var trabea;

	beforeEach(function () {
		trabea = new Trabea();
	});

	it('should create a duplex stream', function () {
		expect(trabea).toBeA(Trabea);
		expect(trabea.pipe).toBeA(Function);
		expect(trabea.readable).toBe(true);
		expect(trabea.writable).toBe(true);
	});
});
