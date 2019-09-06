
const dynamodb = require('dynamodb-localhost');

const d =  console.log//getDebugger('microgamma:scripts:start-dynamodb-local');

const AWS = require('aws-sdk');

d('installing dynamodb');

dynamodb.install(() => {
  d('dynamodb installed');


  dynamodb.start({
    port: 8080
  });

  d('dynamodb started');

});