//var MongoClient = require('mongodb').MongoClient;
//var url = 'mongodb://localhost:27017/test';
var socket = require('socket.io-client')('http://localhost:3100');
var sendCurrentUsingSocket = function(item, worker){
	if(socket){
		socket.emit('CurrentX', {
	        current: item,
	        worker: worker.id
	    });
    }
};

/*
MongoClient.connect(url, (err, db) => {
    if (err) return console.log(err)
    global_db = db;

    db.collection('realtime').createIndex({date:1}, {unique: false, expireAfterSeconds: 60 }, function(){
	    db.collection('realtime').ensureIndex({date:1}, {unique:false}, function(err, indexName) {
	    	//console.log('Indexed', indexName);
	    });
    });
});
*/

var router = function (app, worker) {
	
    app.post('/mongo-api/big-data', /* upload.array("upload_files"), */ function (req, res) {
		//console.log('Requested from', worker.id)
        res.send("ok");
        var files = req.files;
        var bigdata = req.body;
        var dir = '';
        var vr;
        var tag;
        var file_size;
        var date;
        var file_path = '';

        if (files) {
            for (var i = 0; i < files.length; i++) {
                if (files.length > 1) {
                    vr = bigdata.var[i];
                    tag = bigdata.tag[i];
                    file_size = bigdata.file_size[i];
                    date = new Date(bigdata.date[i]);
                } else {
                    vr = bigdata.var;
                    tag = bigdata.tag;
                    file_size = bigdata.file_size;
                    date = new Date(bigdata.date);
                }
                dir = "./data/tags/" + tag + "/" + vr + "/" + file_size;
                file_path = dir + "/" + files[i].originalname;

                start = new Date();
                writeFile(file_path, files[i].buffer, function (err) {
                    if (err) {
                        console.log('Err:', err);
                    }
                });
                globalArray.push(
                    {
                        tag: tag,
                        val: file_path,
                        date: date,
                        var: vr
                    }
                );
            }
        } else {
	        bigdata = req.body.bigdata;
            sendCurrentUsingSocket(req.body.bigdata, worker);
/*
            MongoClient.connect(url, (err, db) => {
				if(err){
					console.log('Error connecting to database from worker', worker.id)
					return;
				}
				var bulk = db.collection('realtime').initializeUnorderedBulkOp();
				var start = null;
				var finish = null;
				var bulk_available = false;
				let key, sub_key, sub_keys, dt;
				start = new Date();
				console.log('Started upsert from worker '+worker.id+' with ',bigdata.length, ', at second', start.getSeconds());		
								
				for(let i = 0; i< bigdata.length; i++){
					let item = bigdata[i];
					let dt = new Date(item.date);
					
			        bulk.insert({_id:item.tag+':'+item.var+':'+dt.getMinutes()+'.'+dt.getSeconds()+':'+item.val, date:dt});
			        bulk_available = true;
		        }
			    if(bulk_available){
				    bulk.execute(function(err,res){
					    finish = new Date();
					    var time = ((finish.getTime() - start.getTime()) / 1000);
					    console.log('Finished in ',(finish.getTime() - start.getTime())/1000+'s');
						db.close();
				    });
			    }
			    else{
				    console.log('No bulk operation available.');
			    }
		    });
*/
        }
    });
}





module.exports = router;