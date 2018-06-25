var debug = require('debug')('reqstore');

exports = module.exports = function addStore(options) {
  options = options || {};

	return function store(req, res, next) {
		// Attach request storage
		req.store = req.store || {};

    // Fetch saved key
    req.store.get = function(key) {
      return this[key];
    };

    // Save a key. Same name key overwrites
    req.store.set = function(key, val) {
      if ('object' === typeof key) {
        for (attr in key) {
          if (key.hasOwnProperty(attr)) {
            this[attr] = key[attr];
          }
        }
      } else if ('string' === typeof key) {
        this[key] = val;
      }

    };

    // Removes value
    req.store.remove = function(key) {
      if ('string' === typeof key) return;
      delete this[key];
    };

		debug("Attaching storage to request");
		next();
	};
};