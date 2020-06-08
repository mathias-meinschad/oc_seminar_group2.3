'use strict';

// Dialogflow
const dialogflow = require('dialogflow');

const credentials = require('./credentials.json');

const entitiesClient = new dialogflow.EntityTypesClient({
 credentials: credentials,
});

const projectId = 'ocseminargroup3';
const agentPath = entitiesClient.projectAgentPath(projectId);

// GraphDB
const username = 'oc1920';
const password = 'Oc1920!';
const auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

const https = require('https');

// promise
let getData = function(query) {
  return new Promise(function(resolve, reject){
    let options = {
    	hostname: 'graphdb.sti2.at',
	    path: '',
	    method: 'GET',
	    headers: {
	        Authorization: auth
	    }
	};

	options.path = '/repositories/OCSS2020?query=' + encodeURI(query);

    let req = https.request(options, (res) => {
      res.on('data', (d) => {
        try{
          resolve(d.toString('utf8'));
        } catch(ex) {
          reject(ex);
        }

      });
    });

    req.on('error', (e) => {
      reject(e);
    });
    req.end();
  });
}

// create entities
async function createEntities() {
	// query types for entity names
	var data = await getData('select distinct ?class where { ?s a ?class .}');
	var res = data.split(/\r?\n/); 

	// remove first and last element of array    
	res.shift();
	res.pop(); 

	var i;
    for (i = 0; i < res.length; i++) {

		var splittedURI = res[i].split(/#|\//);
		var entityTypeName = splittedURI[splittedURI.length-1]

		splittedURI.pop();
		var prefix = splittedURI.join('/') + '/';

		// query annotations for entity values
		var data2 = await getData('prefix p: <' + prefix + '> prefix sc: <http://schema.org/> select ?name where { ?resource  a p:'+ entityTypeName +' . ?resource sc:name ?name . }');
	
		var names = data2.split(/\r?\n/); 

		names.shift();
		names.pop();

		var json = '{"displayName": "' + entityTypeName + '", "kind": "KIND_MAP", "entities":[ ';

    	var j;
		for (j = 0; j < names.length; j++) {
			if(names[j] !== '') {
		  		json = json + '{"value": "' + names[j] + '", "synonyms": ["' + names[j] +'"]}';
		  		if(j != names.length-1) {
		  			json = json + ', ';
		  		}
		  	}
		}

		json = json + ']}';

		var jsonObj = JSON.parse(json);
	
		const entityType = jsonObj;

		const entityTypeRequest = {
			parent: agentPath,
			entityType: entityType,
		};

		entitiesClient
		   .createEntityType(entityTypeRequest)
		   .then((responses) => {
		     console.log('Created new entity type:', JSON.stringify(responses[0]));

		   }).catch((err) => {
		     console.error('Error creating entity type:', err);
		   })

	}
}

createEntities();
