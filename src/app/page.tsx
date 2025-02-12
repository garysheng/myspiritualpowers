import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gift, Book, Heart, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center space-y-6 bg-gradient-to-b from-background to-secondary/20">
        <h1 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
          Discover Your Divine Purpose Through Your
          <span className="text-primary"> Spiritual Gifts</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Uncover the unique ways God has equipped you to serve and make a difference in your community through our comprehensive spiritual gifts assessment.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/quiz">
            <Button size="lg" className="gap-2">
              Start Your Journey <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#learn-more">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto space-y-12">
          <h2 className="text-3xl font-bold text-center mb-12">Why Take Our Spiritual Gifts Quiz?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <Gift className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Biblical Foundation</h3>
                <p className="text-muted-foreground">
                  Based on scripture and grounded in biblical teaching about spiritual gifts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <Sparkles className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">AI-Powered Insights</h3>
                <p className="text-muted-foreground">
                  Advanced analysis provides personalized and nuanced understanding of your gifts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <Book className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Practical Application</h3>
                <p className="text-muted-foreground">
                  Get specific ways to use your gifts in ministry and daily life
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <Heart className="w-12 h-12 mx-auto text-primary" />
                <h3 className="text-xl font-semibold">Community Impact</h3>
                <p className="text-muted-foreground">
                  Learn how your gifts can strengthen your church and community
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Discover Your Spiritual Gifts?</h2>
          <p className="text-xl opacity-90">
            Join thousands of believers who have found clarity and purpose through our assessment
          </p>
          <Link href="/quiz">
            <Button size="lg" variant="secondary" className="gap-2">
              Take the Quiz Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
