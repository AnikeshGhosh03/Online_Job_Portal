import express from 'express'
import { applyForJob, getUserData, getUserJobApplication, updateUserResume, createUser } from '../controllers/userController.js'
import upload from '../config/multer.js'
import { requireClerkAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get user data (protected)
router.get('/user', requireClerkAuth, getUserData)

// Create a user record in our DB for the current Clerk user
router.post('/create', requireClerkAuth, createUser)

// Apply for a job (still protected)
router.post('/apply', requireClerkAuth, applyForJob)

// Get applied job data (still protected)
router.get('/applications', requireClerkAuth, getUserJobApplication)

// Update user profile (resume)
router.post('/update-resume', requireClerkAuth, upload.single('resume'), updateUserResume)

export default router;
