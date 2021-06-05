const mongoose = require('mongoose')
const validator =  require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Student = require('./studentModel')
// const Teacher = require('./teacherModel')
const Course = require('./courseModel')
const { Timestamp } = require('bson')


const teacherSchema = new mongoose.Schema({
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
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        ref :'Course'
    }
})

//1. Awhich teacher is owner of which course
teacherSchema.virtual('courses' , {
    ref : 'Course',
    localField : '_id',
    foreignField : 'owner'
})

//2. Dleteing All the courses created by that teacher

teacherSchema.pre('remove' , async function (next){
    const user = this
    await Course.deleteMany({owner : user._id})
    next()
})




//3. Logging IN

teacherSchema.statics.findByCredentials = async(email , password) => {
    const user = await Teacher.findOne({email})

    if(!user){
        throw new Error("Unable to Login")
    }

    const isMatch = password.localeCompare(user.password)
    
    if(!isMatch){
        throw new Error("Unable to Login")
    }

    return user
}


teacherSchema.methods.generateTokens = async  function(){
    const user = this
    //Here we are adding id property to the token It can be accessed back using token._id so we can verify the user
    const token =  jwt.sign({_id : user._id.toString()} , "thiscourseisshit")
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

const Teacher = mongoose.model('Teacher' , teacherSchema)
module.exports = Teacher