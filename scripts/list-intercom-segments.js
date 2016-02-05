#!/usr/bin/env node
"use strict";

var getIntercomStream = require('..');

if (!process.env.INTERCOM_APP_ID || !process.env.INTERCOM_API_KEY) {
  throw new Error('INTERCOM_APP_ID and INTERCOM_API_KEY required.');
}

var Intercom = require('intercom-client');
var intercomOptions = {
  appId: process.env.INTERCOM_APP_ID,
  appApiKey: process.env.INTERCOM_API_KEY
};
var client = new Intercom.Client(intercomOptions).usePromises();

var stream = getIntercomStream({ client: client, key: 'segments'}, function() {
  return client.segments.list();
});

stream
  .on('data', function(segment) {
    console.log(segment.id, segment.name);
  })
  .on('end', function() {
    console.log('done');
    process.exit(0);
  })
  .on('error', function(error) {
    console.error(error);
    console.error(error.stack);
    process.exit(1);
  });
