import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import { v2 as cloudinary } from 'cloudinary';
import { getAuth } from "@clerk/express";

// Helper: get userId from either Clerk middleware or our manual fallback
const getClerkUserId = (req) => getAuth(req)?.userId || req.clerkUserId || null;

export const getUserData = async (req, res) => {
  try {
    const userId = getClerkUserId(req);

    if (!userId) {
      return res.json({ success: false, message: 'Not authenticated' });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user });
  } catch (error) {
    console.error("getUserData error:", error);
    return res.json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.userId || req.clerkUserId || req.body.clerkId;
    const { name, email, image } = req.body;

    console.log("📥 createUser: clerkId from auth =", auth?.userId, "| body.clerkId =", req.body.clerkId, "| email =", email ? "present" : "missing");

    if (!clerkId) {
      return res.json({
        success: false,
        message: "Missing clerkId. Are you signed in with Clerk?",
      });
    }
    if (!email || !String(email).trim()) {
      return res.json({
        success: false,
        message: "Missing required field: email.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const safeName =
      name && String(name).trim().length > 0
        ? String(name).trim()
        : (normalizedEmail.split("@")[0] || "User");

    const safeImage =
      image && String(image).trim().length > 0
        ? String(image).trim()
        : "https://ui-avatars.com/api/?name=" + encodeURIComponent(safeName);

    // Try to find by clerkId or email
    let existing = await User.findOne({ clerkId });
    if (!existing) {
      existing = await User.findOne({ email: normalizedEmail });
    }

    if (existing) {
      // Ensure clerkId and basic profile are up to date
      existing.clerkId = clerkId;
      if (!existing.name) existing.name = safeName;
      if (!existing.image) existing.image = safeImage;
      existing.email = normalizedEmail;
      await existing.save();
      console.log("✅ User updated in DB for clerkId:", clerkId);
      return res.json({ success: true, user: existing });
    }

    const user = await User.create({
      clerkId,
      name: safeName,
      email: normalizedEmail,
      image: safeImage,
    });
    console.log("✅ User created in DB for clerkId:", clerkId);
    return res.json({ success: true, user });
  } catch (error) {
    console.error("❌ User creation error:", error);

    // Handle duplicate key (email or clerkId) gracefully
    if (error.code === 11000) {
      try {
        const user = await User.findOne({
          $or: [
            { clerkId: getAuth(req).userId },
            { email: req.body.email },
          ],
        });
        if (user) {
          return res.json({ success: true, user });
        }
      } catch (innerErr) {
        console.error("❌ Error resolving duplicate user:", innerErr);
      }
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};


export const applyForJob = async (req, res) => {
  try {
    const userId = getClerkUserId(req);
    if (!userId) {
      return res.json({ success: false, message: 'Not authenticated' });
    }
    const { jobId } = req.body;

    const isAlreadyApplied = await JobApplication.findOne({ jobId, userId });

    if (isAlreadyApplied) {
      return res.json({
        success: false,
        message: "Already applied.",
      });
    }

    const jobData = await Job.findById(jobId);
    if (!jobData) {
      return res.json({
        success: false,
        message: "Job not found.",
      });
    }

    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });

    return res.json({
      success: true,
      message: "Applied successfully.",
    });

  } catch (error) {
    console.error("applyForJob error:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserJobApplication = async (req, res) => {
  try {
    const userId = getClerkUserId(req);
    if (!userId) {
      return res.json({ success: false, message: 'Not authenticated' });
    }

    const applications = await JobApplication.find({ userId })
      .populate('companyId', 'name email image')
      .populate('jobId', 'title description location category status salary')
      .exec();

    return res.json({
      success: true,
      applications: applications || [], // ✅ Always return array
    });

  } catch (error) {
    console.error("getUserJobApplication error:", error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserResume = async (req, res) => {
  try {
    const userId = getClerkUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please sign in and retry.',
      });
    }

    const resumeFile = req.file;

    if (!resumeFile || !resumeFile.buffer) {
      return res.status(400).json({
        success: false,
        message: "No resume file uploaded. Please send resume in field 'resume'.",
      });
    }

    if (resumeFile.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file.',
      });
    }

    const userData = await User.findOne({ clerkId: userId });
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please create your profile first.",
      });
    }

    // Upload PDF buffer as a stream to Cloudinary
    // resource_type 'raw' + .pdf extension ensures correct Content-Type on delivery
    const publicId = `resumes/${userData.clerkId}`;
    const resumeUrl = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: publicId,
          format: 'pdf',
          overwrite: true,
          use_filename: false,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(resumeFile.buffer);
    });

    userData.resume = resumeUrl;
    await userData.save();

    return res.json({
      success: true,
      message: "Resume updated successfully.",
      user: userData,
    });
  } catch (error) {
    console.error("updateUserResume error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Resume upload failed. Please try again.',
    });
  }
};
