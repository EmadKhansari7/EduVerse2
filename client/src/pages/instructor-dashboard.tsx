import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  BookOpen, 
  TrendingUp,
  Eye,
  Upload,
  Save,
  X
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatPrice } from "@/lib/i18n";
import { COURSE_LEVELS, COURSE_STATUSES } from "@/lib/constants";

import type { Course, Category, Lesson, Enrollment } from "@shared/schema";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  categoryId: z.string().min(1, "Category is required"),
  language: z.string().default("en"),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  tags: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
});

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  duration: z.number().optional(),
  orderIndex: z.number().min(0),
  isFree: z.boolean().default(false),
});

type CourseForm = z.infer<typeof courseSchema>;
type LessonForm = z.infer<typeof lessonSchema>;

interface CourseWithEnrollments extends Course {
  enrollments?: Enrollment[];
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson | null; courseId: string | null }>({ lesson: null, courseId: null });
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);

  // Check if user is instructor
  if (!user || user.role !== 'instructor') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              This area is only accessible to instructors.
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

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseWithEnrollments[]>({
    queryKey: ["/api/courses", "instructor", user.id],
    queryFn: async () => {
      const response = await fetch(`/api/courses?instructorId=${user.id}`);
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const courseForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      price: "0",
      originalPrice: "",
      level: "beginner",
      categoryId: "",
      language: "en",
      thumbnail: "",
      previewVideo: "",
      tags: [],
      requirements: [],
      whatYouWillLearn: [],
    },
  });

  const lessonForm = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      orderIndex: 0,
      isFree: false,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseForm) => apiRequest("POST", "/api/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateCourseOpen(false);
      courseForm.reset();
      toast({
        title: "Course created successfully!",
        description: "Your course has been created and is pending review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseForm> }) => 
      apiRequest("PUT", `/api/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditingCourse(null);
      toast({
        title: "Course updated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: LessonForm }) => 
      apiRequest("POST", `/api/courses/${courseId}/lessons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateLessonOpen(false);
      setEditingLesson({ lesson: null, courseId: null });
      lessonForm.reset();
      toast({
        title: "Lesson created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create lesson",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate stats
  const totalStudents = courses.reduce((sum, course) => sum + course.studentsCount, 0);
  const totalRevenue = courses.reduce((sum, course) => 
    sum + (course.studentsCount * parseFloat(course.price)), 0
  );
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const avgRating = courses.length > 0 
    ? courses.reduce((sum, course) => sum + parseFloat(course.rating), 0) / courses.length
    : 0;

  const onCreateCourse = (data: CourseForm) => {
    createCourseMutation.mutate(data);
  };

  const onUpdateCourse = (data: CourseForm) => {
    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data });
    }
  };

  const onCreateLesson = (data: LessonForm) => {
    if (editingLesson.courseId) {
      createLessonMutation.mutate({ courseId: editingLesson.courseId, data });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="instructor-dashboard-title">
            Instructor Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your courses and track your performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="courses" data-testid="tab-courses">My Courses</TabsTrigger>
            <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card data-testid="stat-total-courses">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {publishedCourses} published
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-students">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all courses
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-total-revenue">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(totalRevenue.toString())}</div>
                  <p className="text-xs text-muted-foreground">
                    All time earnings
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="stat-avg-rating">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Student feedback
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Courses */}
            <Card data-testid="recent-courses-section">
              <CardHeader>
                <CardTitle>Recent Courses</CardTitle>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <LoadingSpinner />
                ) : courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first course to start teaching
                    </p>
                    <Button onClick={() => setIsCreateCourseOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Course
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`course-item-${course.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=60&fit=crop"}
                            alt={course.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-medium">{course.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{course.studentsCount} students</span>
                              <span>{formatPrice(course.price)}</span>
                              <Badge variant={course.isPublished ? "default" : "secondary"}>
                                {course.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingCourse(course)}
                            data-testid={`edit-course-${course.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Link href={`/courses/${course.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <Button onClick={() => setIsCreateCourseOpen(true)} data-testid="create-course-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>

            {coursesLoading ? (
              <LoadingSpinner size="lg" text="Loading courses..." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden" data-testid={`course-card-${course.id}`}>
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setEditingCourse(course)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLesson({ lesson: null, courseId: course.id })}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Lesson
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this course?")) {
                              deleteCourseMutation.mutate(course.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <h2 className="text-2xl font-bold">Student Overview</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Student Analytics</h3>
                  <p className="text-muted-foreground">
                    Detailed student analytics will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <h2 className="text-2xl font-bold">Earnings Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {formatPrice(totalRevenue.toString())}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPrice("0")}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {formatPrice("0")}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Course Dialog */}
        <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <Form {...courseForm}>
              <form onSubmit={courseForm.handleSubmit(onCreateCourse)} className="space-y-4">
                <FormField
                  control={courseForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course title" {...field} data-testid="input-course-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief course description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={courseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detailed course description" 
                          rows={4} 
                          {...field} 
                          data-testid="textarea-course-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} data-testid="input-course-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={courseForm.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-course-level">
                              <SelectValue placeholder="Select level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COURSE_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={courseForm.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-course-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={courseForm.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateCourseOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createCourseMutation.isPending}
                    data-testid="submit-create-course"
                  >
                    {createCourseMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Course
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={!!editingCourse} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
            </DialogHeader>
            {editingCourse && (
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(onUpdateCourse)} className="space-y-4">
                  {/* Similar form fields as create course */}
                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setEditingCourse(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateCourseMutation.isPending}
                    >
                      {updateCourseMutation.isPending ? "Updating..." : "Update Course"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
