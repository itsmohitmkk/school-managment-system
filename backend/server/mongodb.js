const mongodb = require('mongodb')

//Name should be as it is MongoClient
var MongoClient = mongodb.MongoClient
const connectionURl = 'mongodb://127.0.0.1:27017'
const databaseName = 'school-managment-system'

MongoClient.connect(connectionURl , {useNewUrlParser : true} , (error,client)=>{
    if(error){
        return console.log("Error occured")
    }
    console.log("connected")
})