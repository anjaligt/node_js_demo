const express = require('express');
const bodyParser= require('body-parser')
var session = require('express-session');

const app = express();
var mysql      = require('mysql');

var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '',
              database : 'node_crud_db'
            });
 
connection.connect();
global.db = connection;

app.use(bodyParser.urlencoded({extended: true}))
app.set('views', __dirname + '/views');

app.listen(3000, function() {
  console.log('listening on 3000')
})

app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
  // Note: __dirname is directory that contains the JavaScript source code. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})

app.get('/login', (req, res) => {
	res.sendFile(__dirname + '/signin.html');
});//call for login page

app.get('/home/profile', (req, res) => {
	res.sendFile(__dirname + '/dashboard.html');
});//call for login page

app.post('/login', (req, res) => {
  var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
     
      var sql="SELECT id, first_name, last_name, user_name FROM `users` WHERE `user_name`='"+name+"' and password = '"+pass+"'";                           
      db.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].id;
            req.session.user = results[0];
            console.log(results[0].id);
            res.sendFile(__dirname + '/dashboard.html');
         }
         else{
            message = 'Wrong Credentials.';
            res.sendFile(__dirname + '/signin.html');
         }
                 
      });
   } else {
      res.sendFile(__dirname + '/signin.html');
   }
})

app.post('/signup', (req, res) => {
  message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.user_name;
      var pass= post.password;
      var fname= post.first_name;
      var lname= post.last_name;
      var mob= post.mob_no;

      var sql = "INSERT INTO `users`(`first_name`,`last_name`,`mob_no`,`user_name`, `password`) VALUES ('" + fname + "','" + lname + "','" + mob + "','" + name + "','" + pass + "')";

      var query = db.query(sql, function(err, result) {

         message = "Succesfully! Your account has been created.";
         console.log("Succesfully! Your account has been created.")
         res.sendFile(__dirname + '/welcome.html')
      });

   } else {
     res.sendFile(__dirname + '/index.html')
   }
})