import React from 'react'
import { assets, viewApplicationsPageData } from '../assets/assets'

const ViewApplications = () => {
    return (
        <div className='container mx-auto p-4'>
            <div className="overflow-x-auto">
                <table className='w-full min-w-[900px] bg-white border border-gray-200 max-sm:text-sm rounded-lg'>
                    <thead>
                        <tr className='border-b bg-gray-50'>
                            <th className='py-3 px-4 text-left font-semibold'>#</th>
                            <th className='py-3 px-4 text-left font-semibold'>Username</th>
                            <th className='py-3 px-4 text-left font-semibold max-sm:hidden'>Job Title</th>
                            <th className='py-3 px-4 text-left font-semibold max-sm:hidden'>Location</th>
                            <th className='py-3 px-4 text-left font-semibold'>Resume</th>
                            <th className='py-3 px-4 text-left font-semibold'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {viewApplicationsPageData.map((applicant, index) => (
                            <tr key={index} className='text-gray-700 hover:bg-gray-50 transition'>
                                <td className='py-3 px-4 border-b text-center'>{index + 1}</td>
                                <td className='py-3 px-4 border-b'>
                                    <div className='flex items-center gap-3'>
                                        <img className='w-10 h-10 rounded-full max-sm:hidden' src={applicant.imgSrc} alt='' />
                                        <span>{applicant.name}</span>
                                    </div>
                                </td>
                                <td className='py-3 px-4 border-b max-sm:hidden'>{applicant.jobTitle}</td>
                                <td className='py-3 px-4 border-b max-sm:hidden'>{applicant.location}</td>
                                <td className='py-3 px-4 border-b'>
                                    <a href='' target='_blank' rel="noopener noreferrer" className='bg-blue-50 text-blue-500 px-3 py-1 rounded inline-flex gap-2 items-center hover:bg-blue-100 transition'>
                                        Resume <img src={assets.resume_download_icon} alt='' />
                                    </a>
                                </td>
                                <td className='py-3 px-4 border-b relative'>
                                    <div className='relative inline-block text-left group'>
                                        <button className='text-gray-500 action-button px-2 py-1 rounded hover:bg-gray-100'>...</button>
                                        <div className='z-10 hidden group-hover:block absolute right-0 top-8 w-32 bg-white border border-gray-200 rounded shadow'>
                                            <button className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100'>Accept</button>
                                            <button className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100'>Reject</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ViewApplications