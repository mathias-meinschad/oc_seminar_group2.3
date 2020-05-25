var express = require('express');
var app = express();

var port = process.env.PORT || 8080;


app.get('/', (req, res) => {
    const {ServerClient, ServerClientConfig} = require('graphdb').server;
    const {RDFMimeType} = require('graphdb').http;
    
    const serverConfig = new ServerClientConfig('http://http://graphdb.sti2.at:8080/', 0, {
        'Accept': RDFMimeType.SPARQL_RESULTS_JSON
    });
    const server = new ServerClient(serverConfig);

    server.hasRepository('OCSS2020').then(exists => {
        if (exists) {
            // repository exists -> delete it for example
        }
    }).catch(err => console.log(err));


    
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