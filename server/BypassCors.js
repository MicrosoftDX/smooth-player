var http = require("http"),
	net = require("net"),
	https = require("https"),
	request = require("request"),
	tunnel = require("tunnel"),
	url = require("url"),
	os = require("os"),
	// httpProxy = require("http-proxy")
	fs = require("fs"),
	portHttps = 3143,
	port = 3129;

var rp = request.defaults({"proxy":"http://p-goodway:3128",'headers': {"Accept-Encoding": "gzip"}});
//var r = request.defaults({"localAddress":"192.168.2.105",'headers': {"Accept-Encoding": "gzip"}});
var r  = null;
process.on('uncaughtException', logError);

function logError(e){
	console.warn('*** ' + e);
}

var ethCard = null,
	ethWifi = null,
	localWifiAddress = null;

function getAvailableIntefaces(){
	var IPs = os.getNetworkInterfaces();
	for(var networkType in IPs){
		if(networkType.indexOf("local")!= -1){
			ethCard = IPs[networkType];
			console.log("found ip on eth card",ethCard);
		}

		if(networkType.indexOf("sans fil")!= -1){
			ethWifi = IPs[networkType];
			console.log("found ip on wifi card",ethWifi);
		}
	}

	if(ethWifi){
		for(var ip in ethWifi){
			var ipObj = ethWifi[ip];
			if(!ipObj.internal && ipObj.family.toLowerCase() == "ipv4"){
				localWifiAddress = ipObj.address;
				console.info("ip to use :: ",localWifiAddress);
			}
		}
	}
}

if(localWifiAddress){
	r = request.defaults({'localAddress':localWifiAddress,'headers': {"Accept-Encoding": "gzip"}});
}else{
	r = request.defaults({'headers': {"Accept-Encoding": "gzip"}});
}

getAvailableIntefaces();

var tunnelAgent = tunnel.httpsOverHttps({
		rejectUnauthorized:false,
		key: fs.readFileSync('./key.pem'),
		cert:fs.readFileSync('./cert.pem')
		// proxy:{
		// 	host:"p-goodway",
		// 	port:3128
		// }
	});

var agent = new http.Agent({
	maxSockets:Infinity
});


var server = http.createServer(function(req,res){
				console.info("HTTP : ",req.url);
				var options = url.parse(req.url);
				options.localAddress = localWifiAddress;
				options.method = req.method;
				options.headers = req.headers;
				options.agent = agent;

				var serverRequest = http.request(options);
				req.pipe(serverRequest);
				serverRequest.on("response",function(serverResponse){
					console.log("response for",req.url);
					res.setHeader("Access-Control-Allow-Origin","*");
					res.setHeader("Access-Control-Allow-Credential","true");
					res.writeHead(serverResponse.statusCode,serverResponse.headers);
					return serverResponse.pipe(res);
				}).on("error",function(error){
					res.writeHead(502);
					return res.end();
				});

				// res.setHeader("Access-Control-Allow-Origin","*");
				// res.setHeader("Access-Control-Allow-Credential","true");
				// req.pipe(r(req.url)).pipe(res);
				
			}).listen(port);

server.addListener("connect",function(req,socket,head){
	console.info("HTTPS : ",req.url);
	var parts = req.url.split(':', 2);
	// open a TCP connection to the remote host
	var conn = net.connect(parts[1], parts[0], function() {
		// respond to the client that the connection was made
		socket.write("HTTP/1.1 200 OK\r\n\r\n");
		// create a tunnel between the two hosts
		socket.pipe(conn);
		conn.pipe(socket);

	});
});

// httpVersion = req.httpVersion,
// 		hostport = getHostPort(url,443),
// 		distantSocket = new net.Socket(),
// 		proxySocket = new net.Socket();
// 		console.info("new socket created");
// 		proxySocket.connect(3128,"p-goodway",function(){
// 			console.info("connection established on proxy");
// 			socketReq.write( "HTTP/" + httpVersion + " 200 Connection established\r\n\r\n" );
// 			// distantSocket.connect(parseInt(hostport[1]),hostport[0],function(){
// 			// 	distantSocket.write(head);
// 	 	// 		console.info("connection established on ",hostport[1],hostport[0]);
// 			// 	// tell the caller the connection was successfully established
// 			// });
// 		});

		

// 		distantSocket.on('end',function () {
// 			proxySocket.end();
// 		});

// 		distantSocket.on('error',function (err) {
// 			proxySocket.write( "HTTP/" + httpVersion + " 500 Connection error\r\n\r\n" );
// 			proxySocket.end();
// 		});

// 		proxySocket.on("end",function(){
// 			socketReq.end();
// 		});

// 		proxySocket.on("data",function(chunk){
// 			distantSocket.write(chunk);
// 		});

// 		proxySocket.on("error",function(err){
// 			socketReq.write( "HTTP/" + httpVersion + " 500 Connection error\r\n\r\n" );
// 			socketReq.end();
// 		});
 
// 		socketReq.on("data",function(chunk) {
// 				proxySocket.write( chunk );
// 		});
 
// 		socketReq.on("end",function () {
// 				proxySocket.end();
// 		});

// 		socketReq.on("error",function(err) {
// 				console.log( '  > ERR: %s', err );
// 				proxySocket.end();
// 		});



// //var ca = fs.readFileSync('./cert.pem');
// var tunnelAgent = new https.Agent({
// 		httpTunnel:{
// 			host:"p-goodway",
// 			port:3128
// 		}
// });
