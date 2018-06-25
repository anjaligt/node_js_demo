var http = require("http");
http.createServer( function (request, response){
	response.writeHead('200', {'Content-Type': 'text/plain'});
	response.end('Hello world\n');
}).listen(8081);
console.log('Server running at http://127.0.0.1:8081/');

console.log(__dirname); /*Its a global variable use for getting dirname*/
console.log(__filename); /*Its a global variable use for getting filename*/

/*setInterval and clearInterval function*/
var time = 0;
var timer = setInterval(function(){
time += 2;
console.log(time + ' second have passed');
if(time > 5)
{
	clearInterval(timer);
}
},2000);


/*normal function statement*/

function sayHello()
{
	console.log('Hello');
}
sayHello();

/*function expression*/
var sayBye = function sayBye(){
	console.log('bye');
}
sayBye();