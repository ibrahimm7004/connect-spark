import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft } from 'lucide-react'

const hobbiesLeft = [
  'Wellness',
  'Arts & Music',
  'Outdoors & Travel',
  'Home & Lifestyle',
  'Health',
  'Food & Drink',
]

const hobbiesRight = [
  'Comedy',
  'Business',
  'Gaming',
  'Films',
  'Fashion',
  'Community',
]

const mbtiOptions = [
  'ENFJ','ENFP','ENTJ','ENTP',
  'ESFJ','ESFP','ESTJ','ESTP',
  'INFJ','INFP','INTJ','INTP',
  'ISFJ','ISFP','ISTJ','ISTP',
].sort()

const SignedUp = () => {
  const navigate = useNavigate()
  const { updateProfile, user } = useAuth()
  const [selectedHobbies, setSelectedHobbies] = useState([])
  const [enneagram, setEnneagram] = useState('')
  const [mbti, setMbti] = useState('')
  const [customHobby, setCustomHobby] = useState('')
  const [addedHobbies, setAddedHobbies] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleHobby = hobby => {
    setSelectedHobbies(prev =>
      prev.includes(hobby) ? prev.filter(h => h !== hobby) : [...prev, hobby]
    )
  }

  const handleContinue = async () => {
    if (!user) {
      alert('You must be logged in to continue')
      return
    }
    const allHobbies = [...selectedHobbies, ...addedHobbies].filter(Boolean)
    if (allHobbies.length === 0) {
      alert('Please select at least one hobby to continue')
      return
    }

    setLoading(true)
    try {
      const allInterests = allHobbies.join(', ')
      const profileData = { interests: allInterests, enneagram, mbti }
      const { error } = await updateProfile(profileData)

      if (error) {
        alert(`Could not save your interests: ${error.message || 'Unknown error'}`)
        setLoading(false)
        return
      }
      navigate('/why-join')
    } catch (error) {
      alert(`Something went wrong: ${error.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans flex justify-center">
      <div className="w-full max-w-[700px] px-4 py-8 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-6 h-6 md:w-5 md:h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-bold uppercase text-brand-orange">
            Personal context
          </h1>
        </div>

        <p className="text-sm md:text-base text-gray-200 text-center mb-6 leading-relaxed">
          Your responses will help us better understand you and connect you with others
        </p>

        {/* Hobbies */}
        <h2 className="text-base md:text-lg font-medium text-brand-orange mb-4">
          Outside of work, what do you enjoy? <span className="text-red-400">*</span>
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col gap-3">
            {hobbiesLeft.map(hobby => (
              <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHobbies.includes(hobby)}
                  onChange={() => toggleHobby(hobby)}
                  className="accent-brand-orange w-4 h-4"
                />
                <span className="text-sm md:text-base">{hobby}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {hobbiesRight.map(hobby => (
              <label key={hobby} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedHobbies.includes(hobby)}
                  onChange={() => toggleHobby(hobby)}
                  className="accent-brand-orange w-4 h-4"
                />
                <span className="text-sm md:text-base">{hobby}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom hobby */}
        <input
          type="text"
          placeholder="Add your own..."
          value={customHobby}
          onChange={e => setCustomHobby(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && customHobby.trim()) {
              setAddedHobbies(prev => [...prev, customHobby.trim()])
              setCustomHobby('')
            }
          }}
          className="w-full h-10 md:h-12 bg-white rounded-xl px-4 text-sm md:text-base text-gray-600 mb-6"
        />

        {/* Enneagram */}
        <h2 className="text-base md:text-lg font-medium text-brand-orange mb-3">
          What is your Enneagram type? <span className="text-xs text-gray-400">(optional)</span>
        </h2>
        <select
          value={enneagram}
          onChange={e => setEnneagram(e.target.value)}
          className="w-full h-10 md:h-12 bg-white rounded-xl px-4 text-sm md:text-base text-brand-dark mb-6"
        >
          <option value="">Select your Enneagram type</option>
          <option value="1 - Reformer">1 - Reformer</option>
          <option value="2 - Helper">2 - Helper</option>
          <option value="3 - Achiever">3 - Achiever</option>
          <option value="4 - Individualist">4 - Individualist</option>
          <option value="5 - Investigator">5 - Investigator</option>
          <option value="6 - Loyalist">6 - Loyalist</option>
          <option value="7 - Enthusiast">7 - Enthusiast</option>
          <option value="8 - Challenger">8 - Challenger</option>
          <option value="9 - Peacemaker">9 - Peacemaker</option>
        </select>

        {/* MBTI */}
        <h2 className="text-base md:text-lg font-medium text-brand-orange mb-3">
          What is your Myers-Briggs type? <span className="text-xs text-gray-400">(optional)</span>
        </h2>
        <select
          value={mbti}
          onChange={e => setMbti(e.target.value)}
          className="w-full h-10 md:h-12 bg-white rounded-xl px-4 text-sm md:text-base text-brand-dark mb-6"
        >
          <option value="">Select your Myers-Briggs type</option>
          {mbtiOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-10 md:h-12 bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-xl text-sm md:text-base font-bold uppercase disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default SignedUp
