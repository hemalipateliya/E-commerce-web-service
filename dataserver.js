var express = require('express');
var app = express();
//var fs = require("fs");
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://134.154.48.188/mydb';
var ObjectID = require('mongodb').ObjectID;
var error="Error while connecting to databse";

const redis = require('redis');  
const REDIS_PORT = process.env.REDIS_PORT;
const client = redis.createClient(REDIS_PORT);  


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

 
var array=[];
app.get('/item/:id', function (req, res) {
   
    var uid = req.params.id.toString();
    var returnData;
    
    client.get(uid, function (err, data) {
        if (err) throw err;
            console.log(data);
        if (data != null) {
            console.log("Returning from Redis");
        
            res.json(JSON.parse(data));
            return;
           
            
        } 
        
         MongoClient.connect(url, function(err, db) {
       console.log("Connecting to db");
       
       if(err)
           {
               res.send(error);
           }
       
       
       console.log(ObjectID(uid));
       
       

     db.collection('itemdata').findOne({"_id":ObjectID(uid)},function(err,doc)
                                   
                          { 
         if(!doc)
             {
                 
                 res.send("can not find item for this id");
                 return;
             }
         
        client.setex(uid,3600,JSON.stringify(doc));  
         res.json(doc);
        
    });
   });
        
  
    });
    
    
    
  
});

    

app.post('/item', function(req, res) {
    MongoClient.connect(url, function(err, db){
        
        if(err)

            {
                res.send(error);
                return;
            }
            db.collection('itemdata').insertOne(req.body , function(err, doc) {
            
                if (err)
                {
                    res.send("Error while creating data");
                    return;
                }
                    res.json(req.body);
    
  });
  });      
});


app.delete('/item/:id',function(req,res)
          {
     MongoClient.connect(url, function(err, db)
        {
         if(err)
             {
                 res.send(error);
                 return;
             }
         var uid = req.params.id.toString();
         db.collection('itemdata').remove({"_id":ObjectID(uid)},function(err,obj){
              if (err)
              {
                  res.send("Error while deleting this data");
                  return;  
              }
             
             res.send("Deleted this data");
         });   
     });
});
      




var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port);

});