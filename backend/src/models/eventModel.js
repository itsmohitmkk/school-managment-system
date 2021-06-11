const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    creatorID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'onModel'
    },
    onModel: {
        type: String,
        required: true,
        enum: ['students', 'teachers']
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date
    },
    last_date_reg: {
        type: Date
    },
    links: [{
        type: String
    }],
    institution: {
        type: String,
        required: true
    }
    // imgCount: {
    //     type: Number
    // }
}, {
    timestamps: true
})

const Event = mongoose.model('Event', taskSchema)

module.exports = Event