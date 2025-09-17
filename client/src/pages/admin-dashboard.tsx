import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  BarChart3
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDate } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";
import { DEFAULT_AVATAR } from "@/lib/constants";

import type { Course, User, BlogPost } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  usersByRole: Record<string, number>;
  coursesByStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              This area is only accessible to administrators.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const response = await fetch("/api/courses");
      return response.json();
    },
  });

  const { data: blogPosts = [], isLoading: blogLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts");
      return response.json();
    },
  });

  const approveCourseM = useMutation({
    mutationFn: (courseId: string) => 
      apiRequest("PUT", `/api/courses/${courseId}`, { status: "published", isPublished: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Course approved successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to approve course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectCourseMutation = useMutation({
    mutationFn: (courseId: string) => 
      apiRequest("PUT", `/api/courses/${courseId}`, { status: "rejected", isPublished: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Course rejected successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to reject course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingCourses = courses.filter(course => course.status === 'pending');
  const publishedCourses = courses.filter(course => course.isPublished);
  const instructors = users.filter(user => user.role === 'instructor');
  const students = users.filter(user => user.role === 'student');

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="admin-dashboard-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your educational platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">Courses</TabsTrigger>
            <TabsTrigger value="approvals" data-testid="tab-approvals">Approvals</TabsTrigger>
            <TabsTrigger value="blog" data-testid="tab-blog">Blog</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stat-total-users">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {students.length} students, {instructors.length} instructors
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-courses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {publishedCourses.length} published, {pendingCourses.length} pending
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPrice((stats?.totalRevenue || 0).toString())}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalEnrollments || 0} enrollments
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-pending-approvals">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingCourses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Courses awaiting review
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="recent-users-section">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usersLoading ? (
                      <LoadingSpinner />
                    ) : (
                      users.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center gap-3" data-testid={`recent-user-${user.id}`}>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(user.createdAt, language)}
                            </p>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="recent-courses-section">
                <CardHeader>
                  <CardTitle>Recent Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {coursesLoading ? (
                      <LoadingSpinner />
                    ) : (
                      courses.slice(0, 5).map((course) => (
                        <div key={course.id} className="flex items-center gap-3" data-testid={`recent-course-${course.id}`}>
                          <img
                            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=60&h=40&fit=crop"}
                            alt={course.title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatPrice(course.price)}
                            </p>
                          </div>
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{students.length} Students</Badge>
                <Badge variant="outline">{instructors.length} Instructors</Badge>
              </div>
            </div>

            {usersLoading ? (
              <LoadingSpinner size="lg" text="Loading users..." />
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-4 font-medium">User</th>
                          <th className="p-4 font-medium">Email</th>
                          <th className="p-4 font-medium">Role</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Joined</th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userData) => (
                          <tr key={userData.id} className="border-b" data-testid={`user-row-${userData.id}`}>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={userData.avatar || DEFAULT_AVATAR} alt={userData.username} />
                                  <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{userData.username}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {userData.firstName} {userData.lastName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{userData.email}</td>
                            <td className="p-4">
                              <Badge variant="outline">{userData.role}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge variant={userData.isActive ? "default" : "destructive"}>
                                {userData.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">
                              {formatDate(userData.createdAt, language)}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant={userData.isActive ? "destructive" : "default"} 
                                  size="sm"
                                >
                                  {userData.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Management</h2>
              <div className="flex gap-2">
                <Badge variant="outline">{publishedCourses.length} Published</Badge>
                <Badge variant="outline">{pendingCourses.length} Pending</Badge>
              </div>
            </div>

            {coursesLoading ? (
              <LoadingSpinner size="lg" text="Loading courses..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden" data-testid={`admin-course-card-${course.id}`}>
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                    />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={course.isPublished ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{course.studentsCount} students</span>
                        <span>{formatPrice(course.price)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/courses/${course.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course Approvals</h2>
              <Badge variant="outline">{pendingCourses.length} Pending Review</Badge>
            </div>

            {pendingCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  No courses pending approval at the moment.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingCourses.map((course) => (
                  <Card key={course.id} data-testid={`pending-course-${course.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&h=80&fit=crop"}
                          alt={course.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {course.shortDescription || course.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Price: {formatPrice(course.price)}</span>
                                <span>Level: {course.level}</span>
                                <span>Submitted: {formatDate(course.createdAt, language)}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => rejectCourseMutation.mutate(course.id)}
                                disabled={rejectCourseMutation.isPending}
                                data-testid={`reject-course-${course.id}`}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => approveCourseM.mutate(course.id)}
                                disabled={approveCourseM.isPending}
                                data-testid={`approve-course-${course.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Management</h2>
              <Link href="/admin/blog/new">
                <Button>Create Post</Button>
              </Link>
            </div>

            {blogLoading ? (
              <LoadingSpinner size="lg" text="Loading blog posts..." />
            ) : blogPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start creating engaging content for your platform
                </p>
                <Button>Create First Post</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden" data-testid={`blog-post-${post.id}`}>
                    <img
                      src={post.thumbnail || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop"}
                      alt={post.title}
                      className="w-full h-32 object-cover"
                    />
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {post.isFeatured && <Badge>Featured</Badge>}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>{post.viewsCount} views</span>
                        <span>{formatDate(post.createdAt, language)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/blog/${post.id}`}>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
