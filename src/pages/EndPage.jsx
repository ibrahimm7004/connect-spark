import React from 'react'

export default function EndPage() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#242424]">
      <div className="w-full max-w-[430px] px-6 text-center">
        {/* Main message */}
        <h1 className="text-[22px] font-sans font-bold uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#EC874E] to-[#BF341E]">
          Thanks for completing your profile
        </h1>

        {/* Sub message */}
        <p className="mt-4 text-[18px] font-sans text-gray-300 leading-6">
          Smart matching will be available soon
        </p>

        {/* Optional divider for polish */}
        <div className="mt-8 w-24 h-[2px] mx-auto bg-gradient-to-r from-[#EC874E] to-[#BF341E]" />
      </div>
    </div>
  )
}
