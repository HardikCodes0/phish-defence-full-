const mongoose = require('mongoose')
const courseSchema = new mongoose.Schema({
    title:{
        type:String , 
        required:true},
    description:{
        type:String,
    },
    instructor: {
        name: {
            type: String,
            required: true
        },
        experience: {
            type: String,
            default: '5+ Years Experience'
        },
        education: {
            type: String,
            default: 'M.S. Computer Science'
        },
        specializations: [{
            type: String
        }],
        achievements: [{
            type: String
        }],
        about: {
            type: String,
            default: 'Experienced instructor with expertise in cybersecurity and software development.'
        },
        linkedinProfile: {
            type: String
        },
        email: {
            type: String
        },
        title: {
            type: String,
            default: 'Senior Software Engineer & Educator'
        },
        location: {
            type: String,
            default: 'San Francisco, CA'
        },
        students: {
            type: String,
            default: '12,000+ Students Taught'
        },
        courses: {
            type: String,
            default: '15 Courses Created'
        },
        rating: {
            type: String,
            default: '4.8'
        }
    },
    category:{
        type:String
    },
    thumbnail:{
        type:String
    },
    Videourl:{
        type:String
    },
    isFree:{
        type:Boolean
    },
    price:{
        type:Number
    },
    certificate: {
        type: String,
        default: 'Included'
    },
    access: {
        type: String,
        default: 'Lifetime'
    },
    // Rating statistics
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    ratingDistribution: {
        type: Map,
        of: Number,
        default: () => ({
            '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
        })
    }
})
module.exports = mongoose.model('Course' , courseSchema)