const EventEmitter = require('events');

/**
 * Get smallest number value from array
 * @param {Array} arr Array of number values
 * @return {Number}
 */
function getSmallestValue(arr) {
	let ret = null;
	arr.forEach((v) => {
		if (!isNaN(v) && ( ret === null || ret > v)) {
			ret = v;
		}
	});
	return ret;
}
/**
 * Get Buggest number value from array
 * @param {Array} arr Array of number values
 * @return {Number}
 */
function getBiggestValue(arr) {
	let ret = null;
	arr.forEach((v) => {
		if (!isNaN(v) && ( ret === null || ret < v)) {
			ret = v;
		}
	});
	return ret;
}

/**
 * Lag number class
 */
class LagNumber extends EventEmitter {
	/**
	 * Lag Number constructor
	 * @param {Object} options
	 * @param {Number} options.lag Lag in milliseconds
	 * @param {Number} options.min (optional) Minimum value (not autoscale)
	 * @param {Number} options.max (optional) Maximum value (not autoscale)
	 * @param {Number} startValue (optional) start value
	 * @param {Number} stopValue (optional) end value
	 * @param {Number} ts (optional) current timestamp
	 */
	constructor(options, startValue, stopValue, ts) {
		super();
		if (!options || !options.lag || isNaN(options.lag)) {
			throw new TypeError('lag option is undefined or not number');
		}
		this.lag = options.lag;
		this.maxValue = options.max;
		this.minValue = options.min;
		this.autoScale = isNaN(options.max) || isNaN(options.min) ? true : false;
		this.timer = null;
		this.promiseTimer = null;
		this.interval = null;
		this.promises = [];
		if (!isNaN(startValue) && !isNaN(stopValue)) {
			this.set(startValue, stopValue, ts);
		} else {
			this.startValue = null;
			this.stopValue = null;
		}
	}
	/**
	 * set new Lag values
	 * @param {Number} startValue Start value
	 * @param {Number} stopValue Stop value
	 * @param {Number} ts (optional) current timestamp
	 */
	set(startValue, stopValue, ts) {
		if ( this.autoScale ) {
			this.maxValue = getBiggestValue([this.maxValue, startValue, stopValue]);
			this.minValue = getSmallestValue([this.minValue, startValue, stopValue]);
		}
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.startValue = startValue;
		this.stopValue = stopValue;
		this.startTs = isNaN(ts) ? new Date().getTime() : ts;
		this.timer = setTimeout(() => {
			this.emit('target');
		}, this.lag);
	}
	/**
	 * set Promise with optional updates callback with delay
	 * @param {Number} startValue Start value
	 * @param {Number} stopValue Stop value
	 * @param {Number} callbackDelay (optional) delay for callback value updates
	 * @param {Function} callback (optional) gets timed updates based on delay
	 * @resolves {null} when value is reached
	 * @return {Promise}
	 */
	setPromise(startValue, stopValue, callbackDelay, callback) {
		this.set(startValue, stopValue);
		if (callback) {
			callback(startValue);
		}
		return new Promise((resolve, reject) => {
			if (!isNaN(callbackDelay)) {
				clearTimeout(this.interval);
				this.interval = setInterval(() => {
					if (callback) {
						callback(this.get());
					}
				}, callbackDelay);
			}
			clearTimeout(this.promiseTimer);
			let rebaseLag = (this.stopValue - this.startValue)/(this.maxValue-this.minValue)*this.lag;
			if ( rebaseLag < 0 ) {
				rebaseLag = -rebaseLag;
			}
			this.promiseTimer = setTimeout(() => {
				clearTimeout(this.interval);
				if (callback) {
					callback(stopValue);
				}
				resolve();
			}, rebaseLag);
		});
	}
	/**
	 * get current Lag value
	 * @param {Number} ts (optional) current timestamp
	 * @return {Number} current value
	 */
	get(ts) {
		if (this.startValue === null) {
			return null;
		}
		let currentTs = isNaN(ts) ? new Date().getTime() : ts;
		let valueDiff = (this.stopValue - this.startValue);
		let rebaseLag = valueDiff/(this.maxValue-this.minValue)*this.lag;
		if ( rebaseLag < 0 ) {
			rebaseLag = -rebaseLag;
		}
		let p = (currentTs - this.startTs) / rebaseLag;
		let value = valueDiff * p + this.startValue;
		if (this.startValue < this.stopValue) {
			return value < this.stopValue ? value : this.stopValue;
		} else {
			return value > this.stopValue ? value : this.stopValue;
		}
	}
}
module.exports = LagNumber;
