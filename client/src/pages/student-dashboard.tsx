import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  BookOpen, 
  Clock, 
  Award, 
  User, 
  Heart,
  Play,
  CheckCircle,
  Trophy,
  TrendingUp
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { CourseCard } from "@/components/course/course-card";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice, formatDuration } from "@/lib/i18n";
import { DEFAULT_AVATAR } from "@/lib/constants";

import type { Course, Enrollment, Wishlist } from "@shared/schema";

interface EnrollmentWithCourse extends Enrollment {
  course: Course;
}

interface WishlistWithCourse extends Wishlist {
  course: Course;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery<EnrollmentWithCourse[]>({
    queryKey: ["/api/my-enrollments"],
    enabled: !!user,
  });

  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery<WishlistWithCourse[]>({
    queryKey: ["/api/my-wishlist"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Please log in to access your dashboard.
            </p>
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const completedCourses = enrollments.filter(e => e.status === 'completed');
  const activeCourses = enrollments.filter(e => e.status === 'active');
  const totalProgress = enrollments.length > 0 
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
    : 0;

  const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={userName} />
              <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="dashboard-welcome">
                Welcome back, {userName}!
              </h1>
              <p className="text-muted-foreground">Continue your learning journey</p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">My Courses</TabsTrigger>
            <TabsTrigger value="wishlist" data-testid="tab-wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stat-enrolled-courses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrollments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeCourses.length} active, {completedCourses.length} completed
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-avg-progress">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalProgress)}%</div>
                  <Progress value={totalProgress} className="mt-2" />
                </CardContent>
              </Card>

              <Card data-testid="stat-completed-courses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCourses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedCourses.filter(c => c.certificateIssued).length} certificates earned
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-wishlist">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{wishlist.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Courses saved for later
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Continue Learning */}
            {activeCourses.length > 0 && (
              <Card data-testid="continue-learning-section">
                <CardHeader>
                  <CardTitle>Continue Learning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeCourses.slice(0, 3).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`continue-course-${enrollment.courseId}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={enrollment.course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=80&fit=crop"}
                            alt={enrollment.course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{enrollment.course.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={enrollment.progress} className="w-32" />
                              <span className="text-sm text-muted-foreground">
                                {enrollment.progress}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/courses/${enrollment.courseId}`}>
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Continue
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {completedCourses.length > 0 && (
              <Card data-testid="achievements-section">
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedCourses.slice(0, 3).map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg"
                        data-testid={`achievement-${enrollment.courseId}`}
                      >
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Completed {enrollment.course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {enrollment.completedAt && new Date(enrollment.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        {enrollment.certificateIssued && (
                          <Badge className="ml-auto">Certificate Earned</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Link href="/courses">
                <Button variant="outline">Browse More Courses</Button>
              </Link>
            </div>

            {enrollmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading your courses..." />
              </div>
            ) : enrollments.length === 0 ? (
              <Card className="p-12 text-center" data-testid="no-courses-message">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your learning journey by enrolling in a course
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Active Courses */}
                {activeCourses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Active Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeCourses.map((enrollment) => (
                        <div key={enrollment.id} className="relative" data-testid={`active-course-${enrollment.courseId}`}>
                          <CourseCard course={enrollment.course} showInstructor={false} />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-blue-500">
                              {enrollment.progress}% Complete
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Courses */}
                {completedCourses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Completed Courses</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedCourses.map((enrollment) => (
                        <div key={enrollment.id} className="relative" data-testid={`completed-course-${enrollment.courseId}`}>
                          <CourseCard course={enrollment.course} showInstructor={false} />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Wishlist</h2>
              <Link href="/courses">
                <Button variant="outline">Browse More Courses</Button>
              </Link>
            </div>

            {wishlistLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading your wishlist..." />
              </div>
            ) : wishlist.length === 0 ? (
              <Card className="p-12 text-center" data-testid="empty-wishlist-message">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                <p className="text-muted-foreground mb-4">
                  Save courses you're interested in to your wishlist
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <CourseCard
                    key={item.id}
                    course={item.course}
                    isInWishlist={true}
                    data-testid={`wishlist-course-${item.courseId}`}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card data-testid="profile-section">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={userName} />
                    <AvatarFallback className="text-2xl">{userName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{userName}</h3>
                    <p className="text-muted-foreground">@{user.username}</p>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {user.email || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Member Since</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {user.firstName || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {user.lastName || 'Not provided'}
                    </div>
                  </div>
                </div>

                {user.bio && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <div className="p-3 bg-muted rounded-lg">
                      {user.bio}
                    </div>
                  </div>
                )}

                <Button>Edit Profile</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
