import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft } from 'lucide-react'

const hobbiesLeft = [
  'Welness',
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

const SignupQuestions = () => {
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
      // Combine selected hobbies and added hobbies
      const allInterests = [...selectedHobbies, ...addedHobbies].join(', ')
      
      // Update profile with personality data
      const { error } = await updateProfile({
        interests: allInterests,
        enneagram: enneagram,
        mbti: mbti
      })

      if (!error) {
        navigate('/why-join')
      } else {
        console.error('Error updating profile:', error)
        // Even if update fails, continue onboarding
        navigate('/why-join')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // Even if update fails, continue onboarding
      navigate('/why-join')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      // Update profile with null values for skipped fields
      const { error } = await updateProfile({
        interests: null,
        enneagram: null,
        mbti: null
      })

      if (!error) {
        navigate('/home')
      } else {
        console.error('Error updating profile:', error)
        // Even if update fails, still navigate to home
        navigate('/home')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      // Even if update fails, still navigate to home
      navigate('/home')
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
        accuratly with others
      </p>

      {/* Question 1 */}
      <h2 className="text-[18px] font-medium text-brand-orange mb-4">
        Outside of work, what do you enjoy?
      </h2>

      {/* Hobbies */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col gap-3">
          {hobbiesLeft.map((hobby) => (
            <label
              key={hobby}
              className="flex items-center gap-2 cursor-pointer"
            >
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
            <label
              key={hobby}
              className="flex items-center gap-2 cursor-pointer"
            >
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

      {/* Question 2 */}
      <h2 className="text-[18px] font-medium text-brand-orange mb-3">
        What is your Enneagram type?
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

      {/* Question 3 */}
      <h2 className="text-[18px] font-medium text-brand-orange mb-3">
        What is your Meyers-Briggs type?
      </h2>
              <select
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="w-full h-12 bg-white rounded-[20px] px-4 text-[16px] text-brand-dark mb-6"
              >
                <option value="">Select your Myers-Briggs type</option>
                <option value="ENTJ">ENTJ</option>
                <option value="INTJ">INTJ</option>
                <option value="ENFP">ENFP</option>
                <option value="INFP">INFP</option>
                <option value="ESTJ">ESTJ</option>
                <option value="ISTJ">ISTJ</option>
                <option value="ESFP">ESFP</option>
                <option value="ISFP">ISFP</option>
                <option value="ENTP">ENTP</option>
                <option value="INTP">INTP</option>
                <option value="ESFJ">ESFJ</option>
                <option value="ISFJ">ISFJ</option>
                <option value="ESTP">ESTP</option>
                <option value="ISTP">ISTP</option>
                <option value="ENFJ">ENFJ</option>
                <option value="INFJ">INFJ</option>
              </select>

      {/* Actions */}
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full h-12 bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-[20px] text-[16px] font-bold uppercase disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Continue'}
      </button>
      <button
        onClick={handleSkip}
        disabled={loading}
        className="mt-4 w-full text-center text-[16px] font-bold uppercase underline disabled:opacity-50"
      >
        Skip
      </button>
    </div>
  )
}

export default SignupQuestions
