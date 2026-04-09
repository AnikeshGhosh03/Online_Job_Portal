import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from 'cloudinary';
import generateToken from "../utills/generateToken.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";


export const registerCompany = async (req, res) => {
    const { name, email, password } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
        return res.json({ success: false, message: "Missing Details" });
    }

    try {
        const companyExist = await Company.findOne({ email });
        if (companyExist) {
            return res.json({ success: false, message: "Company already registered." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Upload image buffer via stream (memoryStorage has no .path)
        const imageUrl = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: 'company_logos', resource_type: 'image' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }
            );
            stream.end(imageFile.buffer);
        });

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUrl,
        });

        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image,
            },
            token: generateToken(company._id),
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const loginCompany = async (req,res) => {
    const {email, password} = req.body
    try {
        const company = await Company.findOne({email})

        if (await bcrypt.compare(password, company.password)) {
            res.json({
                success : true,
                company : {
                    _id : company._id,
                    name : company.name,
                    email : company.email,
                    image : company.image
                },
                token : generateToken(company._id)
            })
            
        }
        else{
            res.json({
                success : false,
                message : "Invalid email or password."
            })
        }

    } catch (error) {
        res.json({
            success : false,
            message : error.message
        })
        
    }

}

export const getCompanyData = async (req,res) => {
    try {
        const company = req.company
        res.json({
            success : true,
            company
        })
    } catch (error) {
        res.json({
            success : false,
            message : error.message
        })
    }


}

export const postJob = async (req,res) => {
    const {title, description, location, salary, level, category} = req.body
    const companyId = req.company._id;
    
    try {
        const newJob = new Job({
            title,
            description,
            location,
            salary,
            companyId,
            date : Date.now(),
            level, 
            category
        })
        await newJob.save()
        res.json({
            success : true,
            newJob
        })


    } catch (error) {
        res.json({
            success : false,
            message : error.message
        })
    }


    

}

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;

    const applications = await JobApplication.find({ companyId })
      .populate('jobId', 'title location category level salary')
      .lean()
      .exec();

    // userId is a Clerk ID string — resolve users manually via clerkId
    const clerkIds = [...new Set(applications.map(a => a.userId).filter(Boolean))];
    const users = await User.find({ clerkId: { $in: clerkIds } }).lean();
    const userMap = Object.fromEntries(users.map(u => [u.clerkId, u]));

    const enriched = applications.map(app => ({
      ...app,
      userId: userMap[app.userId] || null,
    }));

    return res.json({ success: true, applications: enriched });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// ✅ Get all jobs posted by the logged-in company
export const getCompanyPostedJobs = async (req, res) => {
  try {
    const companyId = req.company._id; // ✅ Fixed this

    const jobs = await Job.find({ companyId }); // ✅ Matches schema

    const jobsData = await Promise.all(jobs.map(async (job) => {
      const applicants = await JobApplication.find({ jobId: job._id });
      return {
        ...job.toObject(),
        applicants: applicants.length,
      };
    }));

    return res.json({
      success: true,
      jobsData,
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Change application status (e.g., Accepted, Rejected, etc.)
export const changeJobApplicationsStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    await JobApplication.findByIdAndUpdate(id, { status }); // ✅ cleaner

    return res.json({
      success: true,
      message: "Status Changed.",
    });

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// ✅ Toggle job visibility (hide/show job post)
export const changeVisibility = async (req, res) => {
  try {
    const { id } = req.body;
    const companyId = req.company._id; // ✅ Fixed

    const job = await Job.findById(id);

    if (!job) {
      return res.json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.companyId.toString() === companyId.toString()) { // ✅ Fixed
      job.visible = !job.visible;
      await job.save();

      return res.json({
        success: true,
        job,
      });
    } else {
      return res.json({
        success: false,
        message: "Unauthorized action.",
      });
    }

  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};