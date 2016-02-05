#!/usr/bin/env node
"use strict";

if (!process.env.INTERCOM_APP_ID || !process.env.INTERCOM_API_KEY) {
  throw new Error('INTERCOM_APP_ID and INTERCOM_API_KEY required.');
}

var program = require('commander');
var getIntercomStream = require('..');

program
  .option('-s --segment <segment>', 'Intercom Segment ID')
  .parse(process.argv);

if (!program.segment) {
  throw new Error('Segment required.');
}

var Intercom = require('intercom-client');
var intercomOptions = {
  appId: process.env.INTERCOM_APP_ID,
  appApiKey: process.env.INTERCOM_API_KEY
};
var client = new Intercom.Client(intercomOptions).usePromises();

var stream = getIntercomStream({ client: client, key: 'users'}, function() {
  return client.users.listBy({segment_id: program.segment});
});

stream
  .on('data', function(user) {
    console.log(user.email);
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
