var express = require('express');
var app = express();

var port = process.env.PORT || 8080;


app.get('/', (req, res) => {
    const {ServerClient, ServerClientConfig} = require('graphdb').server;
    const {RDFMimeType} = require('graphdb').http;
    const {RepositoryClientConfig} = require('graphdb').repository;
    const {SparqlXmlResultParser} = require('graphdb').SparqlXmlResultParser
    
    const serverConfig = new ServerClientConfig('http://graphdb.sti2.at:8080/', 0, {
        'Accept': RDFMimeType.SPARQL_RESULTS_JSON
    });
    const server = new ServerClient(serverConfig);

    server.hasRepository('OCSS2020').then(exists => {
        if (exists) {
            // repository exists -> delete it for example
            console.log('DB exits')
        }
    }).catch(err => console.log(err));

    const readTimeout = 30000;
    const writeTimeout = 30000;
    const repositoryClientConfig = new RepositoryClientConfig(['http://graphdb.sti2.at:8080/'], {}, '', readTimeout, writeTimeout);
    const repo = server.getRepository('OCSS2020', repositoryClientConfig).then((rdfRepositoryClient) => {
        // rdfRepositoryClient is a configured instance of RDFRepositoryClient
    });

    repo.registerParser(new SparqlXmlResultParser());     
      
    const payload = new GetQueryPayload()
        .setQuery('ask { ?person schema:description ?name . } limit 100 ')
        .setQueryType(QueryType.ASK)
        .setResponseType(RDFMimeType.BOOLEAN_RESULT);
 
        repo.registerParser(new SparqlJsonResultParser());
    
    repo.query(payload).then((data) => {
        if (data) {
            console.log("its true");
        } else {
            console.log("its false");
        }
    });


    res.status(200).send('Server is working.')
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {
    console.log('Received call from google assistant');
    
    console.log(req.body);
    
    console.log('Returning smth to google assistant');
    return res.json({
        fulfillmentText: 'Check that out, this response is from heroku',
        source: 'getmovie'
      })
})