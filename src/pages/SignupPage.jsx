import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const SignupPage = () => {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    jobTitle: '',
    company: '',
    description: '',
    location: '',
    password: '',
    allowDifferentProfiles: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfileImage(file)
      // Create preview URL
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

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Create account with Supabase
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        job_title: formData.jobTitle,
        company: formData.company,
        bio: formData.description,
        location: formData.location,
        allow_different_profiles: formData.allowDifferentProfiles
      })

      if (!error && data?.user) {
        // Navigate to questions page
        navigate('/questions')
      } else {
        console.error('Signup error:', error)
      }
    } catch (error) {
      console.error('Signup error:', error)
    } finally {
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
            Sign Up
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          </div>

          {/* Email */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
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
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
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
              placeholder="Location"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12px] text-gray-light font-sans mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full h-12 px-4 rounded-[20px] bg-white text-[16px] font-sans text-brand-dark placeholder-gray-light"
            />
          </div>

          {/* Allow different profiles */}
          <div className="flex items-center justify-between mt-2">
            <span className="font-sans text-[12px] text-white">
              Allow different profile details for each event
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="allowDifferentProfiles"
                checked={formData.allowDifferentProfiles}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-light rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#E78140] peer-checked:to-[#DA642E] relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-full" />
              </div>
            </label>
          </div>

          {/* Error display */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800 text-sm">
                {Object.values(errors)[0]}
              </p>
            </div>
          )}

          {/* Continue button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white font-sans text-[16px] font-bold uppercase mt-6 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>

          {/* Terms */}
          <p className="mt-4 text-center font-sans text-[12px] text-gray-light">
            By signing up, you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
