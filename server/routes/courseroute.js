const express = require('express');
const router = express.Router();
const { createcourse, getallcourses, getCourseById, deleteCourse, updateCourse } = require('../controllers/courseController');
const protect = require('../middleware/authmiddleware');

router.post('/add', protect, createcourse);
router.get('/', getallcourses);
router.get('/:id', getCourseById);
router.delete('/:id', protect, deleteCourse);
router.patch('/:id', protect, updateCourse);
module.exports = router;
