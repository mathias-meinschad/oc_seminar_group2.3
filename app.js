var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

const username = 'oc1920';
const password = 'Oc1920!';
const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

const https = require('https');

var options = {
    hostname: 'graphdb.sti2.at',
    path: '',
    method: 'GET',
    headers: {
        Authorization: auth
    }
}

app.get('/', (req, res) => {
    options.path = '/repositories/OCSS2020?query=PREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E+select+%3Fname+where+%7B+%3Fperson+schema%3Aname+%3Fname+.%7D'
    
    https.get(options, (resp) => {    
        var data = ''

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            console.log(data);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    
    res.status(200).send("Server is running")
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {
    return res.json({
        fulfillmentText: 'Check that out, this response is from heroku'
    })
})
