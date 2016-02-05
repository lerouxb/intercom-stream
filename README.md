# intercom-stream

A streaming adapter for
[intercom-node](https://github.com/intercom/intercom-node).

## Using intercom-stream

```
$ npm install intercom-stream --save
```

```
var Intercom = require('intercom-client');
var intercomOptions = {
  appId: process.env.INTERCOM_APP_ID,
  appApiKey: process.env.INTERCOM_API_KEY
};
var client = new Intercom.Client(intercomOptions).usePromises();

var getIntercomStream = require('intercom-stream');
var stream = getIntercomStream({ client: client, key: 'users'}, function() {
  // this could be any call that will get the first page of results
  return client.users.listBy({segment_id: 'XXXXX'});
});

// use your favourite method to consume the stream
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
```

See the scripts directory for examples. In order to use the intercom scripts
you will also need to npm install commander and intercom-client.
