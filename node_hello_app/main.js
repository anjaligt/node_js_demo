var http = require('http');

http.createServer(function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Hello! First node appliaction\n');
}).listen(3000);

console.log('Server started');