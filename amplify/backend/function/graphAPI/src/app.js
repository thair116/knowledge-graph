/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["OPEN_AI_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/
/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const fetch = require('node-fetch');
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


app.post('/query', async function(req, res, next) {

  const cypherQuery = `
        MATCH (n)
        RETURN n
        LIMIT 10;
    `;

    const url = 'https://harmonic-instance-1.cbycqrjfsmkf.us-west-2.neptune.amazonaws.com:8182/openCypher';
    const params = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `query=${encodeURIComponent(cypherQuery)}&queryType=cypher`
    };

    try {
        const response = await fetch(url, params);
        const data = await response.json();

        res.json({success: 'post call succeed!', body: data})
    } catch (error) {
      next(err)
      // res.json({success: 'post call succeed!', url: req.url, body: req.body})
      //   return {
      //       statusCode: 500,
      //       body: `Error: ${error.message}`
      //   };
    }


  // Add your code here
  res.json({success: 'sholdnt be here'})
});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
