const express = require('express')
const app = express()


//So that the Mongodb Script Runs connects to the database ONLY
const mongoose = require('./db/mongoose.js')
const port = process.env.PORT || 3000
app.use(express.json())


const Student = require('./models/studentModel.js')
const Teacher = require('./models/teacherModel.js')

const studentRouter = require('./routers/student')
const teacherRouter = require('./routers/teacher')
const courseRouter = require('./routers/course')
const eventRouter = require('./routers/event')


app.use(studentRouter)
app.use(teacherRouter)
app.use(courseRouter)
app.use(eventRouter)





app.listen(port , () =>{
    console.log(`Server is up on https://localhost:${port}`)
})