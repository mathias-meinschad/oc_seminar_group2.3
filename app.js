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


var fulfillmentText

app.get('/', (req, res) => {
    res.status(200).send("Server is running")
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {
	try {
		console.log("Intent is: " + req.body.queryResult.intent.displayName)

		if (req.body.queryResult.intent.displayName == "What is Type Question") {
			var requested_intent = req.body.queryResult.parameters.placeholder_generated_entities;

			var encoded_query = querystring.stringify({query: `
					PREFIX schema: <http://schema.org/>

					select * where { 
						?Concept schema:name ?name.
						OPTIONAL {?Concept schema:purpose ?purpose.}
						OPTIONAl {?Concept schema:description ?description.}
						filter contains(LCASE(?name), LCASE("${requested_intent}"))
					}
				`
				});	// pre-defined query sample.. needs to be improved to handle complicated queries -> only returns purpose or description for the passed 'name'..
			
			let url = host_name + encoded_query
			
			fulfillmentText = await axios.get(url,authenticationParams).then(response =>{			
				let response_value = (typeof response.data.results.bindings[0].purpose === 'undefined') ? response.data.results.bindings[0].description.value 
				: response.data.results.bindings[0].purpose.value;	// checks out if the return type is 'purpose' or 'description' and set the value for fulfilmment text..
				
				console.log("response value is: " + response_value)

				return response_value
			}).catch(error => {
				console.log(error);
				res.send(error);
			});
		} else {
			fulfillmentText = 'Intent could not be parsed.'
		}

		console.log("Before send")

		return res.json({
			fulfillText: fulfillmentText,
			source: 'testApp'
		})
	} catch (e) {
		console.log(e)
		return res.json({
			fulfillText: 'Error in webhook: ' + e,
			source: 'testApp'
		})
	}
})