import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateUserEmbedding, computeUserMatches } from '@/lib/api-stubs';
import { QrCode, Hash, ArrowLeft, Camera } from 'lucide-react';

const JoinEvent = () => {
  const [eventCode, setEventCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const joinEventByCode = async () => {
    if (!user || !eventCode.trim()) return;
    
    setLoading(true);
    try {
      // Find event by code
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('code', eventCode.trim().toUpperCase())
        .eq('status', 'active')
        .single();

      if (eventError || !event) {
        toast({
          variant: "destructive",
          title: "Event Not Found",
          description: "Please check the event code and try again.",
        });
        return;
      }

      // Check if user is already attending
      const { data: existingAttendee } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_id', event.id)
        .single();

      if (existingAttendee) {
        toast({
          title: "Already Joined",
          description: "You're already attending this event!",
        });
        navigate('/dashboard');
        return;
      }

      // Join event
      const { error: joinError } = await supabase
        .from('event_attendees')
        .insert({
          user_id: user.id,
          event_id: event.id,
        });

      if (joinError) throw joinError;

      toast({
        title: "Event Joined!",
        description: `Welcome to ${event.name}. Let's start networking!`,
      });

      // Generate embedding if missing and compute matches
      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profile) {
          const hasEmbedding = !!profile.embedding;
          if (!hasEmbedding) {
            const vector = await generateUserEmbedding({
              hobbies: (profile.hobbies || []).join(', '),
              about: [profile.passions, profile.people_to_meet, profile.role_at_company]
                .filter(Boolean)
                .join('. '),
            });
            await supabase
              .from('profiles')
              .update({ embedding: JSON.stringify(vector) })
              .eq('id', user.id);
          }
        }
        await computeUserMatches(user.id, event.id);
      } catch (e) {
        console.warn('Post-join matching skipped:', e);
      }

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to join event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateQRScan = async () => {
    // Simulate QR code scanning - in real app this would use camera
    const mockEventCodes = ['TECH', 'BIZZ', 'DEMO', 'CONF'];
    const randomCode = mockEventCodes[Math.floor(Math.random() * mockEventCodes.length)];
    
    setEventCode(randomCode);
    toast({
      title: "QR Code Scanned",
      description: `Found event code: ${randomCode}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Button 
          variant="glass" 
          onClick={() => navigate('/dashboard')}
          className="text-white border-white/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Event</h1>
            <p className="text-white/80">
              Scan a QR code or enter the 4-digit event code
            </p>
          </div>

          <Card className="shadow-large bg-card/95 backdrop-blur-md">
            <CardContent className="p-6">
              <Tabs defaultValue="qr" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="qr">QR Code</TabsTrigger>
                  <TabsTrigger value="code">Event Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="qr" className="space-y-6">
                  <div className="text-center space-y-4">
                    <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Camera preview</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Position the QR code within the frame to scan
                    </p>
                    
                    <Button 
                      variant="accent" 
                      onClick={simulateQRScan}
                      className="w-full"
                    >
                      Simulate QR Scan (Demo)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-code">Event Code</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="event-code"
                          placeholder="Enter 4-digit code"
                          value={eventCode}
                          onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                          className="pl-10 text-center text-lg font-mono"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={joinEventByCode}
                      disabled={loading || eventCode.length !== 4}
                      variant="hero"
                      className="w-full"
                    >
                      {loading ? 'Joining Event...' : 'Join Event'}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Don't have an event code? Contact the event organizer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinEvent;