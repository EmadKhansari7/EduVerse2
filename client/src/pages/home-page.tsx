import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  Award, 
  Heart, 
  MessageCircle, 
  Star,
  ArrowRight,
  BookOpen,
  Video,
  Palette,
  Briefcase,
  Code,
  BarChart3,
  Globe,
  User,
  FlaskConical
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { CourseCard } from "@/components/course/course-card";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/i18n";

import type { Course, Category, BlogPost } from "@shared/schema";

const categoryIcons = {
  programming: Code,
  business: Briefcase,
  design: Palette,
  marketing: BarChart3,
  "data-science": BarChart3,
  languages: Globe,
  "personal-development": User,
  science: FlaskConical,
};

export default function HomePage() {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredCourses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses?isFeatured=true&isPublished=true&limit=6");
      return response.json();
    },
  });

  const { data: popularCourses, isLoading: popularLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", "popular"],
    queryFn: async () => {
      const response = await fetch("/api/courses?isPublished=true&limit=3");
      return response.json();
    },
  });

  const { data: blogPosts, isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts?isPublished=true&limit=3");
      return response.json();
    },
  });

  if (categoriesLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-gradient text-white" data-testid="hero-section">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight" data-testid="hero-title">
                    {language === "fa" ? (
                      <>
                        مهارت‌های آینده شغلی خود را
                        <span className="text-accent-foreground"> بیاموزید</span>
                      </>
                    ) : (
                      <>
                        Learn Skills For Your
                        <span className="text-accent-foreground"> Future Career</span>
                      </>
                    )}
                  </h1>
                  <p className="text-xl text-blue-100 max-w-xl" data-testid="hero-subtitle">
                    {language === "fa" 
                      ? "به هزاران دانشجو بپیوندید که از مربیان کلاس جهانی یاد می‌گیرند. با کتابخانه جامع دوره‌های ما مهارت‌های مورد نیاز بازار کار را بسازید."
                      : "Join thousands of students learning from world-class instructors. Build in-demand skills with our comprehensive course library."
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/courses">
                    <Button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all transform hover:scale-105" data-testid="button-explore-courses">
                      {t("hero.explore")}
                    </Button>
                  </Link>
                  {!user && (
                    <Link href="/auth">
                      <Button variant="secondary" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all" data-testid="button-become-instructor">
                        {t("hero.instructor")}
                      </Button>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-8 pt-8" data-testid="hero-stats">
                  <div className="text-center">
                    <div className="text-3xl font-bold">25K+</div>
                    <div className="text-blue-200">{t("hero.students")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">1.5K+</div>
                    <div className="text-blue-200">دوره‌ها</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">200+</div>
                    <div className="text-blue-200">{t("hero.instructors")}</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                    alt="Students collaborating and learning together" 
                    className="rounded-2xl shadow-2xl w-full h-auto"
                    data-testid="hero-image"
                  />
                </div>
                
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-full opacity-80 blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-secondary rounded-full opacity-60 blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/50" data-testid="categories-section">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground" data-testid="categories-title">
                {t("categories.title")}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="categories-subtitle">
                {t("categories.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories?.map((category) => {
                const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || BookOpen;
                return (
                  <Link key={category.id} href={`/courses?category=${category.id}`}>
                    <Card className="group bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 card-hover cursor-pointer border border-border" data-testid={`category-card-${category.slug}`}>
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: category.color }} 
                        />
                      </div>
                      <h3 className="font-semibold text-lg text-card-foreground mb-2">
                        {language === "fa" ? category.nameFa : category.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">120+ courses</p>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="py-20 bg-background" data-testid="popular-courses-section">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-16">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-foreground">Popular Courses</h2>
                <p className="text-muted-foreground">Join thousands of students in our most popular courses</p>
              </div>
              <Link href="/courses">
                <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" data-testid="button-view-all-courses">
                  View All Courses
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="w-full h-48 bg-muted skeleton"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-4 bg-muted skeleton rounded"></div>
                      <div className="h-6 bg-muted skeleton rounded"></div>
                      <div className="h-16 bg-muted skeleton rounded"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                popularCourses?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30" data-testid="features-section">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-foreground">Why Choose EduPlatform?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We provide the best learning experience with world-class features and support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center space-y-4" data-testid="feature-videos">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">High-Quality Videos</h3>
                <p className="text-muted-foreground">
                  Learn from crystal-clear HD videos with perfect audio quality and professional production.
                </p>
              </div>

              <div className="text-center space-y-4" data-testid="feature-pace">
                <div className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Clock className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Learn at Your Pace</h3>
                <p className="text-muted-foreground">
                  Access courses anytime, anywhere. Learn at your own speed with lifetime access to course materials.
                </p>
              </div>

              <div className="text-center space-y-4" data-testid="feature-certificates">
                <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center mx-auto">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Certificate of Completion</h3>
                <p className="text-muted-foreground">
                  Get recognized for your achievements with official certificates upon course completion.
                </p>
              </div>

              <div className="text-center space-y-4" data-testid="feature-instructors">
                <div className="w-16 h-16 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Expert Instructors</h3>
                <p className="text-muted-foreground">
                  Learn from industry professionals and experts with years of real-world experience.
                </p>
              </div>

              <div className="text-center space-y-4" data-testid="feature-community">
                <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Community Support</h3>
                <p className="text-muted-foreground">
                  Join our active learning community. Get help from instructors and fellow students.
                </p>
              </div>

              <div className="text-center space-y-4" data-testid="feature-guarantee">
                <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">30-Day Money Back</h3>
                <p className="text-muted-foreground">
                  Not satisfied? Get your money back within 30 days, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-20 bg-muted/30" data-testid="blog-section">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-16">
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-foreground">Latest from Our Blog</h2>
                  <p className="text-muted-foreground">Stay updated with the latest trends and insights</p>
                </div>
                <Link href="/blog">
                  <Button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" data-testid="button-view-all-articles">
                    View All Articles
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="w-full h-48 bg-muted skeleton"></div>
                      <CardContent className="p-6 space-y-4">
                        <div className="h-4 bg-muted skeleton rounded"></div>
                        <div className="h-6 bg-muted skeleton rounded"></div>
                        <div className="h-16 bg-muted skeleton rounded"></div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  blogPosts?.map((post) => (
                    <Card key={post.id} className="overflow-hidden card-hover group border border-border" data-testid={`blog-card-${post.id}`}>
                      <Link href={`/blog/${post.id}`}>
                        <img
                          src={post.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4 mb-3">
                            <Badge variant="secondary">Technology</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(post.createdAt, language)}
                            </span>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
                            {language === "fa" && post.titleFa ? post.titleFa : post.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                            {post.excerpt || "Read more about this interesting topic..."}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <Button variant="ghost" className="text-primary font-medium hover:text-primary/80 transition-colors p-0">
                              Read More →
                            </Button>
                            <span className="text-sm text-muted-foreground">5 min read</span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground" data-testid="cta-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Learning Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join over 25,000 students who are already mastering new skills and advancing their careers with our expert-led courses.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/courses">
                <Button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold text-lg hover:bg-secondary/90 transition-all transform hover:scale-105" data-testid="button-browse-courses">
                  Browse Courses
                </Button>
              </Link>
              <Link href="/courses?price=free">
                <Button variant="secondary" className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all" data-testid="button-try-free">
                  Try Free Course
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-blue-200 flex-wrap gap-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                30-day money back guarantee
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Lifetime access to courses
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Certificate of completion
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
