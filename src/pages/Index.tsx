import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users2, Network, Heart, BarChart, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mx-auto w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-8 shadow-glow">
            <Users2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Connect<span className="text-accent">Spark</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            AI-powered networking that creates meaningful professional connections at events
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="hero" size="lg" className="shadow-large">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="glass" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why ConnectSpark Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes personalities, interests, and goals to create meaningful connections that matter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Smart Matching</CardTitle>
                <CardDescription>
                  AI analyzes your profile to find the most compatible attendees based on interests, goals, and personality
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Meaningful Connections</CardTitle>
                <CardDescription>
                  Move beyond small talk with conversation starters and shared interests tailored to each match
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all">
              <CardHeader>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart className="w-6 h-6 text-success" />
                </div>
                <CardTitle>Event Insights</CardTitle>
                <CardDescription>
                  Get personalized recaps showing your connections, shared interests, and networking success
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple. Smart. Effective.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four easy steps to transform your event networking experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Create Profile",
                description: "Share your interests, goals, and what you're passionate about"
              },
              {
                step: "02", 
                title: "Join Event",
                description: "Scan QR code or enter event code to join any ConnectSpark event"
              },
              {
                step: "03",
                title: "Get Matches",
                description: "AI finds your best matches and suggests conversation topics"
              },
              {
                step: "04",
                title: "Connect & Grow",
                description: "Make meaningful connections and track your networking success"
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Network Smarter?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals making meaningful connections at events worldwide
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button variant="accent" size="lg" className="shadow-large">
                Start Connecting Today
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to get started</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>AI-powered matching</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Privacy focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Users2 className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">ConnectSpark</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ConnectSpark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
