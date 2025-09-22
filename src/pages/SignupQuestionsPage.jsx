import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const SignupQuestionsPage = () => {
  const navigate = useNavigate()
  const { updateProfile, user } = useAuth()

  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    company: '',
    responsibilities: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [imagePreview, setImagePreview] = useState(null)

  // ✅ Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // ✅ Handle image upload (preview only here)
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerImageUpload = () => {
    document.getElementById('image-upload').click()
  }

  // ✅ Validation for required fields
  const validateForm = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required'
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ✅ Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return

    if (!user) {
      alert('You must be logged in to continue')
      return
    }

    setLoading(true)
    console.log('🔄 Starting profile update...')
    console.log('👤 User:', user?.id)
    console.log('📝 Form data:', formData)
    
    try {
      const profileData = {
        full_name: formData.fullName,
        job_title: formData.jobTitle,
        company: formData.company,
        bio: formData.responsibilities,
        location: formData.location,
      }
      
      console.log('📤 Sending profile data:', profileData)
      
      const { error } = await updateProfile(profileData)
      console.log('📡 Update profile response:', { error })

      if (error) {
        console.error('❌ Profile update error:', error)
        alert(`Could not save your profile: ${error.message || 'Unknown error'}`)
        setLoading(false)
        return
      }

      console.log('✅ Profile saved successfully, navigating to /signed-up')
      navigate('/signed-up')
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      alert(`Something went wrong: ${err.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex justify-center bg-brand-dark">
      <div className="w-full max-w-[430px] min-h-[932px] flex flex-col px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-6 h-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#F9F9F9"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center font-sans text-[20px] font-bold uppercase text-[#EC874E]">
            Complete Your Profile
          </h1>
        </div>

        {/* Upload image */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-24 h-24 bg-gray-light rounded-full overflow-hidden">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-light rounded-full" />
            )}
          </div>
          <div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerImageUpload}
              className="px-5 py-3 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white font-sans text-[14px] font-normal hover:opacity-90 transition-opacity"
            >
              Upload image
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Full name */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Full name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Preston"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
            {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
          </div>

          {/* Job title */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Job title
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="Web Designer"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
            {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle}</p>}
          </div>

          {/* Company */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Company
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="DigiCo"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
            {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
          </div>

          {/* Job responsibilities */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Job responsibilities
            </label>
            <textarea
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="What are your main responsibilities?"
              rows={3}
              className="w-full px-4 py-3 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
          </div>

          {/* Error summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">
                Please fill all required fields before continuing.
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white font-sans text-[16px] font-bold uppercase mt-6 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignupQuestionsPage
