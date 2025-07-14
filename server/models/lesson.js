const mongoose = require('mongoose')
const lessonschema = new mongoose.Schema({
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course'
    },
    title:{
        type:String,
        required:true
    },
    videourl:{
        type:String
    },
    pdfurl:{
        type:String
    },
    content:{
        type:String
    },
    duration: {
        type: Number, // in minutes
        default: 0
    },
    order:{
        type:Number
    },
    free: {
        type: Boolean,
        default: false
    },
    resources: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true }, // e.g. PDF, ZIP, Link
        url: { type: String, required: true }
      }
    ]
})
module.exports = mongoose.model('Lesson' , lessonschema)