import React, { useContext, useState, useEffect } from 'react'
import NavBar from '../components/Navbar';
import { assets } from '../assets/assets';
import moment  from 'moment';
import Footer from '../components/Footer';
import { AppContext } from '../context/AppContext';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Applications = () => {

  const {user} = useUser();
  const {getToken} = useAuth();

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);

  const { backendUrl, userData, userApplications, fetchUserData, fetchUserApplications, setUserData } = useContext(AppContext)

  const updateResume = async () => {
    try {
      if (!resume) {
        toast.error('Please select a resume first.');
        return;
      }
      const fileName = resume.name?.toLowerCase() || '';
      if (!fileName.endsWith('.pdf')) {
        toast.error('Please upload a PDF resume.');
        return;
      }

      const formData = new FormData();
      formData.append('resume', resume);

      const token = await getToken();
      console.log('updateResume token:', token);
      if (!token) {
        toast.error('Authentication token missing. Please log in again.');
        return;
      }

      const { data } = await axios.post(
        backendUrl + '/api/user/update-resume',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message || 'Resume uploaded successfully.');
        if (data.user) {
          setUserData(data.user);
        } else {
          await fetchUserData();
        }
      } else {
        toast.error(data.message || 'Could not upload resume.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Resume upload failed.');
    }

    setIsEdit(false);
    setResume(null);
  }

  // Applications are fetched by AppContext after user is confirmed in DB
  // No need to fetch independently here — avoids race condition 401 errors
  

  return (
    <>
    <NavBar />
    <div className='container px-4 min-h-[69vh] 2xl:px-20 mx-auto my-10'>
      <h2 className='text-xl font-semibold'>Your Resume</h2>
      <div className='flex gap-2 mb-6 mt-3'>
        { isEdit || !userData?.resume ? 
          <>
            <label className='flex items-center' htmlFor="resumeUpload">
              <p className='bg-blue-200 text-blue-600 px-4 py-2 rounded-lg mr-2 cursor-pointer'>{resume ? resume.name : "Select Resume"}</p>
              <input id='resumeUpload' className='hidden' onChange={e => setResume(e.target.files[0])} accept='application/pdf' type="file" />
              <img className='cursor-pointer' src={assets.profile_upload_icon} alt="" />
            </label>
            <button type='button' onClick={updateResume} className='bg-green-100 border border-green-600 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-green-200 hover:shadow-sm active:scale-95'>Save</button>
          </>
        :
          <div className='flex gap-2'>
            <a target='_blank' className='bg-blue-200 text-blue-600 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-300 hover:shadow-sm' href={userData?.resume || '#'}>Resume</a>
            <button onClick={() => setIsEdit(true)} className='bg-gray-200 text-gray-900 border border-gray-500 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-300 hover:shadow-sm active:scale-95'>Edit</button>
          </div>
        }
      </div>
      <div><h2 className='text-2xl font-semibold mb-4'>Job Applied</h2></div>
      <table className='min-w-full bg-white border rounded-lg'>
        <thead>
          <tr>
            <th className='py-3 px-4 border-b text-left'>Company</th>
            <th className='py-3 px-4 border-b text-left'>Job title</th>
            <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
            <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
            <th className='py-3 px-4 border-b text-left'>Status</th>
          </tr>
        </thead>
        <tbody>
          {userApplications.map((job, index) => job?.jobId && job?.companyId ? (
            <tr key={index}>
              <td className='py-3 px-4 flex items-center gap-2 border-b'>
                <img className='w-8 h-8' src={job.companyId.image} alt="" />
                {job.companyId.name}
              </td>
              <td className='py-3 px-4 border-b text-left'>{job.jobId.title}</td>
              <td className='py-3 px-4 border-b text-left max-sm:hidden'>{job.jobId.location}</td>
              <td className='py-3 px-4 border-b text-left max-sm:hidden'>{moment(job.date).format("ll")}</td>
              <td className='py-3 px-4 border-b text-left'>
                <span className={`${job.status === 'Accepted' ? 'bg-green-200' : job.status === 'Rejected' ? 'bg-red-200' : 'bg-yellow-200'} px-4 py-1.5 rounded`}>
                  {job.status}
                </span>
              </td>
            </tr>
          ) : (null))}
        </tbody>
      </table>
    </div>
    <Footer />
    </>
  )
}

export default Applications