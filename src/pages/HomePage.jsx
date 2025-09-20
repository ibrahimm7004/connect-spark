import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, User, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [joinedEvents, setJoinedEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch user's joined events
  useEffect(() => {
    const fetchJoinedEvents = async () => {
      if (!user) return

      try {
        // Try database query first
        const { data, error } = await supabase
          .from('event_attendees')
          .select(`
            event_id,
            events (
              id,
              title,
              description,
              date,
              location
            )
          `)
          .eq('user_id', user.id)

        if (error) {
          console.error('Error fetching joined events:', error)
          // Fallback to localStorage if database fails
          const localEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]')
          if (localEvents.length > 0) {
            setJoinedEvents(localEvents)
            setLoading(false)
            return
          }
          // Use mock data as final fallback
          setJoinedEvents([
            {
              id: '1',
              title: 'Mastering Photography & Visual Storytelling',
              date: '2025-01-25T00:00:00Z',
              location: 'San Francisco, CA',
              description: 'Learn advanced photography techniques'
            }
          ])
          return
        }

        // Transform the data to get events directly
        const events = data?.map(item => item.events).filter(Boolean) || []
        setJoinedEvents(events)
      } catch (error) {
        console.error('Error fetching joined events:', error)
        // Fallback to localStorage if database fails
        const localEvents = JSON.parse(localStorage.getItem('joinedEvents') || '[]')
        setJoinedEvents(localEvents)
      } finally {
        setLoading(false)
      }
    }

    fetchJoinedEvents()
  }, [user])

  const handleJoinEvent = () => {
    navigate('/join-event')
  }

  const handleProfile = () => {
    navigate('/my-profile')
  }

  const handleIntroClick = () => {
    navigate('/home')
  }

  const handleEventClick = (eventId) => {
    navigate('/connections')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white px-6 py-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={handleIntroClick}
          className="text-[32px] font-display text-brand-orange uppercase hover:opacity-80 transition-opacity cursor-pointer"
        >
          Intro
        </button>
        <div className="flex items-center gap-4">
          {/* Profile button */}
          <button 
            onClick={handleProfile}
            className="w-10 h-10 rounded-full bg-gray-light flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <User className="w-5 h-5 text-brand-dark" />
          </button>
          {/* Add event button */}
          <button 
            onClick={handleJoinEvent}
            className="w-11 h-11 rounded-full bg-gradient-to-r from-[#EC874E] to-[#BF341E] flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Add Event Card - Clickable */}
      <button 
        onClick={handleJoinEvent}
        className="w-full relative bg-gradient-to-r from-[#EC874E] to-[#BF341E] h-[72px] rounded-[20px] flex items-center justify-center mb-8 hover:opacity-90 transition-opacity"
      >
        <span className="text-[12px] font-normal leading-[18px]">
          Add an event
        </span>
      </button>

      {/* Loading State */}
      {loading && (
        <div className="text-center text-gray-body">
          <p>Loading your events...</p>
        </div>
      )}

      {/* No Events State */}
      {!loading && joinedEvents.length === 0 && (
        <div className="text-center text-gray-body">
          <p>You haven't joined any events yet.</p>
          <p className="text-sm mt-2">Click "Add an event" to join your first event!</p>
        </div>
      )}

      {/* Joined Events */}
      {!loading && joinedEvents.map((event) => (
        <button
          key={event.id}
          onClick={() => handleEventClick(event.id)}
          className="w-full border border-brand-orange rounded-[20px] p-5 mb-4 hover:bg-gray-800 transition-colors text-left"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[12px] text-white leading-[18px] mb-1">
                {formatDate(event.date)}
              </p>
              <h2 className="text-[18px] font-medium uppercase leading-6">
                {event.title}
              </h2>
              {event.location && (
                <p className="text-[14px] text-gray-body mt-1">
                  {event.location}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Orange dot */}
              <span className="w-7 h-7 rounded-full bg-brand-orange" />
              <ChevronRight className="w-5 h-5 text-white" />
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default HomePage
