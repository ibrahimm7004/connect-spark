import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateUserEmbedding, computeUserMatches } from '@/lib/api-stubs';
import { Users2, Plus, X, ArrowRight, User } from 'lucide-react';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role_at_company: '',
    hobbies: [] as string[],
    passions: '',
    people_to_meet: '',
    myers_briggs: '',
    enneagram: '',
  });
  const [hobbyInput, setHobbyInput] = useState('');
  
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user already has a profile
    const checkProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        // Profile exists, redirect to appropriate dashboard
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    };
    
    checkProfile();
  }, [user, userRole, navigate]);

  const addHobby = () => {
    if (hobbyInput.trim() && !formData.hobbies.includes(hobbyInput.trim())) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, hobbyInput.trim()]
      }));
      setHobbyInput('');
    }
  };

  const removeHobby = (hobby: string) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(h => h !== hobby)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: formData.name,
          role_at_company: formData.role_at_company,
          hobbies: formData.hobbies,
          passions: formData.passions,
          people_to_meet: formData.people_to_meet,
          myers_briggs: formData.myers_briggs || null,
          enneagram: formData.enneagram || null,
        });

      if (profileError) throw profileError;

      // Create user role if it doesn't exist
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          id: user.id,
          role: 'user'
        });

      if (roleError) throw roleError;

      // Generate and store embedding
      try {
        const vector = await generateUserEmbedding({
          hobbies: formData.hobbies.join(', '),
          about: [formData.passions, formData.people_to_meet, formData.role_at_company]
            .filter(Boolean)
            .join('. '),
        });
        await supabase
          .from('profiles')
          .update({ embedding: JSON.stringify(vector) })
          .eq('id', user.id);
      } catch (e) {
        console.warn('Embedding generation failed (continuing):', e);
      }

      // If user already joined an active event, compute matches
      try {
        const { data: attendeeData } = await supabase
          .from('event_attendees')
          .select(`*, events!inner(status)`)
          .eq('user_id', user.id)
          .eq('events.status', 'active')
          .order('joined_at', { ascending: false })
          .limit(1);
        if (attendeeData && attendeeData.length > 0) {
          const eventId = attendeeData[0].event_id as string;
          await computeUserMatches(user.id, eventId);
        }
      } catch (e) {
        console.warn('Match compute skipped:', e);
      }

      toast({
        title: "Profile Created!",
        description: "Welcome to ConnectSpark. Let's find your first event!",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile creation error:', error);
      toast({
        variant: "destructive",
        title: "Error Creating Profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.role_at_company)) {
      toast({
        variant: "destructive",
        title: "Missing Information", 
        description: "Please fill in your name and role.",
      });
      return;
    }
    
    if (step === 2 && formData.hobbies.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please add at least one hobby.",
      });
      return;
    }
    
    if (step === 3 && (!formData.passions || !formData.people_to_meet)) {
      toast({
        variant: "destructive", 
        title: "Missing Information",
        description: "Please complete both passion and networking fields.",
      });
      return;
    }
    
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Profile</h1>
          <p className="text-white/80">Help us connect you with the right people at events</p>
          
          {/* Progress Bar */}
          <div className="mt-6 flex justify-center space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full transition-all duration-300 ${
                  s <= step 
                    ? 'bg-white shadow-glow' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-large bg-card/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl">
              Step {step} of 4
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about yourself"}
              {step === 2 && "What do you enjoy outside of work?"}
              {step === 3 && "Your professional interests"}
              {step === 4 && "Optional personality insights"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role at Company *</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Software Engineer, Product Manager"
                    value={formData.role_at_company}
                    onChange={(e) => setFormData(prev => ({ ...prev, role_at_company: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hobbies">Hobbies Outside of Work *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hobbies"
                      placeholder="Add a hobby (e.g., Photography, Hiking)"
                      value={hobbyInput}
                      onChange={(e) => setHobbyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
                    />
                    <Button type="button" onClick={addHobby} size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {formData.hobbies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.hobbies.map((hobby) => (
                      <Badge key={hobby} variant="secondary" className="gap-1">
                        {hobby}
                        <button onClick={() => removeHobby(hobby)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passions">What are you passionate about? *</Label>
                  <Textarea
                    id="passions"
                    placeholder="Describe what drives you professionally and personally..."
                    value={formData.passions}
                    onChange={(e) => setFormData(prev => ({ ...prev, passions: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="people_to_meet">What types of people would you like to meet? *</Label>
                  <Textarea
                    id="people_to_meet"
                    placeholder="Describe who you'd like to connect with at events..."
                    value={formData.people_to_meet}
                    onChange={(e) => setFormData(prev => ({ ...prev, people_to_meet: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  These are optional but help us make better matches
                </p>
                <div className="space-y-2">
                  <Label htmlFor="myers_briggs">Myers-Briggs Type (Optional)</Label>
                  <Input
                    id="myers_briggs"
                    placeholder="e.g., ENFP, INTJ"
                    value={formData.myers_briggs}
                    onChange={(e) => setFormData(prev => ({ ...prev, myers_briggs: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enneagram">Enneagram Type (Optional)</Label>
                  <Input
                    id="enneagram"
                    placeholder="e.g., Type 3, 7w8"
                    value={formData.enneagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, enneagram: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button 
                variant="ghost" 
                onClick={prevStep}
                disabled={step === 1}
              >
                Previous
              </Button>
              <Button 
                variant="hero"
                onClick={nextStep}
                disabled={loading}
              >
                {loading && step === 4 ? 'Creating Profile...' : step === 4 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;