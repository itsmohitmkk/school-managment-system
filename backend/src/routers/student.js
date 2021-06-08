const express = require('express')
const router =  express.Router()
const Student = require('../models/studentModel')
const Course = require('../models/courseModel')
const auth = require('../authentication/authStudent')
const { ObjectID } = require('mongodb')



//1. CREATING THE STUDENT
router.post('/student' , async (req,res) =>{
    console.log(req.body)

    const user = new Student(req.body)
    try{
        await user.save()
        const token = await user.generateTokens()
        res.status(200).send({user,token})
    }catch(error) {
        console.log(error)
        res.status(400).send(error)
    }       
})


// 2. LOGGING IN OF STUDENTS
router.post('/student/login' ,  async(req,res) =>{
    try{
        const user =  await Student.findByCredentials(req.body.email , req.body.password, req.body.USN)
        
        const token = await user.generateTokens()
    
         res.status(200).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})


//3. LOGOUT OF DEVICE
router.post('/student/logout' ,auth , async(req ,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Logged out")
    }catch (e){
        res.status(400).send({Error : "Already Logged Out"})
    }
})


//4. ENROLLMENT IN THE COURSES

router.post('/student/enrollment' , auth , async(req, res) => {
    // try{
    //     const course = await Course.findOne({name:req.body.name , id: req.body.id })

    //     if(!course)
    //         throw new Error("No such course is found. Enter Again!!  or aleady Resgisted")
    
    //     //If already Enrolled
    //     const enrolled = (course.access.includes(req.user._id))
        

    //     if(enrolled)
    //         throw new Error("Aready Entolled in course")
        
    //     req.user.enrolledCourse = req.user.enrolledCourse.concat(course)
    //     await req.user.save()
    
    

    //     course.access =  course.access.concat(req.user)
    //     await course.save()
       
        
        
    //     res.status(200).send(course)
    //     console.log(req.user)

    // }catch(error){
    //     console.log(error)
    //     res.status(400).send(error)
    // }
try{

    const course = await Course.findOne({name:req.body.name , id:req.body.id})
    console.log(course)

    // await course.populate('access').execPopulate()

     console.log(course.access.indexOf(req.user._id))
    if(course.access.indexOf(req.user._id)>=0){
        throw new Error('Aready Registed')
    }else{
        course.access = course.access.concat(req.user)
        await course.save()
    }

    console.log(course)
    res.send(course)
    

    

}catch(e){
    console.log("Error" , e)
    res.status(400).send(e)
}

    
})

//4. DELETION IN THE COURSES

router.delete('/student/deleteCourse' ,auth , async(req,res) =>{
    
    try{
        // //IF its a valid course
        // const course = await Course.findOne({name:req.body.name , id: req.body.id})
        // console.log(course)
        // if(!course)
        //     throw new Error("No such course is found. Enter Again!!")

        // //If enrolled

        // const enrolled = (course.access.indexOf(req.user._id))
        // if(enrolled<0)
        //     throw new Error("Not Entolled in course")

        // course.access.splice(enrolled , 1)

        // await course.save()
        
        // // Deleting from student
        // async function y(){
        //     const studentCourse = req.user.enrolledCourse.indexOf(course._id)
        //     req.user.enrolledCourse.splice(studentCourse , 1)
        //     await req.user.save()
        // }

        // y()


        // console.log(req.user)

        const course = await  Course.findOne({name:req.body.name , access : req.user._id , id : req.body.id})
        console.log(course)
        const enrolled = (course.access.indexOf(req.user._id))
        course.access.splice(enrolled , 1)

        await course.save()
        console.log(course)
        res.status(200).send(course)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }


})

// 5. ALL ENROLLED COURSE

router.get('/student/getcourses' , auth , async (req, res) => {
    
       
    //     const enrolledItem = req.user.enrolledCourse
    //     if(req.query.id){
    //         enrolledItem.forEach(myFunction);
    //         var done = false 
    //         async function myFunction(item, index)
    //         {
    //             const course = await Course.findOne({_id: item})
    //             console.log(course)
    //             if(course.id === req.query.id && !done){
                
    //                 done = true
    //                 res.status(200).send(course)
    //             }
    //         }

    //        return
    //     }


    //     if(req.query.name){
    //         enrolledItem.forEach(myFunction);
    //         var done = false 
    //         async function myFunction(item, index)
    //         {
    //             const course = await Course.findOne({_id: item})
    //             console.log(course)
    //             if(course.name === req.query.name && !done){
                
    //                 done = true
    //                 res.status(200).send(course)
    //             }
    //         }

    //         return
    //     }

    //     //All the Course a student entrolled in
    //     res.status(200).send(req.user.enrolledCourse)
    // }catch (e){
    //     console.log(e)
    // }

    try{

        const courses = await Course.find({access : req.user._id })
        console.log(courses)
        res.status(200).send(courses)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})













module.exports = router