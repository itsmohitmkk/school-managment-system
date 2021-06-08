const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Student = require('./studentModel')
const Teacher = require('./teacherModel')

const courseSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    }, 
    id : {
        type : String,
        required : true,
        default: false
    },
  
    
    owner : {
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref :'Teacher',
        
    },
    access : [{
        type : mongoose.Schema.Types.ObjectId,       
        ref :'Student'
    }]
})

courseSchema.virtual('courseStudent' , {
        ref : 'Student',
        localField : '_id',
        foreignField : 'access'
})

// courseSchema.virtual('course-teacher' , {
//     ref : 'Teacher',
//     localField : '_id',
//     foreignField : 'owner'
// })

//ID => Teacher/Student ID
//id => Course ID
//isTeacher => To find out which feild to find in 
courseSchema.static.findCourseAccess = async(isTeacher , id , ID) =>{
    const course = await Course.findOne({id})

    if(!course){
        throw new Error("Unable to find any course")
    }
    if(isTeacher){
        const doesContain = Course.findOne({owner : ID})
    }else{
        const doesContain = Course.findOne({access : ID})
    }

    if(!doesContain){
        throw new Error("You cannot access this course")
    }

    return course
}

const Course = mongoose.model('Course' , courseSchema)

module.exports = Course