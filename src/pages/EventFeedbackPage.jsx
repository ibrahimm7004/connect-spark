import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'
import Card from '../components/Card'
import Navbar from '../components/Navbar'
import { ArrowLeft, Star, MessageSquare, Users, Calendar, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'

const EventFeedbackPage = () => {
  const { eventId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [attendees, setAttendees] = useState([])
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    wouldRecommend: false
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (eventId) {
      fetchEventDetails()
      fetchEventAttendees()
    }
  }, [eventId])

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const fetchEventAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          users (
            id,
            name,
            email,
            profile_pic
          )
        `)
        .eq('event_id', eventId)

      if (error) throw error
      setAttendees(data || [])
    } catch (error) {
      console.error('Error fetching attendees:', error)
    }
  }

  const handleRatingChange = (rating) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    
    if (feedback.rating === 0) {
      toast.error('Please provide a rating')
      return
    }

    setSubmitting(true)
    try {
      // Here you would typically save feedback to a feedback table
      // For now, we'll just show a success message
      toast.success('Thank you for your feedback!')
      navigate('/home')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Feedback</h1>
          <p className="text-gray-600">
            Share your experience and help us improve future events.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
              <p className="text-gray-600 mb-6">{event.description}</p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <div>
                    <p className="font-medium">{formatDate(event.date)}</p>
                    <p className="text-sm">{formatTime(event.date)}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-3" />
                    <p>{event.location}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-3" />
                <p>{attendees.length} attendees</p>
              </div>
            </Card>

            {/* Feedback Form */}
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Share Your Feedback</h3>
              
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate this event?
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                          rating <= feedback.rating
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {feedback.rating === 0 && 'Select a rating'}
                    {feedback.rating === 1 && 'Poor'}
                    {feedback.rating === 2 && 'Fair'}
                    {feedback.rating === 3 && 'Good'}
                    {feedback.rating === 4 && 'Very Good'}
                    {feedback.rating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Comments
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                {/* Recommendation */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recommend"
                    checked={feedback.wouldRecommend}
                    onChange={(e) => setFeedback(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="recommend" className="ml-2 block text-sm text-gray-700">
                    I would recommend this event to others
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || feedback.rating === 0}
                  className="w-full"
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                  <MessageSquare className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </Card>
          </div>

          {/* Attendees List */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Attendees</h3>
              <div className="space-y-3">
                {attendees.length === 0 ? (
                  <p className="text-gray-500 text-sm">No attendees yet</p>
                ) : (
                  attendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {attendee.users?.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attendee.users?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {attendee.users?.email}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventFeedbackPage
