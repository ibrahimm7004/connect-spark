-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Events: Public read access for active events, admins can manage
CREATE POLICY "Anyone can view active events" ON public.events
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage events" ON public.events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Event attendees: Users can view attendees of events they're in, can manage their own attendance
CREATE POLICY "Users can view event attendees" ON public.event_attendees
    FOR SELECT USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.event_attendees ea 
            WHERE ea.user_id = auth.uid() AND ea.event_id = event_attendees.event_id
        )
    );

CREATE POLICY "Users can manage own attendance" ON public.event_attendees
    FOR ALL USING (user_id = auth.uid());

-- Matches: Users can view their own matches
CREATE POLICY "Users can view own matches" ON public.matches
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert matches" ON public.matches
    FOR INSERT WITH CHECK (true); -- Allow system to create matches

-- Connections: Users can view connections involving them, can manage their own sent connections
CREATE POLICY "Users can view relevant connections" ON public.connections
    FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send connections" ON public.connections
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update received connections" ON public.connections
    FOR UPDATE USING (receiver_id = auth.uid());

-- Recaps: Users can view and manage their own recaps
CREATE POLICY "Users can view own recaps" ON public.recaps
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own recaps" ON public.recaps
    FOR ALL USING (user_id = auth.uid());

-- User roles: Users can view their own role, admins can manage all roles
CREATE POLICY "Users can view own role" ON public.user_roles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert own role" ON public.user_roles
    FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );