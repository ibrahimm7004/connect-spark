import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateRecapInfographic } from '@/lib/api-stubs';
import { Tables } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  Download, 
  Star, 
  Users, 
  TrendingUp, 
  CheckCircle,
  BarChart3
} from 'lucide-react';

type Event = Tables<'events'>;

const EventRecap = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [generatingInfographic, setGeneratingInfographic] = useState(false);
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [step, setStep] = useState<'survey' | 'complete'>('survey');
  
  const [responses, setResponses] = useState({
    q1_goals_met: '',
    q2_repeat: '',
    q3_business_opportunities: ''
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !eventId) {
      navigate('/dashboard');
      return;
    }
    
    loadEventData();
  }, [user, eventId, navigate]);

  const loadEventData = async () => {
    if (!eventId) return;
    
    try {
      // Load event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('status', 'over')
        .single();

      if (eventError || !eventData) {
        toast({
          variant: "destructive",
          title: "Event Not Found",
          description: "This event doesn't exist or hasn't ended yet.",
        });
        navigate('/dashboard');
        return;
      }

      setEvent(eventData);

      // Check if user already completed recap
      const { data: existingRecap } = await supabase
        .from('recaps')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user?.id)
        .single();

      if (existingRecap) {
        setStep('complete');
        setInfographicUrl(existingRecap.recap_url);
      }
    } catch (error: any) {
      console.error('Error loading event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load event data.",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const submitSurvey = async () => {
    if (!user || !eventId || !event) return;
    
    // Validate responses
    if (!responses.q1_goals_met || !responses.q2_repeat || !responses.q3_business_opportunities) {
      toast({
        variant: "destructive",
        title: "Incomplete Survey",
        description: "Please answer all questions before submitting.",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Save survey responses
      const { error: recapError } = await supabase
        .from('recaps')
        .insert({
          event_id: eventId,
          user_id: user.id,
          q1_goals_met: responses.q1_goals_met === 'yes',
          q2_repeat: responses.q2_repeat === 'yes', 
          q3_business_opportunities: responses.q3_business_opportunities === 'yes',
        });

      if (recapError) throw recapError;

      toast({
        title: "Survey Completed!",
        description: "Thank you for your feedback. Generating your recap infographic...",
      });

      setStep('complete');
      
      // Generate infographic
      setGeneratingInfographic(true);
      try {
        const infographicUrl = await generateRecapInfographic(eventId, user.id);
        
        // Update recap with infographic URL
        await supabase
          .from('recaps')
          .update({ recap_url: infographicUrl })
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        setInfographicUrl(infographicUrl);
        
        toast({
          title: "Infographic Ready!",
          description: "Your personalized event recap is ready for download.",
        });
      } catch (error) {
        console.error('Error generating infographic:', error);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "Failed to generate infographic, but your responses were saved.",
        });
      } finally {
        setGeneratingInfographic(false);
      }
    } catch (error: any) {
      console.error('Error submitting survey:', error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadInfographic = () => {
    if (infographicUrl) {
      window.open(infographicUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading event recap...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-4">This event doesn't exist or hasn't ended yet.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="p-4">
        <Button 
          variant="glass" 
          onClick={() => navigate('/dashboard')}
          className="text-white border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Event Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Recap</h1>
          <p className="text-white/80 text-lg">{event.name}</p>
        </div>

        {step === 'survey' ? (
          <Card className="shadow-large bg-card/95 backdrop-blur-md">
            <CardHeader>
              <CardTitle>How was your networking experience?</CardTitle>
              <CardDescription>
                Help us improve future events by sharing your feedback
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Question 1 */}
              <div className="space-y-4">
                <h3 className="font-medium">
                  I am closer to my goals because of the people I met with this app.
                </h3>
                <RadioGroup
                  value={responses.q1_goals_met}
                  onValueChange={(value) => setResponses(prev => ({ ...prev, q1_goals_met: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="q1-yes" />
                    <Label htmlFor="q1-yes" className="cursor-pointer">Yes, definitely</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="q1-no" />
                    <Label htmlFor="q1-no" className="cursor-pointer">Not really</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 2 */}
              <div className="space-y-4">
                <h3 className="font-medium">
                  I would attend this event again or recommend it to a colleague.
                </h3>
                <RadioGroup
                  value={responses.q2_repeat}
                  onValueChange={(value) => setResponses(prev => ({ ...prev, q2_repeat: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="q2-yes" />
                    <Label htmlFor="q2-yes" className="cursor-pointer">Yes, I would</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="q2-no" />
                    <Label htmlFor="q2-no" className="cursor-pointer">No, I wouldn't</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 3 */}
              <div className="space-y-4">
                <h3 className="font-medium">
                  I had conversations today that are likely to lead to business opportunities or collaborations.
                </h3>
                <RadioGroup
                  value={responses.q3_business_opportunities}
                  onValueChange={(value) => setResponses(prev => ({ ...prev, q3_business_opportunities: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="q3-yes" />
                    <Label htmlFor="q3-yes" className="cursor-pointer">Yes, very likely</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="q3-no" />
                    <Label htmlFor="q3-no" className="cursor-pointer">Probably not</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                onClick={submitSurvey}
                disabled={submitting}
                variant="hero"
                className="w-full"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
                <CheckCircle className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-large bg-card/95 backdrop-blur-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <CardTitle>Thank You!</CardTitle>
              <CardDescription>
                Your feedback has been recorded. Here's your personalized event recap.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              {generatingInfographic ? (
                <div className="py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Generating your personalized infographic...</p>
                </div>
              ) : infographicUrl ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 bg-gradient-primary rounded-lg mx-auto flex items-center justify-center shadow-glow">
                    <BarChart3 className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-muted-foreground">
                    Your personalized recap infographic is ready!
                  </p>
                  <Button 
                    onClick={downloadInfographic}
                    variant="hero"
                    size="lg"
                  >
                    <Download className="w-4 h-4" />
                    Download Infographic
                  </Button>
                </div>
              ) : (
                <div className="py-8">
                  <p className="text-muted-foreground">
                    Infographic generation failed, but your feedback was saved.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EventRecap;