const mongoose = require('mongoose')
//We use mongoose so that we can provide some authentication to the api we are making
//Url Remains the same


mongoose.connect('mongodb://127.0.0.1:27017/school-managment-system' , {
    useNewUrlParser : true,
    useCreateIndex : true
})
