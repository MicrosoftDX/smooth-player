var express = require("express");


var app = express();

// var port =  process.env.PORT || 3000;

// set path to the parent folder 
var dirname = __dirname.replace("server","");




app.use(express.static(dirname));
app.listen(process.env.PORT || 8080);