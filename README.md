# Goals
* a knowledge graph
* streaming to update the knowledge graph 
* query for relationship


# My strategy 
### Process
1. spec a solution
2. build it end-to-end
3. polish and document
4. share for review 

### Our guides
1. build it usable (deployable) and reusable (scalable) from the start
2. spec from outside-in 


# The Spec
### My Spec goals
1. clarify what we know about the user?
2. what features are we trying to provide?
3. what is the interface?
4. what components do we need to provide that? 
5. what steps do we need to take to build those components?

### The user
- we know they are part of an investing firm but we don't know their role
    - are we serving an LP, or an analyst who serves an LP? most likely the latter, but that doesn't mean the LP wouldn't prefer to use it themselves if it was easy/quick enough. Plus if this reduces the need for analysts then it could be worth more $ 
- we don't know their technical skill or how much time they would spend on a query 
- we don't know their primary/secondary devices (desktop, mobile)

### The features
- query a knowledge graph
- update a knowledge graph 

### The interfaces
- human interface
    - web page 
        - mobile friendly, especially if we want to aim for LPs
- computer interface 
    - API that we could open up to our customers 
    - this comes for free

### The components
- a UI
    - we must provide a way for the user to tell us their query 
        - options:
            - visual query builder. display entities as nodes and relationships as edges, then allow user to click through to filter 
                - best if: user is technical, works on desktop, and has time to spend 
            - free text input 
                - best if: large set of expected queries, it works with high accuracy/trust
            - predefined templates for a limited set of queries
                - best if: small set of expected queries
        - choice: free text input. if it works well, it will be the best primary input for its easy UX and high flexibility. over time I could see all three working well together, but if we only have one, free text is the one. 
- a datastore
    - the data of the knowledge graph must be stored somewhere
        - options:
            - graph db. store it in a database that supports graph operations 
                - best if: you want high query flexibility and high data/usage scalability
            - files. store as files and read into memory when starting the program. 
                - best if: dataset is small and not growing, such as a throw-away prototype 
            - document db
                - best if: ?
            - relational db
                - best if: limited set of exepected queries, afraid of graph dbs or assume we can easily migrate to one later
        - choice: gotta be graph db. not only will it be the most scalable solution, but it will reduce our computational burden upfront by transforming the problem from "map the request to these objects" to "map the request to this Gremlin/SPARQL/Cypher query" 
    - we must choose a query language
        - options:
            - Gremlin. Medium complexity, direct control of db computation. Compatbile with Cypher
            - Cypher. Simplest. Imperative. compatabile with Gremlin
            - SPARQL. Most complicated, doesn't allow properties on edges, mostly used for semantic web datasets
        - choice: start with Gremlin, use Cypher if needed
- an api
    - we must connect the UI to the datastore
        - forks:
            - graphQL or not? 
                - graphQL might make sense for hydrating a rich profile about the entities referenced in the query, but doesn't seem helpful for the query itself, so not yet
            - server or serverless?
                - serverless will be cheaper ($/request instead of $/time) and quicker to deploy 
    - we must decide API inputs/outputs
        - options:
            - one (free text) -> (results) api
                - one less network roundtrip
            - split into two (free text) -> (query) and (query) -> (results)
                - provides UI the option to display query
                - (query) -> (results) api could be reused by the next interface
        - choice: split into two
    - we must decide loader interface
        - options:
            - Neptune bulk loader via CSV dropped onto S3
                - best if we expect really large data ingest files
            - direct DB inserts
                - simpler to build and test 
        - choice: direct DB inserts

### Steps to build
1. graph db
    1. pick a db, pick a query language
    2. scan the documentation
    3. stand it up
    4. experiment with loading 
    5. experiment with querying
    6. repeat 4 and and 5 until confident in choices
2. API
    1. load api
    2. query api 
    3. transform api 
3. UI
    1. stand it up
    2. collect text input
    3. submit to api 
    4. display results
    5. format
    6. handle errors


# Build notes
- graph DB
    - didn't have any trouble standing up AWS Neptune ($3 per day, including one notebook)
    - AWS Neptune only offers connections from within VPC
    - Gremlin worked fine for inserts, but was too complex for ChatGPT. Switching to Cypher improved the accuracy of the transform
- api
    - have to add little bit of custom policies and CFN templating to give lambdas VPC access

# Libraries/tools used
- create-react-app was used to standup the UI
- AWS Amplify was used for deployment of the static assets, the react server, the lambdas, and the auth. 
- Neptune was used for graphDB and deployed via AWS Console
- openAI chatGPT api was used for free text to query transformation
- nodejs and python were used for coding languages

# File map
- [UploadPage](src/components/UploadPage.js) - React component for reading a file and passing it to loader api 
- [loader](amplify/backend/function/etl/src/index.py) - python lambda that takes in json files in the format provided, converts each row to a Gremlin insert, then loads into Neptune DB
- [QueryPage](src/components/QueryPage.js) - React component for taking in a free text input and passing that to the transform api and then those results to the query api, displaying the response from each step
- [transform](amplify/backend/function/openai/src/app.js) - nodejs lambda that takes a free text input and converts it to Cypher query, by passing DB structure and query to GPT-4
- [query](amplify/backend/function/graphAPI/src/app.js) - nodejs lambda for proxying query calls to the Neptune DB
- [ResultDisplay](src/components/ResultDisplay.js) - React component for formatting the results
