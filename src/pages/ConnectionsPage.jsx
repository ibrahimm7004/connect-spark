import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [peopleYouShouldKnow, setPeopleYouShouldKnow] = useState([]);
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all connection data from Supabase
  useEffect(() => {
    if (!user) return;
    
    const fetchConnectionData = async () => {
      try {
        setLoading(true);
        
        // Fetch people you should know (recommendations)
        const { data: recommendations, error: recError } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id)
          .limit(10);

        if (recError) throw recError;

        // Fetch incoming requests (where current user is receiver)
        const { data: incomingRequests, error: reqError } = await supabase
          .from('connections')
          .select(`
            *,
            profiles!connections_sender_id_fkey(*)
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending');

        if (reqError) throw reqError;

        // Fetch outgoing requests (where current user is sender)
        const { data: outgoingRequests, error: outError } = await supabase
          .from('connections')
          .select(`
            *,
            profiles!connections_receiver_id_fkey(*)
          `)
          .eq('sender_id', user.id)
          .eq('status', 'pending');

        if (outError) throw outError;

        // Fetch accepted connections
        const { data: acceptedConnections, error: connError } = await supabase
          .from('connections')
          .select(`
            *,
            profiles!connections_sender_id_fkey(*),
            profiles!connections_receiver_id_fkey(*)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');

        if (connError) throw connError;

        // Transform data for display
        setPeopleYouShouldKnow(recommendations || []);
        setRequests(incomingRequests || []);
        
        // Transform connections to show the other person's profile
        const transformedConnections = (acceptedConnections || []).map(conn => {
          const otherProfile = conn.sender_id === user.id 
            ? conn.profiles_receiver_id_fkey 
            : conn.profiles_sender_id_fkey;
          return {
            id: otherProfile.id,
            name: otherProfile.full_name,
            role: otherProfile.job_title,
            company: otherProfile.company,
            tags: otherProfile.interests ? otherProfile.interests.split(', ').slice(0, 2).join(', ') : 'No interests',
            img: otherProfile.profile_pic || "https://placehold.co/52x52"
          };
        });
        
        setConnections(transformedConnections);

      } catch (error) {
        console.error('Error fetching connection data:', error);
        // Fallback to mock data if database fails
        setPeopleYouShouldKnow([
          { id: "1", full_name: "Ted Baker", job_title: "Digital Marketing Specialist", profile_pic: "https://placehold.co/52x52" },
          { id: "2", full_name: "Sarah Johnson", job_title: "Product Manager", profile_pic: "https://placehold.co/52x52" },
          { id: "3", full_name: "Mike Chen", job_title: "UX Designer", profile_pic: "https://placehold.co/52x52" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchConnectionData();
  }, [user]);

  const handleUserClick = (userId) => {
    navigate(`/user-profile/${userId}`);
  };

  const handleSendRequest = async (userId, event) => {
    event.stopPropagation();
    
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      console.log(`Connection request sent to user ${userId}`);
      
      // Update local state to show request was sent
      setPeopleYouShouldKnow(prev => 
        prev.map(person => 
          person.id === userId 
            ? { ...person, requestSent: true }
            : person
        )
      );

    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestId, event) => {
    event.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      console.log(`Connection request accepted: ${requestId}`);
      
      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Add to connections
      const acceptedRequest = requests.find(req => req.id === requestId);
      if (acceptedRequest) {
        setConnections(prev => [...prev, {
          id: acceptedRequest.profiles.id,
          name: acceptedRequest.profiles.full_name,
          role: acceptedRequest.profiles.job_title,
          company: acceptedRequest.profiles.company,
          tags: acceptedRequest.profiles.interests ? acceptedRequest.profiles.interests.split(', ').slice(0, 2).join(', ') : 'No interests',
          img: acceptedRequest.profiles.profile_pic || "https://placehold.co/52x52"
        }]);
      }

    } catch (error) {
      console.error('Error accepting connection request:', error);
    }
  };

  const handleRejectRequest = async (requestId, event) => {
    event.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      console.log(`Connection request rejected: ${requestId}`);
      
      // Update local state
      setRequests(prev => prev.filter(req => req.id !== requestId));

    } catch (error) {
      console.error('Error rejecting connection request:', error);
    }
  };

  const handleIntroClick = () => {
    navigate('/home');
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#242424", color: "#fff", fontFamily: "Ubuntu", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading connections...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#242424", color: "#fff", fontFamily: "Ubuntu", padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
        <h1 
          style={{ 
            fontSize: 32, 
            fontFamily: "Changa One", 
            color: "#EB7437", 
            textTransform: "uppercase",
            cursor: "pointer"
          }}
          onClick={handleIntroClick}
        >
          Intro
        </h1>
        <img
          src="https://placehold.co/40x40"
          alt="Profile"
          style={{ width: 40, height: 40, borderRadius: "50%" }}
        />
      </div>

      {/* Section: People you should know */}
      <SectionTitle title="People you should know" showAll />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 24 }}>
        {peopleYouShouldKnow.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <img 
              src={p.profile_pic || "https://placehold.co/52x52"} 
              alt={p.full_name} 
              style={{ width: 52, height: 52, borderRadius: "50%", cursor: "pointer" }}
              onClick={() => handleUserClick(p.id)}
            />
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => handleUserClick(p.id)}>
              <h3 style={{ fontSize: 18, fontWeight: 400 }}>{p.full_name}</h3>
              <p style={{ fontSize: 12, color: "#BDBDBD" }}>{p.job_title}</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>{p.bio || "No bio available"}</p>
            </div>
            {/* Send Request Button */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: p.requestSent ? "#4CAF50" : "#EB7437",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                cursor: "pointer",
              }}
              onClick={(e) => handleSendRequest(p.id, e)}
            >
              {p.requestSent ? "✓" : "+"}
            </div>
          </div>
        ))}
      </div>

      {/* Section: Requests */}
      <SectionTitle title="Requests" style={{ marginTop: 40 }} />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 24 }}>
        {requests.map((r, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => handleUserClick(r.profiles.id)}>
              <img src={r.profiles.profile_pic || "https://placehold.co/52x52"} alt={r.profiles.full_name} style={{ width: 52, height: 52, borderRadius: "50%" }} />
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 400 }}>{r.profiles.full_name}</h3>
                <p style={{ fontSize: 12 }}>{r.profiles.job_title}</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16 }}>
              {/* ✅ Accept button */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#EB7437",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={(e) => handleAcceptRequest(r.id, e)}
              >
                ✔
              </div>

              {/* ❌ Reject button */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "#B31F19",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={(e) => handleRejectRequest(r.id, e)}
              >
                ✖
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR CTA */}
      <p style={{ textAlign: "center", marginTop: 40, fontSize: 18, lineHeight: "24px" }}>
        Connect with other attendees and see what you have in common.
      </p>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: 184,
            height: 184,
            background: "#ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: 12 }}>QR Code</span>
        </div>
      </div>
      <button
        style={{
          marginTop: 24,
          width: 304,
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
          padding: "8px 0",
          borderRadius: 20,
          background: "linear-gradient(128deg, #EC874E 0%, #BF341E 100%)",
          fontSize: 16,
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Open camera to scan
      </button>

      {/* Section: Connections */}
      <SectionTitle title="Your connections" style={{ marginTop: 40 }} />
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 24 }}>
        {connections.map((c, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => handleUserClick(c.id)}>
              <img src={c.img} alt={c.name} style={{ width: 52, height: 52, borderRadius: "50%" }} />
              <h3 style={{ fontSize: 18, fontWeight: 400 }}>{c.name}</h3>
            </div>
            <span style={{ fontSize: 13, color: "#474747" }}>{c.tags}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionTitle = ({ title, style = {}, showAll = false }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...style }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Proper link (chain) icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        stroke="#F9F9F9"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 6" />
        <path d="M14 11a5 5 0 0 1-7.07 0L5.5 9.57a5 5 0 0 1 7.07-7.07L10 6" />
      </svg>
      <h2 style={{ fontSize: 20, fontWeight: 500 }}>{title}</h2>
    </div>
    {showAll && (
      <span
        style={{
          fontSize: 12,
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Show all
      </span>
    )}
  </div>
);

export default ConnectionsPage;