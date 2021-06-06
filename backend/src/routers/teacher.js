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
            throw new Error("Course AREADY found. Enter Again!!")
    
        const newCourse = new Course({
            //ES6 function to set description and completed and id is loaded manually
            ...req.body,
            owner : req.user
        })
        await newCourse.save()
        
        async function x(){
        req.user.createdCourse = req.user.createdCourse.concat(newCourse)
        await req.user.save()
        }

        x()
        console.log(req.user)
        res.status(200).send(newCourse)

    }catch(error){
        console.log(error)
        res.status(400).send(error)
    }

})



//4. DELETION IN THE COURSES

router.delete('/teacher/deleteCourse' ,authT , async(req,res) =>{
    
    try{

        //Is the course is created by that teacher
        
        const enrolledItem = req.user.createdCourse
        enrolledItem.forEach(myFunction);
        var done = false 
        let courseID
        let deletedCourse
        async function myFunction(item, index)
        {
            const course = await Course.findOne({_id: item})
            
            if(course.id ===req.body.id && !done){
            
                done = true
                deletedCourse = await Course.findOneAndDelete({name:req.body.name , id: req.body.id})
                courseID = deletedCourse._id
            }
        }


        //If its a valid course
        
        if(deletedCourse || !courseID )
            throw new Error("No such course is found. Enter Again!!")

        
        
        // Deleting from Teacher
        async function x(courseID){
            console.log("********************")
            console.log(deletedCourse)
            const teacherCourse = req.user.createdCourse.indexOf(courseID)
            req.user.createdCourse.splice(teacherCourse , 1)
            await req.user.save()
            

        }

        x(courseID)


        res.status(200).send(deletedCourse)

    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})


// 5. ALL ENROLLED COURSE

router.get('/teacher/getcourses' , authT , async (req, res) => {
    try{
       
        const enrolledItem = req.user.createdCourse
        if(req.query.id){
            enrolledItem.forEach(myFunction);
            var done = false 
            async function myFunction(item, index)
            {
                const course = await Course.findOne({_id: item})
                console.log(course)
                if(course.id === req.query.id && !done){
                
                    done = true
                    res.status(200).send(course)
                }
            }

           return
        }


        if(req.query.name){
            enrolledItem.forEach(myFunction);
            var done = false 
            async function myFunction(item, index)
            {
                const course = await Course.findOne({_id: item})
                console.log(course)
                if(course.name === req.query.name && !done){
                
                    done = true
                    res.status(200).send(course)
                }
            }

            return
        }

        //All the Course a student entrolled in
        res.status(200).send(req.user.createdCourse)
    }catch (e){
        console.log(e)
    }
})



// 6. UPDATING THE COURSE

router.patch('/teacher/update' ,authT, async(req, res) =>{

    const  options = ['name' , 'id']
    const provided = Object.keys(req.body)
    //for checking the vlidity for it
    const isValid = provided.every((item) =>{
        return  options.includes(item)
    })
    
    if(!isValid){
        return res.status(404).send("Please Enter a valid operation")
    }

    try{
        console.log(req.query)

        //Parameter for which course to update
        let course
        if(req.query.id){
            course = await Course.findOne({id:req.query.id})
        }
        else if(req.query.name){
            course = await Course.findOne({name:req.query.name})
        }else{
            throw new Error("Please provide a course name/id to update")
        }

        if(!course){
            return res.status(500).send("No such Course")
        }

        provided.forEach(myFunction)

         function myFunction(item, index)
        {
            if(item === "name"){
                course.name = req.body.name
            }
            if(item === "id"){
                course.id = req.body.id
            }
        }
        // console.log(course)
        await course.save()

    }catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})







module.exports = router