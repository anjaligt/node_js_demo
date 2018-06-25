reqstore [![Build Status](https://travis-ci.org/vxtindia/reqstore.png?branch=test)](https://travis-ci.org/vxtindia/reqstore)
========

Request storage middleware for connect or express

Overview
========

Attaches an empty object named `store` to every `req`. Provides a way to store intermediate results in the request object. Properties attached to the object will persist for the duration of the request.

Exposes a localStorage like API.

````
req.store.get('key');
req.store.set('key', 'value');
req.store.set({ key: 'value' });
req.store.remove('key');
````

Usage
=====
````
var reqstore = require('reqstore');
//...
app.use(reqstore());

app.get('/more', dostuff, domorestuff)

// later in a route middleware
function dostuff(req, res, next) {
  req.store.item = { foo: 'bar' };

  // you can also set values
  req.store.set('foo', 'bar');

  // or use an object if you like
  req.store.set({ foo: 'bar' });

  next();
}

function domorestuff(req, res, next) {
  var item = req.store.item;

  // you can use get to retrieve
  var bar = req.store.get('foo');

  // to remove
  req.store.remove('foo');

  console.log(item);  // { foo: 'bar' }
  next();
}
````

Run Tests
=========

````
$ make test
````

Bugs
====

[Github Issues](https://github.com/vxtindia/reqstore/issues)

LICENSE
=======

MIT