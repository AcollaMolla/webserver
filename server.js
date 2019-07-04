const express = require('express');
const app = express();
var mongo = require('mongodb');
var multer = require('multer');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/db";
var storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads')
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + '-' + file.originalname)
    }
})
var upload = multer({storage: storage }).single('file');

app.use(express.json());
app.use(function(req, res, next){
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    
        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
    
        // Pass to next layer of middleware
        next();
});
let settings = [
    {
        "backgroundColor" : "#282c34",
        "isImage" : "false",
        "url" : "null"
    }
]

const images = [
        {original: 'http://lorempixel.com/1000/600/nature/1/'},
        {original: 'http://lorempixel.com/1000/600/nature/2/'},
        {original: 'http://lorempixel.com/1000/600/nature/3/'}
]

app.get('/', (req,res) => {
    res.send("hej");
});

/*app.get('/settings/:id', (req, res) => {
    getFromDb("userSettings", req.params.id, function(callback){
        console.log(callback);
        res.send(callback);
    });
});

app.post('/settings/:id', (req, res) => {
    settings = [
        {
            backgroundColor : req.body.backgroundColor,
            isImage: req.body.isImage,
            url: req.body.url
        }
    ]
    console.log("ID = " + req.params.id);
    updateDbRecord("userSettings", req.params.id, settings, function(callback){
        console.log(callback);
        res.send(callback);
    });
});

app.get('/stocks', (req, res) => {
    getFromDb("stocks", null, function(callback){
        res.send(callback);
    })
});

app.post('/stocks', (req, res) => {
    const stock = {
        name: req.body.name,
        buyDate: req.body.buyDate,
        sellDate: req.body.sellDate
    };
    postToDb(stock, "stocks");
    res.send(stock);
});

app.get('/fishing', (req, res) => {
    getFromDb("fishing", null, function(callback){
        res.send(callback);
    })
});

app.post('/fishing', (req, res) => {
    const fish = {
        species: req.body.species,
        catchDate: req.body.catchDate,
        weight: req.body.weight,
        length: req.body.length
    }
    postToDb(fish, "fishing");
    res.send(fish);
})
*/
app.get('/images', (req, res) => {
    res.sendFile(__dirname + '/uploads/images/test.jpg');
});

app.post('/images', (req, res) => {
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            return res.status(500).json(err)
        }
        else if(err){
            return res.status(500).json(err)
        }
        return res.status(200).send(req.file)
    })
});

var server = app.listen(8081, function () {
    console.log("Example app listening at localhost:8081");
 })

function postToDb(record, collection){
    MongoClient.connect(url, function(err, db){
        if(err)throw err;
        var dbo = db.db("db");
        dbo.collection(collection).insertOne(record, function(err, res){
            if(err)throw err;
            console.log("1 doc added");
            db.close();
        });
    });
 }

function getFromDb(collection, param, callback){
    console.log("Param = " + param);
    if(param === null || typeof(param) === 'undefined'){
        MongoClient.connect(url, function(err, db){
            var dbo = db.db("db");
            dbo.collection(collection).find({}).toArray(function(err, result){
                if(err)throw err;
                console.log("Fetched from db");
                callback(result);
                db.close();
            });
        });
    }
    else{
        MongoClient.connect(url, function(err, db){
            var dbo = db.db("db");
            dbo.collection(collection).find({"userId" : param}).toArray(function(err, result){
                if(err)throw err;
                console.log("Fetched from db");
                callback(result);
                db.close();
            });
        });
    }
 }

 function updateDbRecord(collection, param, record, callback){
     console.log("Param = " + param);
     console.log("Bg color: " + record[0].backgroundColor);
     MongoClient.connect(url, function(err, db){
         var dbo = db.db("db");
         dbo.collection(collection).updateOne(
            {"userId": param}, 
            {
                $set: {
                        backgroundColor : record[0].backgroundColor,
                        isImage : record[0].isImage,
                        url : record[0].url
                      }
            },
            {
                upsert:true
            }
         );
        db.close();
     });
 }