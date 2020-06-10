var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

const axios = require('axios');

const host_name = "https://graphdb.sti2.at/repositories/OCSS2020?";

const querystring = require('querystring');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


function remove_whitespaces(input) {
	return input.split(" ").join("")
}

app.get('/', (req, res) => {
    res.status(200).send("Server is running")
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {

	// TODO: we need a distinction between what is and other question types

	console.log(req.body.queryResult.intent)

	var requested_intent = req.body.queryResult.parameters.placeholder_generated_entities;

	console.log(requested_intent)

	var encoded_query = querystring.stringify({query: `
	PREFIX schema: <http://schema.org/>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

	select * where { 
		?Concept schema:name ?name.
		OPTIONAl {?Concept rdfs:comment ?comment.}
		filter contains(LCASE(?name), LCASE("${remove_whitespaces(requested_intent)}"))
	}`
	});	// pre-defined query sample.. needs to be improved to handle complicated queries -> only returns purpose or description for the passed 'name'..

    let url = host_name + encoded_query;	// encodes the given query to create a url based on passed parameters, intents in our case..

	axios.get(url, {
		auth: {
			username: 'oc1920',
			password: 'Oc1920!'
		}
	}).then(response =>{
        console.log(response.data)

        let response_value = (typeof response.data.results.bindings[0].purpose === 'undefined') ? response.data.results.bindings[0].description.value 
        : response.data.results.bindings[0].purpose.value;	// checks out if the return type is 'purpose' or 'description' and set the value for fulfilmment text..

        //res.send(response.data);	returns the full JSON body, instead we can re-define a fulfillmentText that'll be shown on Google Assistant..

        var fulfillText = 'Response from the webhook: ' + response_value;

        return res.json({
            fulfillmentText: fulfillText,
            source: 'testApp'
        });
	}).catch(error => {
		console.log(error);
		res.send(error);
	});	
})
