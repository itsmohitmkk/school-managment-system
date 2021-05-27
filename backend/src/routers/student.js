const express = require('express')
const router = new express.Router()
const User = require('../models/studentModel')
const auth = require('../authentication/auth')






module.exports = router