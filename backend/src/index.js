const express = require('express')
const app = express()


//So that the Mongodb Script Runs connects to the database ONLY
const mongoose = require('./db/mongoose.js')
const port = process.env.PORT || 3000

app.use(express.json())
// app.use(userRouter)
// app.use(taskRouter)






app.listen(port , () =>{
    console.log("Server is up on the port ", port)
})