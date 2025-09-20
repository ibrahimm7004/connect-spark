import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const WhyJoinPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [question1Answer, setQuestion1Answer] = useState('')
  const [question2Answer, setQuestion2Answer] = useState('')
  const [customAnswer1, setCustomAnswer1] = useState('')
  const [customAnswer2, setCustomAnswer2] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentEventId, setCurrentEventId] = useState(null)

  const question1Options = [
    'To explore career opportunities',
    'To learn from experts / gain insights',
    'To explore new trends and innovations',
    'To exchange cross-industry ideas'
  ]

  const question2Options = [
    'Investors',
    'Potential clients',
    'Mentors',
    'Business partners',
    'Recruiters / Talents',
    'Industry experts'
  ]

  const handleContinue = async () => {
    if (!question1Answer && !customAnswer1) {
      alert('Please answer question 1')
      return
    }
    if (!question2Answer && !customAnswer2) {
      alert('Please answer question 2')
      return
    }

    setLoading(true)
    
    try {
      if (!user) {
        alert('You must be logged in to submit answers')
        setLoading(false)
        return
      }

      // MVP: use a real event_id constant
      const EVENT_ID = 'ad73d792-4286-48c5-8cdf-6a9e5c821a0f'

      // Store answers in database
      const payload = {
        user_id: user.id,
        event_id: EVENT_ID,
        question1: question1Answer || customAnswer1,
        question2: question2Answer || customAnswer2
      }
      console.log('Upserting event_answers payload:', payload)
      const { data, error } = await supabase
        .from('event_answers')
        .upsert(payload, { onConflict: 'user_id,event_id' })

      if (error) {
        console.error('Event answers upsert error:', error)
      } else {
        console.log('Event answers upsert data:', data)
      }

      setLoading(false)
      navigate('/end')
    } catch (error) {
      console.error('Error processing answers:', error)
      setLoading(false)
      navigate('/end')
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans px-6 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[20px] font-bold uppercase text-brand-orange mb-4">
          WELCOME
        </h1>
        
        {/* Conference banner */}
        <div className="bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-[20px] p-6 mb-6">
          <h2 className="text-white text-[18px] font-medium uppercase leading-6">
            Mastering Photography & Visual Storytelling Conference
          </h2>
        </div>

        <p className="text-white text-[18px] font-normal leading-6">
          These questions will help us know who to introduce you to.
        </p>
      </div>

      {/* Question 1 */}
      <div className="mb-8">
        <h3 className="text-[18px] font-medium text-brand-orange mb-4">
          Why did you want to attend this conference?
        </h3>
        
        <div className="space-y-3 mb-4">
          {question1Options.map((option, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="question1"
                value={option}
                checked={question1Answer === option}
                onChange={(e) => setQuestion1Answer(e.target.value)}
                className="w-4 h-4 accent-brand-orange"
              />
              <span className="text-white text-[16px]">{option}</span>
            </label>
          ))}
        </div>

        {/* Custom input for question 1 */}
        <textarea
          placeholder="Add your own..."
          value={customAnswer1}
          onChange={(e) => setCustomAnswer1(e.target.value)}
          className="w-full h-24 bg-white rounded-[20px] p-3 text-brand-dark text-[16px] placeholder-gray-light resize-none"
        />
      </div>

      {/* Question 2 */}
      <div className="mb-8">
        <h3 className="text-[18px] font-medium text-brand-orange mb-4">
          What type of person do you want to meet?
        </h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          {question2Options.map((option, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="question2"
                value={option}
                checked={question2Answer === option}
                onChange={(e) => setQuestion2Answer(e.target.value)}
                className="w-4 h-4 accent-brand-orange"
              />
              <span className="text-white text-[16px]">{option}</span>
            </label>
          ))}
        </div>

        {/* Custom input for question 2 */}
        <textarea
          placeholder="Add your own..."
          value={customAnswer2}
          onChange={(e) => setCustomAnswer2(e.target.value)}
          className="w-full h-24 bg-white rounded-[20px] p-3 text-brand-dark text-[16px] placeholder-gray-light resize-none"
        />
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-[20px] text-white text-[16px] font-bold uppercase disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Continue'}
      </button>
    </div>
  )
}

export default WhyJoinPage
