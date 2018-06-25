var express = require("express");
var app = express();
var port = 3700;

/*app.get("/", function(req, res){
	res.send('It works!!');
});*/


/*This code informs Express where your template files are, and which template engine to use. */
app.set('views', __dirname + '/tpl');
app.set('view engine', "ejs");
app.engine('ejs', require('ejs').__express);
app.get("/", function(req, res){
    res.render("page");
});
app.use(express.static(__dirname + '/public'));


/*code to create listen server*/
var io = require('socket.io').listen(app.listen(port));

/*io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});*/

//app.listen(port);
console.log("Listening on port " + port);

