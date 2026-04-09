import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const { openSignIn } = useClerk()
  const { user } = useUser()
  const navigate = useNavigate()

  const {setShowRecruiterLogin} = useContext(AppContext)

  return (
    <div className='shadow py-4'>
      <div className='container px-1 2xl:px-20 mx-auto flex justify-between items-center'>
        <img onClick={()=> navigate('/')} className='cursor-pointer transition-opacity duration-200 hover:opacity-75' src={assets.logo} alt='' />
        {
          user
            ? <div className='flex items-center gap-4'>
                <Link to={'/applications'} className='text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:underline'>Applied Jobs</Link>
                <p>|</p>
                <p className='max-sm:hidden'>Hi, {user.firstName + " " + user.lastName}</p>
                <UserButton />
              </div>
            : <div className='flex gap-4 max-sm:text-xs'>
                <button onClick={e=> setShowRecruiterLogin(true)} className='text-gray-600 hover:text-gray-900 transition-colors duration-200 hover:underline'>Recruiter Login</button>
                <button
                  onClick={() => openSignIn()}
                  className='bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full transition-all duration-200 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                >
                  Login
                </button>
              </div>
        }
      </div>
    </div>
  )
}

export default Navbar