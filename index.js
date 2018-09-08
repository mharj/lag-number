const EventEmitter = require('events');
/**
 * Lag number class
 */
class LagNumber extends EventEmitter {
	/**
	 * Lag Number constructor
	 * @param {Number} lag How long value will take until reach to stopValue
	 * @param {Number} startValue (optional) start value
	 * @param {Number} stopValue (optional) end value
	 * @param {Number} ts (optional) current timestamp
	 */
	constructor(lag, startValue, stopValue, ts) {
		super();
		if (!lag || isNaN(lag)) {
			throw new TypeError('lag value is undefined or not number');
		}
		this.lag = lag;
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
		if ( this.timer ) {
			clearTimeout(this.timer);
		}
		this.startValue = startValue;
		this.stopValue = stopValue;
		this.startTs = isNaN(ts) ? new Date().getTime() : ts;
		this.timer = setTimeout(()=> {
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
		if ( callback ) {
			callback( startValue );
		}
		return new Promise( (resolve, reject) => {
			if ( ! isNaN(callbackDelay) ) {
				clearTimeout(this.interval);
				this.interval = setInterval( () => {
					if ( callback ) {
						callback( this.get() );
					}
				}, callbackDelay);
			}
			clearTimeout(this.promiseTimer);
			this.promiseTimer = setTimeout( () => {
				clearTimeout(this.interval);
				if ( callback ) {
					callback( stopValue );
				}
				resolve();
			}, this.lag);
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
		let p = (currentTs - this.startTs) / this.lag;
		let value = (this.stopValue - this.startValue) * p + this.startValue;
		if ( this.startValue < this.stopValue ) {
			return value < this.stopValue ? value : this.stopValue;
		} else {
			return value > this.stopValue ? value : this.stopValue;
		}
	}
}
module.exports = LagNumber;
