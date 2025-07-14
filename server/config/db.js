const mongoose = require('mongoose')
const connectDb = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI , {
            useNewUrlParser:true ,
            useUnifiedTopology:true,
        })
        console.log("mongodb connected")
    }
    catch(err){
        console.error("mongodb connection issue" ,err.message)
        process.exit(1)
    }
}
module.exports= connectDb