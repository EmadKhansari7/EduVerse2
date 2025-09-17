import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Play, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  BookOpen, 
  Award, 
  Check,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  MessageSquare
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { VideoPlayer } from "@/components/course/video-player";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDuration, formatDate } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";
import { DEFAULT_COURSE_THUMBNAIL, DEFAULT_AVATAR } from "@/lib/constants";

import type { Course, Lesson, Review, User } from "@shared/schema";

interface CourseWithDetails extends Course {
  lessons: Lesson[];
  reviews: (Review & { user: User })[];
  instructor: User;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [expandedLessons, setExpandedLessons] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const { data: course, isLoading, error } = useQuery<CourseWithDetails>({
    queryKey: ["/api/courses", id],
    enabled: !!id,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/my-enrollments", id],
    queryFn: async () => {
      if (!user || !id) return null;
      const response = await fetch("/api/my-enrollments");
      const enrollments = await response.json();
      return enrollments.find((e: any) => e.courseId === id);
    },
    enabled: !!user && !!id,
  });

  const { data: wishlistItem } = useQuery({
    queryKey: ["/api/my-wishlist", id],
    queryFn: async () => {
      if (!user || !id) return null;
      const response = await fetch("/api/my-wishlist");
      const wishlist = await response.json();
      return wishlist.find((w: any) => w.courseId === id);
    },
    enabled: !!user && !!id,
  });

  const enrollMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/courses/${id}/enroll`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
      toast({
        title: "Enrolled successfully!",
        description: "You can now access all course materials.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Enrollment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const wishlistMutation = useMutation({
    mutationFn: (action: 'add' | 'remove') => {
      return apiRequest(
        action === 'add' ? "POST" : "DELETE", 
        `/api/courses/${id}/wishlist`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-wishlist"] });
      toast({
        title: wishlistItem ? "Removed from wishlist" : "Added to wishlist",
        description: wishlistItem 
          ? "Course removed from your wishlist" 
          : "Course added to your wishlist",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { rating: number; comment: string }) => 
      apiRequest("POST", `/api/courses/${id}/reviews`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", id] });
      setNewReview({ rating: 5, comment: '' });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading course..." />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/courses">
              <Button>Browse All Courses</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isInWishlist = !!wishlistItem;
  const canReview = isEnrolled && !course.reviews.some(r => r.userId === user?.id);
  const instructorName = `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.username;

  const freeLessons = course.lessons.filter(lesson => lesson.isFree);
  const hasPreviewVideo = course.previewVideo || freeLessons.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="space-y-4" data-testid="course-header">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" style={{ backgroundColor: `${course.category?.color}20`, color: course.category?.color }}>
                  {course.category?.name}
                </Badge>
                <Badge variant="outline">{course.level}</Badge>
                {course.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
              </div>
              
              <h1 className="text-4xl font-bold text-foreground" data-testid="course-title">
                {course.title}
              </h1>
              
              <p className="text-xl text-muted-foreground" data-testid="course-description">
                {course.shortDescription || course.description}
              </p>

              {/* Course Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{parseFloat(course.rating).toFixed(1)}</span>
                  <span>({course.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.studentsCount} students</span>
                </div>
                {course.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessonsCount} lessons</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg" data-testid="course-instructor">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={course.instructor.avatar || DEFAULT_AVATAR} alt={instructorName} />
                  <AvatarFallback>{instructorName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">Instructor: {instructorName}</p>
                  {course.instructor.bio && (
                    <p className="text-sm text-muted-foreground">{course.instructor.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Video or Course Thumbnail */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Course Preview</h2>
              {hasPreviewVideo ? (
                <VideoPlayer
                  videoUrl={course.previewVideo || freeLessons[0]?.videoUrl}
                  title="Course Preview"
                  className="aspect-video"
                />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <img
                    src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* What You'll Learn */}
            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
              <Card data-testid="course-learning-outcomes">
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.whatYouWillLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <Card data-testid="course-content">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Content</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {course.lessonsCount} lessons
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={expandedLessons} onOpenChange={setExpandedLessons}>
                  <div className="space-y-2">
                    {course.lessons.slice(0, expandedLessons ? undefined : 5).map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`lesson-item-${lesson.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{lesson.title}</p>
                            {lesson.description && (
                              <p className="text-sm text-muted-foreground">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {lesson.isFree && <Badge variant="outline" className="text-xs">Free</Badge>}
                          {lesson.duration && (
                            <span>{Math.floor(lesson.duration / 60)}:{(lesson.duration % 60).toString().padStart(2, '0')}</span>
                          )}
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {course.lessons.length > 5 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full mt-4">
                        {expandedLessons ? (
                          <>Show Less <ChevronUp className="w-4 h-4 ml-2" /></>
                        ) : (
                          <>Show All {course.lessons.length} Lessons <ChevronDown className="w-4 h-4 ml-2" /></>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>
              </CardContent>
            </Card>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <Card data-testid="course-requirements">
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2"></div>
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card data-testid="course-full-description">
              <CardHeader>
                <CardTitle>About this course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p>{course.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card data-testid="course-reviews">
              <CardHeader>
                <CardTitle>Reviews ({course.reviewsCount})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Review Form */}
                {canReview && (
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Write a review</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="p-1"
                              data-testid={`rating-star-${star}`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= newReview.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Comment</label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Share your thoughts about this course..."
                          data-testid="review-comment-input"
                        />
                      </div>
                      <Button
                        onClick={() => reviewMutation.mutate(newReview)}
                        disabled={reviewMutation.isPending || !newReview.comment.trim()}
                        data-testid="submit-review-button"
                      >
                        {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {course.reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet. Be the first to review this course!
                    </p>
                  ) : (
                    course.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0" data-testid={`review-${review.id}`}>
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.user.avatar || DEFAULT_AVATAR} alt={review.user.username} />
                            <AvatarFallback>{review.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user.username}</span>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(review.createdAt, language)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24" data-testid="course-purchase-card">
              <CardContent className="p-6">
                {/* Course Image */}
                <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                  <img
                    src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-primary" data-testid="course-price">
                      {formatPrice(course.price)}
                    </span>
                    {course.originalPrice && (
                      <span className="text-lg text-muted-foreground line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  {course.originalPrice && (
                    <Badge className="bg-red-500">
                      {Math.round((1 - parseFloat(course.price) / parseFloat(course.originalPrice)) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  {isEnrolled ? (
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <Button className="w-full" size="lg" data-testid="continue-learning-button">
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : user ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => enrollMutation.mutate()}
                      disabled={enrollMutation.isPending}
                      data-testid="enroll-button"
                    >
                      {enrollMutation.isPending ? (
                        'Enrolling...'
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  ) : (
                    <Link href="/auth">
                      <Button className="w-full" size="lg" data-testid="login-to-enroll-button">
                        Login to Enroll
                      </Button>
                    </Link>
                  )}

                  {user && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => wishlistMutation.mutate(isInWishlist ? 'remove' : 'add')}
                      disabled={wishlistMutation.isPending}
                      data-testid="wishlist-button"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                      {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </Button>
                  )}
                </div>

                {/* Course Includes */}
                <div className="space-y-3 text-sm">
                  <h4 className="font-medium">This course includes:</h4>
                  <div className="space-y-2">
                    {course.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDuration(course.duration)} on-demand video</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span>{course.lessonsCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
