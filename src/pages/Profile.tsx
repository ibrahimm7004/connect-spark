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
import { Tables } from '@/integrations/supabase/types';
import { generateUserEmbedding, computeUserMatches } from '@/lib/api-stubs';
import { 
  ArrowLeft, 
  User, 
  Plus, 
  X, 
  Save,
  Briefcase,
  Heart
} from 'lucide-react';

type Profile = Tables<'profiles'>;

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hobbyInput, setHobbyInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role_at_company: '',
    hobbies: [] as string[],
    passions: '',
    people_to_meet: '',
    myers_briggs: '',
    enneagram: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        navigate('/onboarding');
        return;
      }

      setProfile(profileData);
      setFormData({
        name: profileData.name,
        role_at_company: profileData.role_at_company,
        hobbies: profileData.hobbies,
        passions: profileData.passions,
        people_to_meet: profileData.people_to_meet,
        myers_briggs: profileData.myers_briggs || '',
        enneagram: profileData.enneagram || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const saveProfile = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          role_at_company: formData.role_at_company,
          hobbies: formData.hobbies,
          passions: formData.passions,
          people_to_meet: formData.people_to_meet,
          myers_briggs: formData.myers_briggs || null,
          enneagram: formData.enneagram || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Regenerate embedding
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
        console.warn('Embedding regeneration failed (continuing):', e);
      }

      // Recompute matches for latest active event if any
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
        console.warn('Match recompute skipped:', e);
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile changes have been saved successfully.",
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>
          </div>
          <Button 
            onClick={saveProfile}
            disabled={saving}
            variant="hero"
          >
            {saving ? 'Saving...' : 'Save Changes'}
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your name and professional role at events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role at Company</Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer, Product Manager"
                value={formData.role_at_company}
                onChange={(e) => setFormData(prev => ({ ...prev, role_at_company: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Hobbies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Hobbies Outside of Work
            </CardTitle>
            <CardDescription>
              What you enjoy doing in your free time
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a hobby (e.g., Photography, Hiking)"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              />
              <Button type="button" onClick={addHobby} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
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
          </CardContent>
        </Card>

        {/* Professional Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Interests</CardTitle>
            <CardDescription>
              Help others understand what drives you and who you want to meet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passions">What are you passionate about?</Label>
              <Textarea
                id="passions"
                placeholder="Describe what drives you professionally and personally..."
                value={formData.passions}
                onChange={(e) => setFormData(prev => ({ ...prev, passions: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="people_to_meet">What types of people would you like to meet?</Label>
              <Textarea
                id="people_to_meet"
                placeholder="Describe who you'd like to connect with at events..."
                value={formData.people_to_meet}
                onChange={(e) => setFormData(prev => ({ ...prev, people_to_meet: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personality (Optional) */}
        <Card>
          <CardHeader>
            <CardTitle>Personality Insights</CardTitle>
            <CardDescription>
              Optional personality assessments help us make better matches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="myers_briggs">Myers-Briggs Type</Label>
              <Input
                id="myers_briggs"
                placeholder="e.g., ENFP, INTJ"
                value={formData.myers_briggs}
                onChange={(e) => setFormData(prev => ({ ...prev, myers_briggs: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enneagram">Enneagram Type</Label>
              <Input
                id="enneagram"
                placeholder="e.g., Type 3, 7w8"
                value={formData.enneagram}
                onChange={(e) => setFormData(prev => ({ ...prev, enneagram: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button 
            onClick={saveProfile}
            disabled={saving}
            variant="hero"
            size="lg"
          >
            {saving ? 'Saving Changes...' : 'Save Profile'}
            <Save className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;