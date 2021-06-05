const express = require('express')
const router = new express.Router()
const Teacher = require('../models/teacherModel')
const auth = require('../authentication/authTeacher')



//Creation of Teacher
router.post('/teacher' , async (req, res) => {
    const teacher = new Teacher(req.body)
try{
    await teacher.save()
    res.send(teacher)
}catch{
    res.status(400).send(error)
}
})






module.exports = router