import { Link } from "wouter";
import { 
  Users, 
  Target, 
  Award, 
  BookOpen,
  Globe,
  Heart,
  Star,
  CheckCircle,
  ArrowRight
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";

export default function AboutPage() {
  const { language } = useLanguage();

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Passionate educator with 15+ years in online learning",
      image: "https://images.unsplash.com/photo-1494790108755-2616b6c8b9bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
    },
    {
      name: "Dr. Ahmad Hosseini",
      role: "Head of Education",
      bio: "Former university professor, expert in curriculum development",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
    },
    {
      name: "Emma Davis",
      role: "Lead UX Designer",
      bio: "Creating intuitive learning experiences for global audiences",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
    },
    {
      name: "David Chen",
      role: "CTO",
      bio: "Technology leader building scalable educational platforms",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=400",
    },
  ];

  const values = [
    {
      icon: BookOpen,
      title: "Quality Education",
      description: "We believe everyone deserves access to high-quality, engaging educational content",
    },
    {
      icon: Globe,
      title: "Global Accessibility",
      description: "Breaking down barriers with multilingual support and inclusive design",
    },
    {
      icon: Heart,
      title: "Student Success",
      description: "Every decision we make is centered around helping our students achieve their goals",
    },
    {
      icon: Target,
      title: "Innovation",
      description: "Continuously evolving our platform with the latest educational technologies",
    },
  ];

  const achievements = [
    { number: "25,000+", label: "Active Students" },
    { number: "1,500+", label: "Courses Available" },
    { number: "200+", label: "Expert Instructors" },
    { number: "98%", label: "Student Satisfaction" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20" data-testid="about-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Empowering Learners Worldwide
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              We're on a mission to make quality education accessible to everyone, everywhere. 
              Join our global community of learners and transform your future today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-background" data-testid="our-story">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2020, EduPlatform began with a simple yet powerful vision: to democratize 
                    access to quality education worldwide. What started as a small team of passionate 
                    educators and technologists has grown into a thriving platform serving thousands 
                    of learners globally.
                  </p>
                  <p>
                    We recognized that traditional education often leaves gaps - whether due to 
                    geographical limitations, language barriers, or simply the pace of technological 
                    change. Our platform bridges these gaps by offering flexible, engaging, and 
                    culturally-aware learning experiences.
                  </p>
                  <p>
                    Today, we're proud to support learners from over 50 countries, offering courses 
                    in multiple languages and covering everything from technical skills to creative 
                    pursuits. But our journey is just beginning.
                  </p>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Team collaboration in modern office"
                  className="rounded-2xl shadow-lg w-full"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold">4+</div>
                  <div className="text-sm">Years of Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-muted/30" data-testid="mission-vision">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Mission & Vision
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Driving our purpose and shaping our future
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-8 border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground">
                    To provide accessible, high-quality education that empowers individuals to 
                    achieve their personal and professional goals, regardless of their background, 
                    location, or circumstances. We believe that learning should be a lifelong 
                    journey accessible to all.
                  </p>
                </CardContent>
              </Card>

              <Card className="p-8 border-l-4 border-l-secondary">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                  </div>
                  <p className="text-muted-foreground">
                    To become the world's leading multilingual learning platform, creating a 
                    global community where knowledge knows no boundaries. We envision a future 
                    where every person has the opportunity to learn, grow, and thrive in their 
                    chosen field.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-background" data-testid="our-values">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6 card-hover" data-testid={`value-${index}`}>
                  <CardContent className="p-0">
                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-muted/30" data-testid="achievements">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Our Impact
              </h2>
              <p className="text-xl text-muted-foreground">
                Numbers that reflect our commitment to education
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center" data-testid={`achievement-${index}`}>
                  <div className="text-4xl lg:text-5xl font-bold text-primary mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background" data-testid="team">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                The passionate individuals behind EduPlatform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="overflow-hidden card-hover" data-testid={`team-member-${index}`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-primary font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-muted/30" data-testid="differentiators">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                What Makes Us Different
              </h2>
              <p className="text-xl text-muted-foreground">
                Why learners choose EduPlatform
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Bilingual Support
                    </h3>
                    <p className="text-muted-foreground">
                      Full Persian and English language support with culturally aware content 
                      and right-to-left text support.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Expert Instructors
                    </h3>
                    <p className="text-muted-foreground">
                      Learn from industry professionals and academics with proven track records 
                      in their respective fields.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Interactive Learning
                    </h3>
                    <p className="text-muted-foreground">
                      Engaging multimedia content, quizzes, and hands-on projects that make 
                      learning effective and enjoyable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Flexible Learning
                    </h3>
                    <p className="text-muted-foreground">
                      Self-paced courses that fit your schedule, with lifetime access and 
                      mobile-friendly design.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Community Support
                    </h3>
                    <p className="text-muted-foreground">
                      Active community forums, peer-to-peer learning, and direct access to 
                      instructors for questions and guidance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">
                      Recognized Certificates
                    </h3>
                    <p className="text-muted-foreground">
                      Industry-recognized completion certificates that add value to your 
                      professional profile and career advancement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="cta">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Join Our Learning Community?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start your learning journey today with thousands of courses from expert instructors. 
              Your future self will thank you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all transform hover:scale-105">
                  Get Started Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button variant="secondary" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all">
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
