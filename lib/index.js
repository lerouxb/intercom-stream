"use strict";
var debug = require('debug')('intercom-stream');
var es = require('event-stream');


function getIntercomStream(options, firstMakePromise) {
  var client = options.client;
  var key = options.key;
  var makePromise = firstMakePromise;

  return es.readable(function(count, callback) {
    debug("polled", count);
    var stream = this;

    var promise = makePromise();

    // only make/execute each one once
    makePromise = null;

    promise.then(function(result) {
      result.body[key].forEach(function(result) {
        stream.emit('data', result);
      });

      if (result.body.pages && result.body.pages.next) {
        makePromise = function() {
          debug('loading next page', result.body.pages);
          return client.nextPage(result.body.pages);
        };

      } else {
        // all done!
        stream.emit('end');
      }

      callback();
    })
    .catch(function(err) {
      stream.emit('error', err);
    });
  });
}

module.exports = getIntercomStream;
