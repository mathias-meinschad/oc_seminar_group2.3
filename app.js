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

	var requested_intent = req.body.queryResult.parameters.placeholder_generated_entities;

	var entity_class = remove_whitespaces(requested_intent)

	console.log(entity_class + "\n\n\n\n")

	var encoded_query = querystring.stringify({query: `
	PREFIX schema: <http://schema.org/>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

	select ?comment where { 
		?Concept schema:name ?name.
		OPTIONAl {?Concept rdfs:comment ?comment.}
		filter contains(LCASE(?name), LCASE("${entity_class}"))
	}`
	});	// pre-defined query sample.. needs to be improved to handle complicated queries -> only returns purpose or description for the passed 'name'..

	let url = host_name + encoded_query;	// encodes the given query to create a url based on passed parameters, intents in our case..
	
	console.log("url: " + url)

	axios.get(url, {
		auth: {
			username: 'oc1920',
			password: 'Oc1920!'
		}
	}).then(response =>{
        console.log("Response data: \n" + response.data + "\n\n\n\n")

        var fulfillText = 'Response from the webhook: '

        return res.json({
            fulfillmentText: fulfillText,
            source: 'testApp'
        });
	}).catch(error => {
		console.log(error);
		res.send(error);
	});	
})
