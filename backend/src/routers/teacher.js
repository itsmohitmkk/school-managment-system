const express = require('express')
const router = new express.Router()
const Teacher = require('../models/teacherModel')
const authT = require('../authentication/authTeacher')
const Course = require('../models/courseModel')



//1. CREATING THE TEACHER
router.post('/teacher' , async (req,res) =>{
    console.log(req.body)

    const user = new Teacher(req.body)
    try{
        await user.save()
        const token = await user.generateTokens()
        res.status(200).send({user,token})
    }catch(error) {
        console.log(error)
        res.status(400).send(error)
    }       
})


// 2. LOGGING IN OF TEACHER
router.post('/teacher/login' ,  async(req,res) =>{
    try{
        const user =  await Teacher.findByCredentials(req.body.email , req.body.password)
        
        const token = await user.generateTokens()
    
         res.status(200).send({user,token})
    }catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})


//3. LOGOUT OF  
router.post('/teacher/logout' ,authT , async(req ,res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Logged out")
    }catch (e){
        res.status(400).send({Error : "Already Logged Out"})
    }
})


//4. CREATING IN THE COURSES

router.post('/teacher/courseCreation' , authT , async(req, res) => {
    try{
        const course = await Course.findOne({name:req.body.name , id: req.body.id})

        if(course)
            throw new Error("Course already found. Enter Again!!")
    
        const newCourse = new Course({            
            ...req.body,
            owner : req.user
        })
        await newCourse.save()
        
        // async function x(){
        // req.user.createdCourse = req.user.createdCourse.concat(newCourse)
        // await req.user.save()
        // }

        // x()
        // console.log(req.user)
        res.status(200).send(newCourse)

    }catch(error){
        console.log(error)
        res.status(400).send(error)
    }

})



//4. DELETION IN THE COURSES

router.delete('/teacher/deleteCourse' ,authT , async(req,res) =>{

    try{
        
        //IS COUSE PRESENT??
        const course = await Course.findOne({name:req.body.name , id: req.body.id})

        if(course)
            throw new Error("Course already found. Enter Again!!")
    
        
        //IS COURSE CREATED BY THAT TEACHER??
        if(req.user._id !== course.owner._id){
            throw new Error("You have not created this course")
        }

        // await Course.findOneAndDelete({name:req.body.name , id: req.body.id})
        await course.delete()

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})


// 5. ALL ENROLLED COURSE

router.get('/teacher/getcourses' , authT , async (req, res) => {
    try{
       
        let course
        if(req.query.id){
             course = await Course.findOne({id:req.query.id , owner : req.user._id })
           
        }


        else if(req.query.name){
             course = await Course.findOne({name:req.query.name , owner : req.user._id })            
        
        }

        else{
            course = await Course.find({owner : req.user._id})
        }

        if(!course){
            throw new Error("No course is found")
        }
        res.status(200).send(course)
    }catch (e){
        console.log(e)
        res.status(400).send(e)
    }
})



// 6. UPDATING THE COURSE

router.patch('/teacher/update' ,authT, async(req, res) =>{

    // const  options = ['name' , 'id']
    // const provided = Object.keys(req.body)
    // //for checking the vlidity for it
    // const isValid = provided.every((item) =>{
    //     return  options.includes(item)
    // })
    
    // if(!isValid){
    //     return res.status(404).send("Please Enter a valid operation")
    // }

    // try{
    //     console.log(req.query)

    //     //Parameter for which course to update
    //     let course
    //     if(req.query.id){
    //         course = await Course.findOne({id:req.query.id})
    //     }
    //     else if(req.query.name){
    //         course = await Course.findOne({name:req.query.name})
    //     }else{
    //         throw new Error("Please provide a course name/id to update")
    //     }

    //     if(!course){
    //         return res.status(500).send("No such Course")
    //     }

    //     provided.forEach(myFunction)

    //      function myFunction(item, index)
    //     {
    //         if(item === "name"){
    //             course.name = req.body.name
    //         }
    //         if(item === "id"){
    //             course.id = req.body.id
    //         }
    //     }
    //     // console.log(course)
    //     await course.save()



    // dlmdc

    // }catch(e) {
    //     console.log(e)
    //     res.status(500).send(e)
    // }

    try{

        //FIND IF COURSE IS PRESENT AND THAT TEACHER OWNS IT
        const course = await Course.updateOne({owner:req.user._id, name:req.query.name} , {name: req.body.name , id:req.body.id })

        if(course.n === 0){
            throw new Error("Unable to find the course")
        }


        res.status(200).send(course.n)

    }catch(e){
        res.status(500).send(e)
    }

})


module.exports = router