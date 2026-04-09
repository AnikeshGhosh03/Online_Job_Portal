import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../components/Loading';


const ManageJobs = () => {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState(false)

  const { backendUrl, companyToken } = useContext(AppContext)

  const fetchCompanyJobs = async () => {

    try {
      
      const {data} = await axios.get(backendUrl+ '/api/company/list-jobs',
      {headers : {token : companyToken}})

      if(data.success){
        setJobs(data.jobsData.reverse())
        console.log(data.jobsData);
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      console.error("fetchCompanyJobs error:", error.message);
    }
  }

  const changeJobVisibility = async (id) => {
    try {
      
      const {data} = await axios.post(backendUrl + '/api/company/change-visibility',
        { id },
        {
          headers : {token: companyToken}
        }
      )
      if(data.success){
        toast.success(data.message)
        fetchCompanyJobs()
      }else{
        toast.error(data.message)
      }


    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job visibility.')
    }
  }

  useEffect(() => {
    if(companyToken){
      fetchCompanyJobs()
    }
  },[companyToken])

  return jobs ? jobs.length === 0 ? (
  <div className='flex items-center justify-center h-[70vh]'>
    <p className='text-xl sm:text-2xl'>No jobs posted.</p>
  </div>
  ) : (
    <div className='container p-4 max-w-5xl'>
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-300 max-sm:text-sm'>
          <thead>
            <tr>
              <th className='px-4 py-2 border-b text-left max-sm:hidden'>#</th>
              <th className='px-4 py-2 border-b text-left'>Job Title</th>
              <th className='px-4 py-2 border-b text-left max-sm:hidden'>Date</th>
              <th className='px-4 py-2 border-b text-left max-sm:hidden'>Location</th>
              <th className='px-4 py-2 border-b text-center'>Applicants</th>
              <th className='px-4 py-2 border-b text-left'>Visible</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr className='text-gray-700' key={index}>
                <td className='px-4 py-2 border-b max-sm:hidden'>{index+1}</td>
                <td className='px-4 py-2 border-b'>{job.title}</td>
                <td className='px-4 py-2 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
                <td className='px-4 py-2 border-b max-sm:hidden'>{job.location}</td>
                <td className='px-4 py-2 border-b text-center'>{job.applicants}</td>
                <td className='px-4 py-2 border-b'>
                  <input onChange={() => changeJobVisibility(job._id)} className='scale-125 ml-4 cursor-pointer' type="checkbox" checked={job.visible} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className='mt-4 flex justify-end'>
        <button onClick={() => navigate('/dashboard/add-job')} className='bg-black text-white rounded py-2 px-4 cursor-pointer transition-all duration-200 hover:bg-gray-800 hover:shadow-md active:scale-95'>Add new job</button>
      </div>
    </div>
  ) : <Loading />
}

export default ManageJobs