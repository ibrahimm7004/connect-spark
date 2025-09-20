import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const JoinEvent = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [qrCodeImage, setQrCodeImage] = useState(null)
  const [qrCodePreview, setQrCodePreview] = useState(null)
  const [eventCode, setEventCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setQrCodeImage(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setQrCodePreview(e.target.result)
      }
      reader.readAsDataURL(file)
      
      // Simulate QR code processing
      setTimeout(() => {
        processQrCode(file)
      }, 1000)
    }
  }

  const triggerQrCodeUpload = () => {
    document.getElementById('qr-code-upload').click()
  }

  const processQrCode = async (file) => {
    setLoading(true)
    setError('')
    
    try {
      // Simulate QR code processing - in real app this would decode the QR code
      // For now, we'll use a mock result but in production this would decode the actual QR
      const mockQrResult = '12345' // This would come from QR code decoding
      
      // Find event in database by code
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('code_4digit', mockQrResult)
        .single()

      if (error || !events) {
        setError('Invalid QR code. Please try again.')
        setLoading(false)
        return
      }

      await joinEvent(events)
    } catch (error) {
      console.error('QR code processing error:', error)
      setError('Error processing QR code. Please try again.')
      setLoading(false)
    }
  }

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 5) {
      setEventCode(value)
      setError('')
    }
  }

  const handleCodeSubmit = (e) => {
    if (e.key === 'Enter' && eventCode.length === 5) {
      processEventCode()
    }
  }

  const processEventCode = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Find event in database by code
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('code_4digit', eventCode)
        .single()

      if (error || !event) {
        setError('Invalid event code. Please check and try again.')
        setLoading(false)
        return
      }

      await joinEvent(event)
    } catch (error) {
      console.error('Event code processing error:', error)
      setError('Error processing event code. Please try again.')
      setLoading(false)
    }
  }

  const joinEvent = async (event) => {
    try {
      if (!user) {
        setError('You must be logged in to join an event.')
        setLoading(false)
        return
      }

      // Add user to event in database
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: event.id,
          user_id: user.id
        })

      if (error) {
        console.error('Error joining event:', error)
        setError('Failed to join event. Please try again.')
        setLoading(false)
        return
      }

      console.log('Successfully joined event:', event)
      setLoading(false)
      
      // Navigate to WhyJoinPage
      navigate('/why-join')
    } catch (error) {
      console.error('Error joining event:', error)
      setError('Failed to join event. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white font-sans flex flex-col items-center px-6 py-8">
      {/* Header */}
      <div className="w-full flex justify-center mb-12">
        <h1 className="text-[20px] font-bold uppercase text-brand-orange">
          join an event
        </h1>
      </div>

      {/* QR Code Section */}
      <div className="w-full max-w-[304px] mb-10">
        <p className="text-[18px] font-normal leading-6 text-center mb-6">
          Upload QR code to join an event
        </p>
        
        {/* QR Code Upload Area */}
        <div className="w-[304px] h-[304px] bg-gray-400 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
          {qrCodePreview ? (
            <img 
              src={qrCodePreview} 
              alt="QR Code preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-gray-body text-[14px] mb-4">QR Code will appear here</div>
              <div className="text-gray-body text-[12px]">Upload QR code image</div>
            </div>
          )}
        </div>

        {/* QR Code Upload Button */}
        <div className="flex justify-center">
          <input
            id="qr-code-upload"
            type="file"
            accept="image/*"
            onChange={handleQrCodeUpload}
            className="hidden"
          />
          <button
            onClick={triggerQrCodeUpload}
            className="px-6 py-3 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white font-sans text-[14px] font-normal hover:opacity-90 transition-opacity"
          >
            Upload QR Code
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center w-full max-w-[304px] mb-10">
        <hr className="flex-grow border-gray-body" />
        <span className="px-4 text-gray-body text-[14px]">or</span>
        <hr className="flex-grow border-gray-body" />
      </div>

      {/* Manual Code Entry */}
      <div className="w-full max-w-[304px]">
        <p className="text-[16px] font-normal leading-6 text-center mb-6">
          Enter 5-digit event code
        </p>
        
        {/* Code Input */}
        <div className="flex gap-4 justify-center mb-6">
          {[...Array(5)].map((_, idx) => (
            <input
              key={idx}
              type="text"
              maxLength="1"
              value={eventCode[idx] || ''}
              onChange={(e) => {
                const newCode = eventCode.split('')
                newCode[idx] = e.target.value.replace(/\D/g, '')
                setEventCode(newCode.join(''))
                
                // Auto-focus next input
                if (e.target.value && idx < 4) {
                  const nextInput = e.target.parentElement.children[idx + 1]
                  if (nextInput) nextInput.focus()
                }
              }}
              onKeyDown={handleCodeSubmit}
              className="w-[50px] h-[50px] bg-white text-brand-dark text-center text-[24px] font-bold rounded-lg border-2 border-transparent focus:border-brand-orange focus:outline-none"
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={processEventCode}
            disabled={eventCode.length !== 5 || loading}
            className="px-6 py-3 rounded-[20px] bg-gradient-to-r from-[#EC874E] to-[#BF341E] text-white font-sans text-[14px] font-normal hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Join Event'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 p-3 bg-red-100 border border-red-300 rounded-lg max-w-[304px]">
          <p className="text-red-800 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-6 text-center">
          <p className="text-gray-body text-[14px]">Processing...</p>
        </div>
      )}

      {/* Database Info (for testing) */}
      <div className="mt-8 p-4 bg-gray-800 rounded-lg max-w-[304px]">
        <p className="text-gray-body text-[12px] text-center mb-2">Test codes (from database):</p>
        <div className="text-center">
          <p className="text-white text-[12px]">1234, 5678, 9012</p>
        </div>
      </div>
    </div>
  )
}

export default JoinEvent
