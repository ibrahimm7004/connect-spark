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

// Myers-Briggs options sorted alphabetically
const mbtiOptions = [
  'ENFJ', 'ENFP', 'ENTJ', 'ENTP',
  'ESFJ', 'ESFP', 'ESTJ', 'ESTP',
  'INFJ', 'INFP', 'INTJ', 'INTP',
  'ISFJ', 'ISFP', 'ISTJ', 'ISTP',
].sort()

const SignedUp = () => {
  const navigate = useNavigate()
  const { updateProfile } = useAuth()
  const [selectedHobbies, setSelectedHobbies] = useState([])
  const [enneagram, setEnneagram] = useState('')
  const [mbti, setMbti] = useState('')
  const [customHobby, setCustomHobby] = useState('')
  const [addedHobbies, setAddedHobbies] = useState([])
  const [loading, setLoading] = useState(false)

  const toggleHobby = (hobby) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    )
  }

  const handleContinue = async () => {
    setLoading(true)
    try {
      const allInterests = [...selectedHobbies, ...addedHobbies].join(', ')
      const { error } = await updateProfile({
        interests: allInterests,
        enneagram,
        mbti,
      })

      if (!error) {
        navigate('/why-join')
      } else {
        console.error('Error updating profile:', error)
        navigate('/why-join')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      navigate('/why-join')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white px-6 py-6 font-sans relative">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[20px] font-bold uppercase text-brand-orange">
          Personal context
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-[18px] font-normal leading-6 text-white text-center mb-6">
        Your responses will help us better understand you and connect more
        accurately with others
      </p>

      {/* Question 1 */}
      <h2 className="text-[18px] font-medium text-brand-orange mb-4">
        Outside of work, what do you enjoy?
      </h2>

      {/* Hobbies */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-3">
          {hobbiesLeft.map((hobby) => (
            <label key={hobby} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedHobbies.includes(hobby)}
                onChange={() => toggleHobby(hobby)}
                className="accent-brand-orange w-4 h-4"
              />
              <span className="text-[16px] font-normal leading-6">{hobby}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {hobbiesRight.map((hobby) => (
            <label key={hobby} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedHobbies.includes(hobby)}
                onChange={() => toggleHobby(hobby)}
                className="accent-brand-orange w-4 h-4"
              />
              <span className="text-[16px] font-normal leading-6">{hobby}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Added hobbies */}
      {(selectedHobbies.length > 0 || addedHobbies.length > 0) && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[12px] text-brand-orange">Added:</span>
          <div className="flex gap-4 flex-wrap">
            {selectedHobbies.map((hobby) => (
              <span key={hobby} className="text-[12px] text-white">
                {hobby}
              </span>
            ))}
            {addedHobbies.map((hobby) => (
              <span key={hobby} className="text-[12px] text-white">
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add your own */}
      <input
        type="text"
        placeholder="Add your own..."
        value={customHobby}
        onChange={(e) => setCustomHobby(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && customHobby.trim()) {
            setAddedHobbies((prev) => [...prev, customHobby.trim()])
            setCustomHobby('')
          }
        }}
        className="w-full h-12 bg-white rounded-[20px] px-4 text-[16px] text-gray-600 placeholder-gray-light mb-6"
      />

      {/* Enneagram */}
      <h2 className="text-[18px] font-medium text-brand-orange mb-3">
        What is your Enneagram type? <span className="text-sm text-gray-400">(optional)</span>
      </h2>
      <select
        value={enneagram}
        onChange={(e) => setEnneagram(e.target.value)}
        className="w-full h-12 bg-white rounded-[20px] px-4 text-[16px] text-brand-dark mb-6"
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
      <h2 className="text-[18px] font-medium text-brand-orange mb-3">
        What is your Myers-Briggs type? <span className="text-sm text-gray-400">(optional)</span>
      </h2>
      <select
        value={mbti}
        onChange={(e) => setMbti(e.target.value)}
        className="w-full h-12 bg-white rounded-[20px] px-4 text-[16px] text-brand-dark mb-6"
      >
        <option value="">Select your Myers-Briggs type</option>
        {mbtiOptions.map((type) => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      {/* Actions */}
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-[20px] text-[16px] font-bold uppercase disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
    </div>
  )
}

export default SignedUp
