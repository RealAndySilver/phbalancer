
var cluster = require('cluster');
var path = require('path');
var bodyParser = require("body-parser");
const port = process.env.PORT || 3000;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UNLOCK,PURGE');
    res.header(	'Access-Control-Allow-Headers', 
    			'Content-Type , content-type, Authorization, Content-Length, X-Requested-With, type, token,Cache-Control,If-Modified-Since,if-modified-since, pragma');
    if ('OPTIONS' == req.method) {
      res.sendStatus(200);
    }
    else{
	  next();  
    }
}

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {

        // Replace the dead worker, we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
	const express = require('express');
	const app = express();
	const server = require('http').Server(app);
	
    app.use(allowCrossDomain);

	app.use(bodyParser.json({limit: '50mb'}));
	app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));

	var balancer = require("./balancer.js")(app,cluster.worker);
	
	server.listen(port, () => console.log('listening on port ' + port));

    // Bind to a port
    //app.listen(3000);
    console.log('Worker %d running!', cluster.worker.id);

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//******************************* IMPORTANT ******* IMPORTANT *******************************************//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/////// Garbage collector, server need to be started with the command ' node --expose-gc ./bin/www '///////
/////// This command has been added to the package.json scripts and can be started as ' npm start ' ///////
///////////// This manual garbage collection helps to reduce the footprint significantly //////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//******************************* IMPORTANT ******* IMPORTANT *******************************************//
///////////////////////////////////////////////////////////////////////////////////////////////////////////
setInterval(function(){
  //Garbage collection every 5 seconds.
  global.gc();
}, 1000*5);
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////// End of Garbage Collection ///////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
