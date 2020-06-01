# oc_seminar_group2.3

Work done so far:
  - Created another Heroku app for testing purposes => https://test-app-ocs2020.herokuapp.com/
  
  - Succesfully establish a connection between the app's; Dialogflow, Heroku and GraphDB
  
  - Able to get successfull answers for the following intents:
    - Annotation Editor
    - Knowledge Generation Tool
    - NLP Task Explanation => Co-reference resolution, Semantic role labeling, Relation Extraction, Syntactic parsing, Chunking,
      Part of speech tagging, Sentence Boundary Disambiguation, Lemmatization, Tokenization, Stemming
      
  - Following changes been made during the test process:
    - New entitiy crated = 'name' ( Since the query takes a 'name' argument, entity is named so )
    - Fulfillment url is changed to https://test-app-ocs2020.herokuapp.com/testApp
    - Webhook call is activated for the intents listed above.
    
Work to do:
  - 2 responses return for the entity type of 'Named Entity Recognition' so it should be handled.
  - Query design for rest of the entities.
