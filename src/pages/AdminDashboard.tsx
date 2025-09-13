import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { generateEventQR, triggerFullRecompute } from '@/lib/api-stubs';
import { 
  Calendar,
  Plus,
  Settings,
  Users,
  QrCode,
  BarChart3,
  Trash2,
  LogOut,
  RefreshCw,
  DollarSign
} from 'lucide-react';

type Event = Tables<'events'>;

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [recomputeLoading, setRecomputeLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    code: '',
  });

  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userRole && userRole !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    if (userRole === 'admin') {
      loadEvents();
    }
  }, [user, userRole, navigate]);

  const loadEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load events. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateEventCode = () => {
    const codes = ['TECH', 'BIZZ', 'CONF', 'MEET', 'CONN', 'GROW', 'NETW', 'SPARK'];
    return codes[Math.floor(Math.random() * codes.length)];
  };

  const createEvent = async () => {
    try {
      if (!newEvent.name || !newEvent.date) {
        toast({
          variant: "destructive",
          title: "Missing Information",
          description: "Please provide at least a name and date for the event.",
        });
        return;
      }

      const eventCode = newEvent.code || generateEventCode();
      
      const { data: inserted, error } = await supabase
        .from('events')
        .insert({
          name: newEvent.name,
          description: newEvent.description || null,
          date: newEvent.date,
          time: newEvent.time || null,
          code: eventCode,
          created_by: user?.id,
          status: 'active',
        })
        .select('id')
        .single();

      if (error) throw error;

      // Generate QR and update event
      try {
        if (inserted?.id) {
          await generateEventQR(inserted.id);
        }
      } catch (e) {
        console.warn('QR generation failed:', e);
      }

      toast({
        title: "Event Created!",
        description: `Event "${newEvent.name}" created with code: ${eventCode}`,
      });

      setCreateEventOpen(false);
      setNewEvent({ name: '', description: '', date: '', time: '', code: '' });
      loadEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        variant: "destructive",
        title: "Error Creating Event",
        description: error.message,
      });
    }
  };

  const markEventAsOver = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'over' })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Marked as Over",
        description: "Attendees can now complete their event recap.",
      });

      loadEvents();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'deleted' })
        .eq('id', eventId);

      if (error) throw error;

      toast({
        title: "Event Deleted",
        description: "Event has been removed from the system.",
      });

      loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const triggerFullRecomputeAction = async () => {
    setRecomputeLoading(true);
    try {
      await triggerFullRecompute();
      toast({
        title: "Recompute Triggered",
        description: "All matches are being recalculated. This may take a few minutes.",
      });
    } catch (error) {
      console.error('Error triggering recompute:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to trigger recompute. Please try again.",
      });
    } finally {
      setRecomputeLoading(false);
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
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
            <h1 className="text-2xl font-bold text-primary">ConnectSpark Admin</h1>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Administrator
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Create Event
              </CardTitle>
              <CardDescription>
                Set up a new networking event with custom code and QR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="w-full">
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                    <DialogDescription>
                      Set up a new networking event. A QR code will be generated automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-name">Event Name *</Label>
                      <Input
                        id="event-name"
                        placeholder="Tech Conference 2024"
                        value={newEvent.name}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date *</Label>
                      <Input
                        id="event-date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-time">Time (Optional)</Label>
                      <Input
                        id="event-time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-code">Custom Code (Optional)</Label>
                      <Input
                        id="event-code"
                        placeholder="Auto-generated if empty"
                        value={newEvent.code}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description (Optional)</Label>
                      <Textarea
                        id="event-description"
                        placeholder="Brief description of the event"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateEventOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createEvent}>
                      Create Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-accent" />
                Recompute Matches
              </CardTitle>
              <CardDescription>
                Trigger AI to recalculate all user matches across events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>Estimated cost: $2.50</span>
              </div>
              <Button 
                variant="accent" 
                className="w-full"
                onClick={triggerFullRecomputeAction}
                disabled={recomputeLoading}
              >
                {recomputeLoading ? 'Processing...' : 'Trigger Recompute'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-success" />
                Analytics
              </CardTitle>
              <CardDescription>
                View platform usage and networking statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Events ({events.length})
            </CardTitle>
            <CardDescription>
              Manage all events in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Events Created</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first event to start facilitating connections
                </p>
                <Button onClick={() => setCreateEventOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Create First Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{event.name}</h4>
                        <Badge 
                          variant={event.status === 'active' ? 'default' : 
                                  event.status === 'over' ? 'secondary' : 'destructive'}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.date} {event.time && `• ${event.time}`}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono bg-muted px-2 py-1 rounded">
                          Code: {event.code}
                        </span>
                        {event.qr_url && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <QrCode className="w-3 h-3" />
                            QR Available
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {event.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markEventAsOver(event.id)}
                        >
                          Mark as Over
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;