var http = require("http"),
	request = require("request"),
	port = 3129;

var r = request.defaults({"proxy":"http://p-goodway:3128",'headers': {"Accept-Encoding": "gzip"}});

http.createServer(function(req,res){
	console.log("requesting url",req.url, req.method);
	res.setHeader("Access-Control-Allow-Origin","*");
	res.setHeader("Access-Control-Allow-Credential","true");
	req.pipe(r(req.url)).pipe(res);
}).listen(port);

