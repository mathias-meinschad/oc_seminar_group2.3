var express = require('express');
var app = express();

var port = process.env.PORT || 8080;




app.get('/', (req, res) => {
    const {ServerClient, ServerClientConfig} = require('graphdb').server;
    const {RDFMimeType} = require('graphdb').http;
    const {RepositoryClientConfig} = require('graphdb').repository;
    const {SparqlJsonResultParser} = require('graphdb').parser;
    const {GetQueryPayload, QueryType} = require('graphdb').query;
    
    const serverConfig = new ServerClientConfig('http://graphdb.sti2.at:8080/', 0, {
        'Accept': RDFMimeType.SPARQL_RESULTS_JSON
    });
    const server = new ServerClient(serverConfig);

    server.hasRepository('OCSS2020').then(exists => {
        if (exists) {
            // repository exists -> delete it for example
            console.log('DB exits')

            const readTimeout = 30000;
            const writeTimeout = 30000;
            const repositoryClientConfig = new RepositoryClientConfig(['http://graphdb.sti2.at:8080/repositories/OCSS2020'], {}, '', readTimeout, writeTimeout);
            server.getRepository('OCSS2020',repositoryClientConfig).then(function(repository) {  

                // console.log('REPO:', repository);
                repository.registerParser(new SparqlJsonResultParser());

                const payload = new GetQueryPayload()
                  .setQuery('select * where {?s ?p ?o}')
                  .setQueryType(QueryType.SELECT)
                  .setResponseType(RDFMimeType.SPARQL_RESULTS_XML)
                  .setLimit(100);

                return repository.query(payload);

           }).then(function(stream) {
            stream.on('data', (bindings) => {
                // the bindings stream converted to data objects with the registered parser
              });
              stream.on('end', () => {
                // handle end of the stream
              });
            })
            .catch(function(error) {
                console.log('ERROR', error);
            });

            }
    }).catch(err => console.log(err));

    res.status(200).send('Server is working.')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.post('/testApp', (req, res) => {
    console.log('Received call from google assistant');
    
    console.log(req.body);
    
    console.log('Returning smth to google assistant');
    return res.json({
        fulfillmentText: 'Check that out, this response is from heroku',
        source: 'getmovie'
      })
})