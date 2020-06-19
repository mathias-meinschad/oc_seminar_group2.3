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
	let url = host_name + encoded_query

	var encoded_query;

	switch (req.body.queryResult.intent.displayName) {
		case "What is Type Question": 
			var parameter = Object.values(req.body.queryResult.parameters)[0];

			encoded_query = query_for_what_is_questions(parameter)
			break;
		case "Difference Type Question":
			var first_parameter = Object.values(Object.values(req.body.queryResult.parameters)[0])[0];
			var second_parameter = Object.values(Object.values(req.body.queryResult.parameters)[0])[1];

			
			console.log("Parameters are: " + first_parameter + " " + second_parameter)

			encoded_query = query_for_difference_questions(first_parameter, second_parameter);
			break;
		default: {
			return res.json({
				fulfillmentText: 'Webhook Error: Intent could not be parsed.',
				source: 'testApp'
			})
		}
	}
	
	axios.get(url,authenticationParams).then(response =>{			
		let response_value = (typeof response.data.results.bindings[0].purpose === 'undefined') ? response.data.results.bindings[0].description.value 
		: response.data.results.bindings[0].purpose.value;	// checks out if the return type is 'purpose' or 'description' and set the value for fulfilmment text..

		return res.json({
			fulfillmentText: response_value,
			source: 'testApp'
		});
	}).catch(error => {
		console.log(error);
		res.send(error);
	});
}

function query_for_what_is_questions(parameter){
	return querystring.stringify({query: `
			PREFIX schema: <http://schema.org/>
			PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
			select * where { 
				?Concept schema:name ?name.
				OPTIONAL {?Concept kgbs:purpose ?purpose.}
				OPTIONAL {?Concept schema:description ?description.}
				filter contains(LCASE(?name), LCASE("${parameter}"))
			}
		`
	});
}

function query_for_difference_questions(first_parameter, second_parameter){
	return querystring.stringify({query: `
			PREFIX schema: <http://schema.org/>
			PREFIX kgbs: <http://www.knowledgegraphbook.ai/schema/>
			select * where { 
				?Concept schema:name ?name.
				OPTIONAL {?Concept kgbs:purpose ?purpose.}
				OPTIONAL {?Concept schema:description ?description.}
				filter contains(LCASE(?name), LCASE("${first_parameter}"))
			}
		`
	});
}