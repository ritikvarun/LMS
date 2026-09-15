import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        default: ""
    },
    pdfUrl: {
        type: String,
        default: ""
    },
    duration: {
        type: String,
        default: ""
    },
    isPreviewFree: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: ""
    },
    videos: [videoSchema]
}, { timestamps: true })

const subjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: ""
    },
    chapters: [chapterSchema]
}, { timestamps: true })

const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    subTitle:{
        type:String
    },
    description:{
        type:String
    },
    category:{
        type:String,
        required:true
    },
    level:{
        type:String,
        enum:['Beginner','Intermediate','Advanced',''],
        default:'Beginner'
    },
    price:{
        type:Number,
        default: 0
    },
    isFree:{
        type:Boolean,
        default:false
    },
    features:[{
        type:String
    }],
    telegramLink:{
        type:String,
        default:""
    },
    thumbnail:{
        type:String
    },
    subjects:[subjectSchema],
    enrolledStudents:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    lectures:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture"
    }],
    creator:{
         type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isPublished:{
     type:Boolean,
     default:false
    }
},{timestamps:true})

const Course = mongoose.model("Course",courseSchema)

export default Course