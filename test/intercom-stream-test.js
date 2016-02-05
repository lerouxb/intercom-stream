'use strict';
var assert = require('assert');
var getIntercomStream = require('..');

var RESULTS_PER_PAGE = 5;

function makeFakeClient(key, numResults) {
  return {
    getFirstPage: function() {
      var toReturn = Math.min(numResults, RESULTS_PER_PAGE);

      var array = [];
      for (var i=0; i<toReturn; i++) {
        array[i] = i;
      }

      var response = {body: {}};
      response.body[key] = array;

      var pagination = {
        type: 'pages',
        page: 1,
        per_page: RESULTS_PER_PAGE,
        total_pages: Math.ceil(numResults/RESULTS_PER_PAGE)
      };
      if (pagination.page < pagination.total_pages) {
        pagination.next = 'this-is-not-a-url';
      }
      response.body.pages = pagination;

      return Promise.resolve(response);
    },

    nextPage: function(pagination) {
      if (pagination.page >= pagination.total_pages) {
        throw new Error('End already reached.');
      }

      var offset = pagination.page*RESULTS_PER_PAGE;
      var amountLeft = numResults - offset;
      var toReturn = Math.min(amountLeft, RESULTS_PER_PAGE);

      var array = [];
      for (var i=0; i<toReturn; i++) {
        array[i] = i + offset;
      }

      var response = {body: {}};
      response.body[key] = array;

      var newPagination = {
        type: 'pages',
        page: pagination.page+1,
        per_page: RESULTS_PER_PAGE,
        total_pages: Math.ceil(numResults/RESULTS_PER_PAGE)
      };
      if (newPagination.page < newPagination.total_pages) {
        newPagination.next = 'this-is-not-a-url';
      }
      response.body.pages = newPagination;

      return Promise.resolve(response);
    }
  }
}

function countStream(stream, expected, done) {
  var total = 0;
  stream
    .on('data', function(data) {
      total++;
    })
    .on('end', function() {
      assert.equal(total, expected);
      done();
    })
    .on('error', done);
}

var KEY = 'things';

describe('getIntercomStream', function() {
  it('deals with blank results', function(done) {
    var client = makeFakeClient(KEY, 0);
    var stream = getIntercomStream({client: client, key: KEY}, function() {
      return client.getFirstPage();
    });
    countStream(stream, 0, done);
  });

  it('deals with only a single page', function(done) {
    var client = makeFakeClient('things', 5);
    var stream = getIntercomStream({client: client, key: KEY}, function() {
      return client.getFirstPage();
    });
    countStream(stream, 5, done);
  });

  it('deals with multiple pages', function(done) {
    var client = makeFakeClient('things', 25);
    var stream = getIntercomStream({client: client, key: KEY}, function() {
      return client.getFirstPage();
    });
    countStream(stream, 25, done);
  });
});
