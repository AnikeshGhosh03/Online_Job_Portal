import React from 'react'
import { assets } from '../assets/assets'

const AppDownload = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="flex flex-col md:flex-row items-center gap-10 bg-white rounded-xl p-8 max-w-4xl w-full border-4 border-gray-100 shadow-[0_0_60px_10px_rgba(139,92,246,0.25)]">
        <div className="w-full md:w-1/2 text-center">
          <h1 className="text-2xl font-semibold mb-6">Download Mobile App For Better Experience</h1>
          <div className="flex justify-center gap-6">
            <a href="#" aria-label="Download on Play Store">
              <img src={assets.play_store} alt="Play Store" className="h-12" />
            </a>
            <a href="#" aria-label="Download on App Store">
              <img src={assets.app_store} alt="App Store" className="h-12" />
            </a>
          </div>
        </div>
        <div className="flex justify-center items-center w-full md:w-1/2">
          <img
            src={assets.app_main_img}
            alt="App Preview"
            className="h-72 w-auto rounded-2xl shadow-lg object-cover"
          />
        </div>
      </div>
    </div>
  )
}

export default AppDownload