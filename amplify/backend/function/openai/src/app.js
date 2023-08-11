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


const aws = require('aws-sdk');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});


app.post('/translate/query', async function (req, res, next) {
  const { body } = req;

  console.log('start')

  const { Parameters } = await (new aws.SSM())
    .getParameters({
      Names: ["OPENAI_KEY"].map(secretName => process.env[secretName]),
      WithDecryption: true,
    })
    .promise();


  console.log('start2')
  console.log(Parameters)


  const result = {};
  Parameters.forEach(item => {
    const key = item.Name.split('AMPLIFY_openai_').pop();
    result[key] = item.Value;
  });

  console.log('start3')
  console.log(result)


  const { OPENAI_KEY } = result

  const model = "gpt-4"
  const system = `You are a text-to-code translator, focussed on graph traversal languages.
  Your job is to convert plain text English queries into the opencypher graph traversal language.
      Reason through it in two steps, first by converting it to a short hand form that
      links together the primary entities via their relations. 
      
      The dataset includes the following entities
      - Company. properties: company_id(integer), company_name(string)
      - Person. properties: person_id(integer)
      and the following relations
      - acquired (company to company). properties: wasMerger(boolean)
      - employed_at (person to company). properties: start_date(date), end_date(date)
      
      In your query, do not use any entity or relation other than precisely these.
      Return an error explanation 
      if the query includes entities or relations other than these.
      
      Be sure to get the notation correct, with the correct number and placement of periods, quotes, and parantheses.
          
      
      Example:
      Which Microsoft employees used to work at LinkedIn?
      1. [company = Microsoft] -> employs  ->  ?  -> past work -> [company = LinkedIn]
      2. MATCH (ms:company {company_name: "Microsoft"})<-[rel:employed_at]-(p:person)-[rel2:employed_at]->(li:company {company_name: "LinkedIn"})
  WHERE rel.end_date IS NULL and rel2.end_date is not null
  RETURN p.person_id
  `
  const { query }  = body
  // const parsed = JSON.parse(body)
  const messages = [{ "role": "system", "content": system }, { "role": "user", "content": query }]
  console.log(query, messages)

  const params_ = {
    "temperature": 0.4,
    model,
    messages,
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify(params_)
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', requestOptions);
  const data = await response.json();

  console.log(data)
  res.json({ success: 'done', content: data.choices[0].message.content })
  return


  // const cypherQuery = `
  //       MATCH (n)
  //       RETURN n
  //       LIMIT 10;
  //   `;

  // const url = 'https://harmonic-instance-1.cbycqrjfsmkf.us-west-2.neptune.amazonaws.com:8182/openCypher';
  // const params = {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded'
  //   },
  //   body: `query=${encodeURIComponent(cypherQuery)}&queryType=cypher`
  // };

  // try {
  //   const response = await fetch(url, params);
  //   const data = await response.json();

  //   res.json({ success: 'post call succeed!', body: data })
  //   return
  // } catch (error) {
  //   next(err)
  //   // res.json({success: 'post call succeed!', url: req.url, body: req.body})
  //   //   return {
  //   //       statusCode: 500,
  //   //       body: `Error: ${error.message}`
  //   //   };
  // }


  // Add your code here
  res.json({ success: 'sholdnt be here' })
});

app.listen(3000, function () {
  console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
