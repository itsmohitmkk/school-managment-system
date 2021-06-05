const express = require('express')
const router = new express.Router()
const Course = require('../models/courseModel')
// const auth = require('../authentication/auth')

router.post('/course' , async (req,res) =>{
    console.log(req.body)

    const user = new Course(req.body)
    try{
        await user.save()
        
        res.status(200).send(user)
    }catch(error) {
        console.log(error)
        res.status(400).send(error)
    }       
})





module.exports = router