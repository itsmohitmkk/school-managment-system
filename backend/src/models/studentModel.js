const mongoose = require('mongoose')


// Create a Schema to add timeStamo
const taskSchema = new mongoose.Schema({
    description : {
        type : String,
        required: true
    }, 
    completed : {
        type : Boolean,
        default: false
    },
    //It contaid ID of the user who created the task
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        //USing reference (ref) you can get all the data instead of only ID
        ref :'User'
    }


},{
    timestamps : true
})
const Task = mongoose.model('Task' , taskSchema)

module.exports = Task