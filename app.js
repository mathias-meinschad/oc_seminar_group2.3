var express = require('express');
var app = express();

var port = process.env.PORT || 8080;


app.get('/', (req, res) => {
	res.status(200).send('Server is working.')
})

app.listen(port, () => {
	console.log(`🌏 Server is running at https://intelligent-textbook.herokuapp.com:${port}`)
})

app.post('/testApp', (req, res) => {
    console.log('Received call from google assistant');
    
    if (req.body.inputs && req.body.inputs.rawInputs && req.body.inputs.rawInputs.query) {
        console.log(req.body.inputs.rawInputs.query);
    }
    
    console.log('Returning smth to google assistant');
    return res.json({
        "expectUserResponse": false,
        "finalResponse": {
            "richResponse": {
            "items": [
                {
                "simpleResponse": {
                    "textToSpeech": "Good bye"
                }
                }
            ]
            }
        }
    })
})