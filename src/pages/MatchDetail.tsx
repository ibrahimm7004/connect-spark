import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  Users, 
  Heart, 
  MessageCircle, 
  User,
  Briefcase,
  MapPin,
  Calendar
} from 'lucide-react';

type Match = Tables<'matches'>;
type Profile = Tables<'profiles'>;

const MatchDetail = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !matchId) {
      navigate('/dashboard');
      return;
    }
    
    loadMatchDetail();
  }, [user, matchId, navigate]);

  const loadMatchDetail = async () => {
    if (!matchId) return;
    
    try {
      // Load match details
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (matchError || !matchData) {
        throw new Error('Match not found');
      }

      setMatch(matchData);

      // Load matched user's profile
      if (matchData.match_user_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', matchData.match_user_id)
          .single();

        setMatchProfile(profileData);
      }
    } catch (error: any) {
      console.error('Error loading match:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load match details. Please try again.",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async () => {
    if (!user || !match || !match.match_user_id) return;
    
    setConnecting(true);
    try {
      // Check if connection already exists
      const { data: existingConnection } = await supabase
        .from('connections')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', match.match_user_id)
        .single();

      if (existingConnection) {
        toast({
          title: "Already Connected",
          description: "You've already sent a connection request to this person.",
        });
        return;
      }

      // Create connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: match.match_user_id,
          event_id: match.event_id,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Connection Sent!",
        description: "Your connection request has been sent. They'll be notified on their dashboard.",
      });
    } catch (error: any) {
      console.error('Error sending connection:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match || !matchProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
          <p className="text-muted-foreground mb-4">This match doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{matchProfile.name}</h1>
              <p className="text-muted-foreground">{matchProfile.role_at_company}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* AI-Generated Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Heart className="w-5 h-5" />
                Why You Should Meet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{match.why_meet}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Users className="w-5 h-5" />
                Things in Common
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{match.things_in_common}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <MessageCircle className="w-5 h-5" />
                Where to Dive Deeper
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{match.dive_deeper}</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Professional Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Role</h4>
                <p className="text-muted-foreground">{matchProfile.role_at_company}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">What They're Passionate About</h4>
                <p className="text-sm leading-relaxed">{matchProfile.passions}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Looking to Connect With</h4>
                <p className="text-sm leading-relaxed">{matchProfile.people_to_meet}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Hobbies</h4>
                <div className="flex flex-wrap gap-2">
                  {matchProfile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="secondary">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {(matchProfile.myers_briggs || matchProfile.enneagram) && (
                <div>
                  <h4 className="font-medium mb-2">Personality</h4>
                  <div className="flex gap-2">
                    {matchProfile.myers_briggs && (
                      <Badge variant="outline">Myers-Briggs: {matchProfile.myers_briggs}</Badge>
                    )}
                    {matchProfile.enneagram && (
                      <Badge variant="outline">Enneagram: {matchProfile.enneagram}</Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Connection Action */}
        <Card className="bg-gradient-accent text-center">
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Connect?</h3>
            <p className="text-white/90 mb-6">
              Send a connection request to start networking with {matchProfile.name}
            </p>
            <Button 
              variant="glass"
              size="lg"
              onClick={sendConnectionRequest}
              disabled={connecting}
              className="text-white border-white/20"
            >
              {connecting ? 'Sending...' : 'Send Connection Request'}
              <Heart className="w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchDetail;