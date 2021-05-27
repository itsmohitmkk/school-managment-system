const express = require('express')
const app = express()


//So that the Mongodb Script Runs connects to the database ONLY
const mongoose = require('./db/mongoose.js')
const port = process.env.PORT || 3000



const Student = require('./models/studentModel.js')
const Teacher = require('./models/teacherModel.js')

const studentRouter = require('./routers/student')
const teacherRouter = require('./routers/teacher')

// app.use(express.json())

app.use(studentRouter)
app.use(teacherRouter)






app.listen(port , () =>{
    console.log("Server is up on the port ", port)
})