import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { 
  QrCode, 
  Plus, 
  Users, 
  Heart, 
  MessageCircle, 
  Calendar,
  Settings,
  LogOut,
  ArrowRight,
  CheckCircle,
  X
} from 'lucide-react';

type Profile = Tables<'profiles'>;
type Event = Tables<'events'>;
type Match = Tables<'matches'>;
type Connection = Tables<'connections'>;

const Dashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileData) {
        navigate('/onboarding');
        return;
      }
      
      setProfile(profileData);

      // Load current event (get the latest active event the user joined)
      const { data: attendeeData } = await supabase
        .from('event_attendees')
        .select(`
          *,
          events!inner(*)
        `)
        .eq('user_id', user.id)
        .eq('events.status', 'active')
        .order('joined_at', { ascending: false })
        .limit(1);

      if (attendeeData && attendeeData.length > 0) {
        setCurrentEvent(attendeeData[0].events as Event);
        const eventId = attendeeData[0].event_id;

        // Load matches for this event
        const { data: matchData } = await supabase
          .from('matches')
          .select('*')
          .eq('user_id', user.id)
          .eq('event_id', eventId)
          .limit(3);

        if (matchData) {
          setMatches(matchData);
        }

        // Load pending connection requests
        const { data: connectionData } = await supabase
          .from('connections')
          .select('*')
          .eq('receiver_id', user.id)
          .eq('status', 'pending');

        if (connectionData) {
          setConnections(connectionData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionResponse = async (connectionId: string, action: 'accept' | 'reject') => {
    try {
      const status = action === 'accept' ? 'accepted' : 'rejected';
      
      const { error } = await supabase
        .from('connections')
        .update({ status })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: action === 'accept' ? "Connection Accepted!" : "Connection Declined",
        description: action === 'accept' 
          ? "You can now connect with this person." 
          : "Connection request declined.",
      });

      // Refresh connections
      loadUserData();
    } catch (error) {
      console.error('Error updating connection:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update connection. Please try again.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">ConnectSpark</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.name}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* No Event State */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Ready to Connect?</h2>
              <p className="text-muted-foreground text-lg">
                Join an event to start networking with like-minded professionals
              </p>
            </div>

            <Card className="bg-gradient-card shadow-medium">
              <CardContent className="p-8 space-y-4">
                <h3 className="text-xl font-semibold">Join Your First Event</h3>
                <p className="text-muted-foreground">
                  Scan a QR code or enter a 4-digit event code to get started
                </p>
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => navigate('/join-event')}
                  className="w-full"
                >
                  Join Event
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')}
            >
              <Settings className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">ConnectSpark</h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-success/10 text-success border-success">
              {currentEvent.name}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Personal QR Code */}
        <Card className="bg-gradient-card shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Your Event QR Code
            </CardTitle>
            <CardDescription>
              Show this to other attendees to connect instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Requests */}
        {connections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-accent" />
                Connection Requests ({connections.length})
              </CardTitle>
              <CardDescription>
                People want to connect with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">New Connection Request</p>
                    <p className="text-sm text-muted-foreground">Someone wants to connect with you</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="success"
                      onClick={() => handleConnectionResponse(connection.id, 'accept')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleConnectionResponse(connection.id, 'reject')}
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Top Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Top Matches
            </CardTitle>
            <CardDescription>
              People you should meet at this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No matches found yet.</p>
                <p className="text-sm text-muted-foreground">Check back soon as more people join!</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((match) => (
                  <Card key={match.id} className="cursor-pointer hover:shadow-medium transition-all">
                    <CardContent className="p-4 space-y-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Match #{match.id.slice(-4)}</h4>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">WHY MEET:</p>
                          <p className="text-sm">{match.why_meet}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">IN COMMON:</p>
                          <p className="text-sm">{match.things_in_common}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">DISCUSS:</p>
                          <p className="text-sm">{match.dive_deeper}</p>
                        </div>
                      </div>

                      <Button 
                        variant="accent" 
                        size="sm" 
                        className="w-full"
                        onClick={() => navigate(`/match/${match.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Button 
            variant="outline" 
            className="h-16 justify-start"
            onClick={() => navigate('/join-event')}
          >
            <Plus className="w-5 h-5 mr-3" />
            Join Another Event
          </Button>
          <Button 
            variant="outline" 
            className="h-16 justify-start"
            onClick={() => navigate('/profile')}
          >
            <Settings className="w-5 h-5 mr-3" />
            Edit Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;