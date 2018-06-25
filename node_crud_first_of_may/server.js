const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})) 
app.set('view engine', 'ejs');
app.use(express.static('public'))
const MongoClient = require('mongodb').MongoClient
var db
    MongoClient.connect('mongodb://127.0.0.1:27017/star-wars-quotes', (err, database) => {
    	if (err) return console.log(err)
    		db = database
	     console.log('saved to database')
})

app.listen(3500,function(){
	console.log('Node is working on port 3500');
});

app.get('/', (req,res) => {
	db.collection('quotes').find().toArray((err, result) => {
        if (err) return console.log(err)
        // renders index.ejs
        res.render('index.ejs', {quotes: result})
      })
})

app.post('/quotes', (req, res) => {
       db.collection('quotes').save(req.body, (err, result) => {
        if (err) return console.log(err)
    
        console.log('saved to database')
        res.redirect('/')
      })
})

app.put('/quotes', (req, res) => {
  // Handle put request
  console.log(res);
})
