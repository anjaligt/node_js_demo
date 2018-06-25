var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : '127.0.0.1',
    user : 'root',
	password : '',
	database : 'node_sql_db'
});

connection.connect( function(err){
	if(err) 
		throw err;
		console.log('You are now connecetd');
});

//to insert record into mysql
connection.query('INSERT INTO `employee` (`employee_name`, `employee_salary`, `employee_age`) VALUES ("Adam", 2000 , 30)', function (error, results, fields) {
  if (error) throw error;
  console.log('The response is: ', results);
});

//to update record into mysql
connection.query('UPDATE `employee` SET `employee_name`="William",`employee_salary`=2500,`employee_age`=32 where `id`=1', function (error, results, fields) {
  if (error) throw error;
  console.log('The response is: ', results);
});

//featch records from mysql database
connection.query('select * from employee', function (error, results, fields) {
  if (error) throw error;
  console.log('The response is: ', results);
});

//end connection
connection.end();