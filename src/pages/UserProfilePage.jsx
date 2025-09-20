import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

const UserProfilePage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile data from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        console.error('No user ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          // Fallback to mock data
          setProfileData({
            full_name: 'Eldon Song',
            job_title: 'Manager',
            company: 'Hale Center',
            location: 'Utah',
            interests: 'Football, Food & Drink, Community',
            enneagram: '8 - Challenger',
            mbti: 'ENTJ',
            bio: 'Description from signup',
            profile_pic: 'https://placehold.co/112x112'
          })
          return
        }

        setProfileData(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        // Fallback to mock data
        setProfileData({
          full_name: 'Eldon Song',
          job_title: 'Manager',
          company: 'Hale Center',
          location: 'Utah',
          interests: 'Football, Food & Drink, Community',
          enneagram: '8 - Challenger',
          mbti: 'ENTJ',
          bio: 'Description from signup',
          profile_pic: 'https://placehold.co/112x112'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [userId])

  const handleBackClick = () => {
    navigate('/connections')
  }

  const formatHobbies = (interests) => {
    if (!interests) return []
    return interests.split(', ').filter(hobby => hobby.trim() !== '')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark text-white font-sans px-6 py-6 flex items-center justify-center">
        <p className="text-gray-body">Loading profile...</p>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-brand-dark text-white font-sans px-6 py-6 flex items-center justify-center">
        <p className="text-gray-body">Error loading profile</p>
      </div>
    )
  }

  const hobbies = formatHobbies(profileData.interests)

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans px-6 py-6 relative">
      {/* Header */}
      <div className="flex items-center justify-center relative mb-10">
        <button onClick={handleBackClick} className="absolute left-0">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-[20px] font-bold uppercase text-brand-orange">
          Profile
        </h1>
      </div>

      {/* User Info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[32px] font-normal leading-10">
            {profileData.full_name || 'User'}
          </h2>
          <p className="text-[12px] font-normal flex items-center gap-1">
            <span className="text-white">{profileData.job_title || 'Job Title'}</span>
            <span className="text-brand-orange">|</span>
            <span className="text-white">{profileData.company || 'Company'}</span>
          </p>
          <div className="flex items-center gap-2 mt-1 text-[12px]">
            <span className="text-brand-orange">Connected at:</span>
            <span className="text-white">Marketing Conference</span>
          </div>
        </div>
        <img
          src={profileData.profile_pic || "https://placehold.co/112x112"}
          alt="Profile"
          className="w-[112px] h-[112px] rounded-full"
        />
      </div>

      {/* Hobbies */}
      <h3 className="text-[20px] font-medium text-brand-orange mb-3">Hobbies</h3>
      {hobbies.length > 0 ? (
        <div className="flex flex-wrap gap-3 mb-10">
          {hobbies.map((hobby, index) => (
            <span 
              key={index}
              className="px-4 py-2 bg-brand-orange rounded-[20px] text-[16px] font-normal"
            >
              {hobby}
            </span>
          ))}
        </div>
      ) : (
        <div className="mb-10">
          <p className="text-gray-body text-[16px]">No hobbies added yet</p>
        </div>
      )}

      {/* About */}
      <h3 className="text-[20px] font-medium text-brand-orange mb-4">About</h3>
      <div className="space-y-6">
        {/* Company */}
        <div>
          <p className="text-[12px] text-gray-body">Company</p>
          <p className="text-[16px] text-white">{profileData.company || 'Not specified'}</p>
          <hr className="border-t border-white/20 mt-2" />
        </div>

        {/* Job Title */}
        <div>
          <p className="text-[12px] text-gray-body">Job Title</p>
          <p className="text-[16px] text-white">{profileData.job_title || 'Not specified'}</p>
          <hr className="border-t border-white/20 mt-2" />
        </div>

        {/* Location */}
        <div>
          <p className="text-[12px] text-gray-body">Location</p>
          <p className="text-[16px] text-white">{profileData.location || 'Not specified'}</p>
          <hr className="border-t border-white/20 mt-2" />
        </div>

        {/* Bio */}
        {profileData.bio && (
          <div>
            <p className="text-[12px] text-gray-body">Bio</p>
            <p className="text-[16px] text-white">{profileData.bio}</p>
            <hr className="border-t border-white/20 mt-2" />
          </div>
        )}

        {/* Enneagram */}
        <div>
          <p className="text-[12px] text-gray-body">Enneagram type</p>
          <p className="text-[16px] text-white">{profileData.enneagram || 'Not specified'}</p>
          <hr className="border-t border-white/20 mt-2" />
        </div>

        {/* Myers-Briggs */}
        <div>
          <p className="text-[12px] text-gray-body">Myers-Briggs type</p>
          <p className="text-[16px] text-white">{profileData.mbti || 'Not specified'}</p>
          <hr className="border-t border-white/20 mt-2" />
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage