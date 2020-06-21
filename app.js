var express = require('express');
var app = express();

var port = process.env.PORT || 8080;

const axios = require('axios');

const host_name = "https://graphdb.sti2.at/repositories/OCSS2020?";

const authenticationParams = {
	auth: {
		username: 'oc1920',
		password: 'Oc1920!'
	}
}

const querystring = require('querystring');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', (req, res) => {
    res.status(200).send("Server is running")
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {
	try {
		console.log("Intent is: " + req.body.queryResult.intent.displayName)

		callGraphDb(req, res)
	} catch (e) {
		console.log(e)
		return res.json({
			fulfillmentText: 'Webhook Error: ' + e,
			source: 'testApp'
		})
	}
})

function callGraphDb(req, res) {
	var encoded_query;

	switch (req.body.queryResult.intent.displayName) {
		case "What is Type Question": 
			var parameter = Object.values(req.body.queryResult.parameters)[0];
			encoded_query = query_for_what_is_questions(parameter)
			break;
		case "Difference Type Question":
			var first_parameter = Object.values(Object.values(req.body.queryResult.parameters)[0])[0];
			var second_parameter = Object.values(Object.values(req.body.queryResult.parameters)[0])[1];
			encoded_query = query_for_difference_questions(first_parameter, second_parameter);
			break;
		case "List Type Questions": 
			var parameter = Object.values(req.body.queryResult.parameters)[0];
			encoded_query = query_for_list_questions(parameter)
			break;
		case "Step Type Questions": 
			var parameter = Object.values(req.body.queryResult.parameters)[0];
			encoded_query = query_for_step_questions(parameter)
			break;
		case "Example Type Questions": 
			var parameter = Object.values(req.body.queryResult.parameters)[0];
			encoded_query = query_for_example_questions(parameter)
			break;
		default: {
			return res.json({
				fulfillmentText: 'Webhook Error: Intent could not be parsed.',
				source: 'testApp'
			})
		}
	}

	let url = host_name + encoded_query
	
	axios.get(url,authenticationParams).then(response =>{			
		var response_value_array = collectResponseDataFromGraphDb(response)

		let response_value = response_validation(req, response_value_array)

		return res.json({
			fulfillmentText: response_value,
			source: 'testApp'
		});
	}).catch(error => {
		console.log(error);
		return res.json({
			fulfillmentText: 'Webhook Error: Failed getting data from GraphDb.',
			source: 'testApp'
		})
	});
}

function collectResponseDataFromGraphDb(response) {
	var ret_array = []
	for (i = 0; i < response.data.results.bindings.length; i++) {
		if ('purpose' in response.data.results.bindings[i]) {
			ret_array[i] = response.data.results.bindings[i].purpose.value;
		}
		else if ('description' in response.data.results.bindings[i]) {
			ret_array[i] = response.data.results.bindings[i].description.value;
		}
		else {
			ret_array[i] = "No description or purpose found in result of Graph DB."
		}
	}
	return ret_array;
}

function response_validation(req, response_value_array) {
	if (response_value_array.length == 0) {
		return "No entry found in GraphDB."
	}

	switch (req.body.queryResult.intent.displayName) {
		case "What is Type Question":
			return response_value_array[0]
		case "List Type Questions":
			return "Here is the list: " + response_value_array.join(", ")
		case "Step Type Questions":
			return "Here are the steps: " + response_value_array.join(", then ")
		case "Example Type Questions": 
			return "Examples are: " + response_value_array.join(" ")
		case "Difference Type Question":
			if (response_value_array[0] == response_value_array[1]) {
				return response_value_array[0];
			} else {
				return "The requested concepts cannot be compared"
			}
	}
}

function query_for_what_is_questions(parameter){
	return querystring.stringify({query: `
		PREFIX schema: <http://schema.org/>
		PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
		select ?description ?purpose where { 
			{
				?Concept schema:name ?name.
				OPTIONAL { ?Concept schema:description ?description . }
				OPTIONAL { ?Concept kgbs:purpose ?purpose . }
				filter (LCASE(?name) = LCASE("${parameter}"))
			}
			union 
			{
				?Concept schema:alternateName ?name.
				OPTIONAL { ?Concept schema:description ?description . }
				OPTIONAL { ?Concept kgbs:purpose ?purpose . }
				filter (LCASE(?name) = LCASE("${parameter}"))
			}
		}
	`});
}

function query_for_difference_questions(first_parameter, second_parameter){
	return querystring.stringify({query: `
		PREFIX schema: <http://schema.org/>
		PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
					
		select ?description where { 
			?Concept schema:name ?name
			OPTIONAL {?Concept kgbs:differsFrom ?relatesTo.}
			OPTIONAL {?relatesTo schema:description ?description.}
			filter (LCASE(?name) = LCASE("${first_parameter}") || LCASE(?name) = LCASE("${second_parameter}"))
		}
	`});
}

function query_for_list_questions(parameter){
	return querystring.stringify({query: `
		PREFIX schema: <http://schema.org/>
		PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
							
		select ?description where { 
			{
				?Concept schema:name ?name
				OPTIONAL {?Concept skos:narrower ?specialization.}
				OPTIONAL {?specialization schema:name ?description.}
				filter (LCASE(?name) = LCASE("${parameter}")) .
			}    
			union 
			{
				?Concept schema:alternateName ?name
				OPTIONAL {?Concept skos:narrower ?specialization.}
				OPTIONAL {?specialization schema:name ?description.}
				filter (LCASE(?name) = LCASE("${parameter}")) .
			}
		}
	`});
}

function query_for_step_questions(parameter){
	return querystring.stringify({query: `
		PREFIX schema: <http://schema.org/>
		PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
							
		select ?description where {
			?Concept schema:name ?name .
			?Concept schema:step: ?Object .
			OPTIONAL { ?Object schema:text ?description . }
			filter contains (LCASE(?name), LCASE("${parameter}")) .
		}
	`});
}


function query_for_example_questions(parameter) {
	return querystring.stringify({query: `
		PREFIX schema: <http://schema.org/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		select ?description where { 
				?Concept schema:name ?name.
				optional { ?Concept skos:example ?example . }
				optional {?example schema:description ?description . }
				filter (LCASE(?name) = LCASE("${parameter}"))
		}
	`});
}