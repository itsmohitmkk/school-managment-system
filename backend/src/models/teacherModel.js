const mongoose = require('mongoose')
const validator =  require('validator')

const jwt = require('jsonwebtoken')
const Student = require('./studentModel')

const Course = require('./courseModel')
const { Timestamp } = require('bson')


const teacherSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    }, 
    email :{
        type :String,
        unique: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Write correct EMAIL');
            }
        }
    },
    password : {
        type : String,
        required : true,
        default: false
    },
    //It contaid ID of the user who created the task
    // createdCourse : [{
    //     type : mongoose.Schema.Types.ObjectId,
    //     ref :'Course'
    // }],
    tokens :[{
        token :{
            type : String,
            required : true
        }
    }]
})

//1. Awhich teacher is owner of which course
teacherSchema.virtual('course-teacher' , {
    ref : 'Course',
    localField : '_id',
    foreignField : 'owner'
})


//3. Logging IN

teacherSchema.statics.findByCredentials = async(email , password) => {
    const user = await Teacher.findOne({email})

    if(!user){
        throw new Error("Unable to Login")
    }

    const isMatch = (password === user.password)
    
    if(!isMatch){
        throw new Error("Unable to Login")
    }

    return user
}


teacherSchema.methods.generateTokens = async  function(){
    const user = this
    console.log(user)
    const token =  jwt.sign({_id : user._id.toString()} , "thiscourseisshit")
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token
}

const Teacher = mongoose.model('Teacher' , teacherSchema)
module.exports = Teacher