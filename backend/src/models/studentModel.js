const mongoose = require('mongoose')

const studentSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    }, 
    password : {
        type : String,
        required : true,
        default: false
    },
    //It contaid ID of the user who created the task
    // owner : {
    //     type : mongoose.Schema.Types.ObjectId,
    //     required : true,
    //     //USing reference (ref) you can get all the data instead of only ID
    //     ref :'User'
    // }


})
const Student = mongoose.model('Student' , studentSchema)

module.exports = Student