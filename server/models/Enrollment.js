const mongoose = require('mongoose')
const studentEnrollschema = new mongoose.Schema({
    student :{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true
    },
    completedlessons:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Lesson'
    }],
    enrolledat:{
        type:Date,
    },
    iscompleted:{
        type:Boolean
    }
})
module.exports = mongoose.model('Enrollment' ,studentEnrollschema )
