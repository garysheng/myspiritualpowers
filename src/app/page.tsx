import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gift, Book, Heart, Sparkles, Users, Star, Zap, Brain, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-6xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Star className="w-4 h-4" />
            <span>Over 10,000 people have discovered their spiritual gifts</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl mx-auto leading-tight">
            Discover Your Divine Purpose Through Your
            <span className="bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent"> Spiritual Gifts</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uncover your unique spiritual gifts and learn how to use them effectively in your daily life and ministry.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/quiz">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                Start Your Journey <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#learn-more">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">People Assessed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">27</div>
              <div className="text-sm text-muted-foreground">Spiritual Gifts</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">135</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-24 px-4 bg-background/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Why Take Our Spiritual Gifts Assessment?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive assessment helps you understand and develop your God-given abilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Book className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Biblical Foundation</h3>
                  <p className="text-muted-foreground mt-2">
                    Grounded in scripture and aligned with biblical teachings about spiritual gifts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
                  <p className="text-muted-foreground mt-2">
                    Advanced analysis provides personalized and nuanced understanding of your gifts.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Target className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Practical Application</h3>
                  <p className="text-muted-foreground mt-2">
                    Get specific ways to use your gifts in ministry and daily life.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Community Impact</h3>
                  <p className="text-muted-foreground mt-2">
                    Learn how your gifts can strengthen your church and community.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Spiritual Archetypes</h3>
                  <p className="text-muted-foreground mt-2">
                    Discover your unique spiritual power archetype and its biblical significance.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group">
              <CardContent className="pt-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-primary/5 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold">Growth Path</h3>
                  <p className="text-muted-foreground mt-2">
                    Get personalized recommendations for developing your spiritual gifts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-background/50 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        <div className="max-w-6xl mx-auto space-y-16 relative">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Heart className="w-4 h-4" />
              <span>Transforming Lives Through Spiritual Discovery</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
              What Others Are Saying
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands who have found clarity and purpose through our assessment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "This assessment revealed my true calling and showed me exactly how to serve effectively in my church community. It was like having a spiritual mentor guiding me to my purpose.",
                author: "Sarah M.",
                role: "Ministry Leader",
                gradient: "from-violet-500 via-primary to-indigo-500"
              },
              {
                quote: "The depth of spiritual insight was remarkable. Not only did it identify my gifts, but it showed me practical ways to use them in both ministry and daily life.",
                author: "David R.",
                role: "Church Elder",
                gradient: "from-blue-500 via-primary to-violet-500"
              },
              {
                quote: "Finally, a spiritual gifts assessment that speaks to both heart and mind! The biblical connections and practical applications were exactly what I needed.",
                author: "Rachel T.",
                role: "Youth Pastor",
                gradient: "from-indigo-500 via-primary to-blue-500"
              }
            ].map((testimonial, i) => (
              <Card key={i} className="relative overflow-hidden group h-full">
                <CardContent className="pt-6 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-r ${testimonial.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="relative flex flex-col h-full">
                    <div className="flex-1">
                      <div className={`text-6xl font-serif text-primary/10 absolute -top-4 -left-2`}>"</div>
                      <p className="text-lg relative z-10 pt-2 text-muted-foreground">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="pt-8 mt-8 border-t">
                      <div className="font-semibold bg-gradient-to-r from-violet-500 via-primary to-indigo-500 bg-clip-text text-transparent">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),rgba(0,0,0,0))]" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Begin Your Spiritual Journey Today</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold">Ready to Discover Your Spiritual Gifts?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of believers who have found clarity and purpose through our Spirit-led assessment.
          </p>
          <Link href="/quiz">
            <Button 
              size="lg" 
              variant="secondary" 
              className="gap-2 text-lg px-8 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-primary to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <span className="relative">Start Your Journey</span>
              <ArrowRight className="w-5 h-5 relative" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
