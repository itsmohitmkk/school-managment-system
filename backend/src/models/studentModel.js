const mongoose = require('mongoose')
const validator =  require('validator')

const jwt = require('jsonwebtoken')
// const Student = require('./studentModel')
const Course = require('./courseModel')
// const { Timestamp } = require('bson')


const studentSchema = new mongoose.Schema({
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
    USN : {
        type : String,
        require : true,
    },
    tokens :[{
        token :{
            type : String,
            required : true
        }
    }]
})

//1. Linking
studentSchema.virtual('course' , {
    ref : 'Course',
    localField : '_id',
    foreignField : 'access'
})

//2. Logging In


studentSchema.statics.findByCredentials = async(email , password) => {
    const user = await Student.findOne({email :email , password:password})
    if(!user){
        throw new Error("Unable to Login")
    }

    // const isMatchpass = password === user.password
    // const isMatchUSN = USN === user.USN
    // console.log(isMatchUSN , isMatchpass)
    // if(!isMatchpass ){
    //     throw new Error("Unable to Login")
    // }

    return user
}


//Generating Tokens
studentSchema.methods.generateTokens = async  function(){
    const user = this
    
    const token =  jwt.sign({_id : user._id.toString()} , "thiscourseisshit")
    user.tokens = user.tokens.concat({token})
    await user.save()
    
    return token

}

const Student = mongoose.model('Student' , studentSchema)
module.exports = Student