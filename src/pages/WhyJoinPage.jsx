import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const WhyJoinPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [q1Answers, setQ1Answers] = useState([])
  const [q2Answers, setQ2Answers] = useState([])
  const [custom1, setCustom1] = useState('')
  const [custom2, setCustom2] = useState('')
  const [loading, setLoading] = useState(false)

  const q1Options = [
    'To explore career opportunities',
    'To learn from experts / gain insights',
    'To explore new trends and innovations',
    'To exchange cross-industry ideas'
  ]

  const q2Options = [
    'Investors',
    'Potential clients',
    'Mentors',
    'Business partners',
    'Recruiters / Talents',
    'Industry experts'
  ]

  const toggle = (val, answers, setter) => {
    setter(answers.includes(val) ? answers.filter(x => x !== val) : [...answers, val])
  }

  const handleContinue = async () => {
    if (!user) {
      alert('You must be logged in')
      return
    }
    if (q1Answers.length === 0 && !custom1.trim()) {
      alert('Please answer question 1')
      return
    }
    if (q2Answers.length === 0 && !custom2.trim()) {
      alert('Please answer question 2')
      return
    }

    setLoading(true)
    try {
      const EVENT_ID = 'ad73d792-4286-48c5-8cdf-6a9e5c821a0f'
      const payload = {
        user_id: user.id,
        event_id: EVENT_ID,
        question1: [...q1Answers, custom1].filter(Boolean).join(', '),
        question2: [...q2Answers, custom2].filter(Boolean).join(', ')
      }

      const { error } = await supabase
        .from('event_answers')
        .upsert(payload, { onConflict: 'user_id,event_id' })

      if (error) {
        alert(`Could not save your answers: ${error.message || 'Unknown error'}`)
        setLoading(false)
        return
      }
      navigate('/end')
    } catch (error) {
      alert(`Something went wrong: ${error.message || 'Unknown error'}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans flex justify-center">
      <div className="w-full max-w-[700px] px-4 py-8 md:px-8">
        <h1 className="text-lg md:text-xl font-bold uppercase text-brand-orange mb-6 text-center">
          Why did you join?
        </h1>

        {/* Question 1 */}
        <h2 className="text-base md:text-lg font-medium text-brand-orange mb-3">
          Why did you want to attend this conference? <span className="text-red-400">*</span>
        </h2>
        <div className="space-y-2 mb-4">
          {q1Options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={q1Answers.includes(opt)}
                onChange={() => toggle(opt, q1Answers, setQ1Answers)}
                className="accent-brand-orange w-4 h-4"
              />
              <span className="text-sm md:text-base">{opt}</span>
            </label>
          ))}
        </div>
        <textarea
          placeholder="Add your own..."
          value={custom1}
          onChange={e => setCustom1(e.target.value)}
          className="w-full h-20 md:h-24 bg-white rounded-xl p-3 text-sm md:text-base text-brand-dark mb-6"
        />

        {/* Question 2 */}
        <h2 className="text-base md:text-lg font-medium text-brand-orange mb-3">
          What type of person do you want to meet? <span className="text-red-400">*</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
          {q2Options.map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={q2Answers.includes(opt)}
                onChange={() => toggle(opt, q2Answers, setQ2Answers)}
                className="accent-brand-orange w-4 h-4"
              />
              <span className="text-sm md:text-base">{opt}</span>
            </label>
          ))}
        </div>
        <textarea
          placeholder="Add your own..."
          value={custom2}
          onChange={e => setCustom2(e.target.value)}
          className="w-full h-20 md:h-24 bg-white rounded-xl p-3 text-sm md:text-base text-brand-dark mb-6"
        />

        {/* Continue */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-10 md:h-12 bg-gradient-to-r from-[#EC874E] to-[#BF341E] rounded-xl text-sm md:text-base font-bold uppercase disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {loading ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}

export default WhyJoinPage
