const Course = require('../models/course');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/lesson');
const cloudinary = require('../config/cloudinary');

// Helper to extract Cloudinary public_id from URL
function getPublicIdFromUrl(url) {
  if (!url) return null;
  // Example: https://res.cloudinary.com/demo/video/upload/v1234567890/folder/filename.mp4
  // public_id: folder/filename (without extension)
  try {
    const parts = url.split('/');
    // Remove version and domain
    const folderAndFile = parts.slice(7).join('/');
    // Remove extension
    return folderAndFile.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}

const createcourse = async (req, res) => {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { title, description, instructor, category, thumbnail, videoUrl, isFree, price } = req.body
    try{
        const course = await Course.create({
            title,
            description,
            instructor,
            category,
            thumbnail,
            videoUrl,
            isFree,
            price
        });
        res.status(201).json(course)
    } 
    catch(err){
        res.status(400).json({message:err.message})
    }
}
const getallcourses = async (req , res)=>{
    try{
        const courses = await Course.find().populate('instructor' , 'email')
        res.status(201).json(courses)
    }
    catch(err){
        res.status(400).json({message:err.message})

    }
}
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'email');
    if (!course) return res.status(400).json({ message: 'course not found' });

    // Get students enrolled
    const studentsEnrolled = await Enrollment.countDocuments({ course: course._id });
    // Get all lessons for this course
    const lessons = await Lesson.find({ course: course._id });
    // Sum durations
    const duration = lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

    res.status(200).json({
      ...course.toObject(),
      studentsEnrolled,
      duration, // in minutes
      certificate: course.certificate,
      access: course.access
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCourse = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const courseId = req.params.id;
    const updateFields = req.body;
    const updated = await Course.findByIdAndUpdate(courseId, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCourse = async (req, res) => {
  console.log('🗑️ Delete course controller called');
  console.log('🗑️ User from request:', req.user);
  console.log('🗑️ Course ID:', req.params.id);
  
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      console.log('❌ Access denied - user not admin:', req.user);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const courseId = req.params.id;
    console.log('🗑️ Proceeding with deletion of course:', courseId);
    
    // Find all lessons for this course
    const lessons = await Lesson.find({ course: courseId });
    console.log('🗑️ Found lessons to delete:', lessons.length);
    
    // Delete each lesson's files from Cloudinary
    for (const lesson of lessons) {
      if (lesson.videourl) {
        const publicId = getPublicIdFromUrl(lesson.videourl);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      }
      if (lesson.pdfurl) {
        const publicId = getPublicIdFromUrl(lesson.pdfurl);
        if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      }
    }
    
    // Delete all lessons for this course
    await Lesson.deleteMany({ course: courseId });
    console.log('🗑️ Lessons deleted');
    
    // Delete the course itself
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) {
      console.log('❌ Course not found');
      return res.status(404).json({ message: 'Course not found' });
    }
    
    console.log('✅ Course deleted successfully');
    res.json({ message: 'Course and all associated lessons/files deleted' });
  } catch (err) {
    console.error('❌ Error in deleteCourse:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createcourse, getallcourses, getCourseById, deleteCourse, updateCourse };