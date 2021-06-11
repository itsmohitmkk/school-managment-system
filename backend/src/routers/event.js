const express = require('express')
const mongoose = require('mongoose')
const Event = require('../models/eventModel')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const auth = require('../authentication/authStudent')

const path = require('path')
const { findOne } = require('../models/eventModel')

const router = express.Router()

// Create Event: // Authorization to be added
router.post('/event', auth, async (req, res) => {
    const event = new Event(req.body)
    event.creatorID = mongoose.Types.ObjectId(req.user._id)
    event.onModel = (req.user.constructor.modelName).toLowerCase().concat('', 's')

    try {
        await event.save()
        res.status(201).send({ event })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/event/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'start_date', 'end_date', 'last_date_reg', 'links', 'institution']
    const updates = Object.keys(req.body)
    const validRequest = updates.every((update) => allowedUpdates.includes(update))
    if(!validRequest) {
        return res.status(400).send({ error: 'Cannot update one or more specified fields!' })
    }

    try {
        const event = await Event.findOne({ _id: req.params.id, creatorID: req.user._id })
        updates.forEach((update) => event[update] = req.body[update])
        await event.save()

        res.status(200).send()

    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = './event/images/' + req.params.id
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }
        cb(null, './event/images/' + req.params.id)
    },
    filename: async (req, file, cb) => {

        const dirPath = './event/images/' + req.params.id
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath)
        }
        const files = fs.readdirSync(dirPath)
        var lastFileName = files[files.length-1]
        // console.log(lastFileName);
        if(!lastFileName) {
            lastFileName = '0.png'
        }
        lastFileName = (Number(lastFileName.slice(0, -4)) + 1).toString()

        cb(null, lastFileName + '.png')
    }
})

const upload = multer({
    limits: {
        fileSize: 6 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Allowed file extensions: *.jpg/*.jpeg/*.png'))
        }
        cb(undefined, true)
    },
    storage
})

const imgCheckMiddleware = async (req, res, next) => {
    try {
        // const exists = await Event.exists({ _id: (req.params.id) })
        const dirPath = './event/images/' + req.params.id

        // if (!exists) {
        //     return res.status(400).send({ error: 'No event with id "' + req.params.id + '" exists!' })
        // }

        const event = await Event.findOne({ _id: req.params.id, creatorID: req.user._id })
        if(!event) {
            return res.status(404).send({ error: 'No such event found' })
        }
        // console.log(event, req.user._id)

    } catch (e) {
        res.status(400).send(e)
    }


    // if(fs.existsSync(dirPath) && !(4-fs.readdirSync(dirPath).length >= req.files.length)) {
    //     return res.status(400).send({ error: '4 images are allowed at most!!!' })
    // }

    // const imgVacancy = (4-fs.readdirSync(dirPath).length)
    // const uploadMW = upload.array('images', imgVacancy)
    // uploadMW(req, res, (req, res, async () => { // calling a middleware
    //     for(img in req.files) {
    //         await sharp(img).png()
    //     }
    // }))

    next()
}

router.post('/event/:id/media', auth, imgCheckMiddleware, upload.array('images', 5), async (req, res) => {

    // for(img in req.files) {
    //     img = await sharp(img).resize({width: 25, height: 25}).png()
    // }

    res.status(200).send('okie')
}, (error, req, res, next) => {
    res.status(500).send({ error: error.message })
})

// Display all events. queries:
// sortBy=field-asc/desc
// upcoming=false(by would be true by default)
// institution=institutionName
router.get('/event', async (req, res) => {
    const toMatch = {}
    const sort = { 'start_date': -1 }

    if (req.query.sortBy) {
        const sortBy = req.query.sortBy.split('-')
        sort[sortBy[0]] = sortBy[1] === 'asc' ? 1 : -1
    }

    if (req.query.start_date === undefined) {
        const currentDate = Date.now()
        toMatch['start_date'] = { '$gte': currentDate }

    } else {
        const temp = req.query.start_date.split('-')

        if (temp[0] === 'within') {
            const tillDate = Date.now() + temp[1] * 24 * 60 * 60 * 1000
            toMatch['start_date'] = { '$gte': Date.now(), '$lte': tillDate }
            sort['start_date'] = 1

        } else if (temp[0] == 'bw') {
            toMatch['start_date'] = { '$gte': temp[1], '$lte': temp[2] }
            sort['start_date'] = 1
        }
    }

    // if(req.query.after) {
    //     toMatch['$expr'] = { '$gt': [ '$start_date', req.query.after ] }
    // }

    if (req.query.institution) {
        toMatch['institution'] = req.query.institution
    }

    try {
        const events = await Event.find(toMatch, null, {
            sort
        })
        res.status(200).send(events)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/events/images/:id/:file', (req, res) => {
    try {
        var id = req.params.id
        var file = req.params.file

        const filePath = path.resolve('event/images/' + id + '/' + file)

        res.sendFile(filePath)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.delete('/event/images/:id', auth, async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, creatorID: req.user._id })
        if(!event) {
            throw new Error('No event with id ' + req.params.id + ' found')
        }

        const dirPath = path.resolve('event/images/' + req.params.id)
        if (fs.existsSync(dirPath)) {
            fs.rmdirSync(dirPath, { recursive: true })
            res.status(200).send()
        }
        else {
            res.status(200).send('Event has no images')
        }

    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

router.delete('/event/:id', auth, async (req, res) => {
    try {
        const event = await Event.findOneAndDelete({ _id: req.params.id, creatorID: req.user._id })
        if (!event) {
            res.status(404).send()
        }
        res.send(event)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router