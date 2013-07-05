var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
//  response.send('Hello World 2!');
    fs.readFile('index.html', 'utf8', function(err, data){
	if(err){
	    response.send('file not found');
	}else{
	    response.send(data);
	}    
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
