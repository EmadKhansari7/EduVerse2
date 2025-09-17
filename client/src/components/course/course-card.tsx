import { Link } from "wouter";
import { Star, Clock, Users, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice, formatDuration } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { DEFAULT_COURSE_THUMBNAIL, DEFAULT_AVATAR } from "@/lib/constants";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    thumbnail?: string;
    price: string;
    originalPrice?: string;
    level: string;
    duration?: number;
    studentsCount: number;
    rating: string;
    reviewsCount: number;
    instructor?: {
      id: string;
      firstName?: string;
      lastName?: string;
      username: string;
      avatar?: string;
    };
    category?: {
      name: string;
      color?: string;
    };
  };
  isInWishlist?: boolean;
  showInstructor?: boolean;
}

export function CourseCard({ course, isInWishlist = false, showInstructor = true }: CourseCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const wishlistMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      if (action === 'add') {
        return await apiRequest("POST", `/api/courses/${course.id}/wishlist`);
      } else {
        return await apiRequest("DELETE", `/api/courses/${course.id}/wishlist`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-wishlist"] });
      toast({
        title: isInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: isInWishlist 
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

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add courses to wishlist",
        variant: "destructive",
      });
      return;
    }

    wishlistMutation.mutate(isInWishlist ? 'remove' : 'add');
  };

  const instructorName = course.instructor 
    ? `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() || course.instructor.username
    : '';

  const discountPercentage = course.originalPrice 
    ? Math.round((1 - parseFloat(course.price) / parseFloat(course.originalPrice)) * 100)
    : 0;

  return (
    <Card className="overflow-hidden card-hover group border border-border" data-testid={`course-card-${course.id}`}>
      <Link href={`/courses/${course.id}`}>
        <div className="relative">
          <img
            src={course.thumbnail || DEFAULT_COURSE_THUMBNAIL}
            alt={course.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`course-image-${course.id}`}
          />
          
          {/* Wishlist Button */}
          {user && (
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white"
              onClick={handleWishlistToggle}
              disabled={wishlistMutation.isPending}
              data-testid={`button-wishlist-${course.id}`}
            >
              <Heart 
                className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
              />
            </Button>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>
        
        <CardContent className="p-6">
          {/* Category */}
          {course.category && (
            <Badge 
              variant="secondary" 
              className="mb-3"
              style={{ backgroundColor: `${course.category.color}10`, color: course.category.color }}
              data-testid={`course-category-${course.id}`}
            >
              {course.category.name}
            </Badge>
          )}

          {/* Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-yellow-500" data-testid={`course-rating-${course.id}`}>
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 text-sm font-medium text-foreground">
                {parseFloat(course.rating).toFixed(1)} ({course.reviewsCount})
              </span>
            </div>
            <Badge variant="outline" className="text-xs" data-testid={`course-level-${course.id}`}>
              {course.level}
            </Badge>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2" data-testid={`course-title-${course.id}`}>
            {course.title}
          </h3>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid={`course-description-${course.id}`}>
            {course.shortDescription || course.description}
          </p>
          
          {/* Instructor */}
          {showInstructor && course.instructor && (
            <div className="flex items-center mb-4" data-testid={`course-instructor-${course.id}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={course.instructor.avatar || DEFAULT_AVATAR} alt={instructorName} />
                <AvatarFallback>{instructorName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-card-foreground">{instructorName}</p>
              </div>
            </div>
          )}
          
          {/* Course Stats */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            {course.duration && (
              <div className="flex items-center" data-testid={`course-duration-${course.id}`}>
                <Clock className="w-4 h-4 mr-1" />
                {formatDuration(course.duration)}
              </div>
            )}
            <div className="flex items-center" data-testid={`course-students-${course.id}`}>
              <Users className="w-4 h-4 mr-1" />
              {course.studentsCount} students
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1" data-testid={`course-price-${course.id}`}>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(course.price)}
              </span>
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through ml-2">
                  {formatPrice(course.originalPrice)}
                </span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {course.studentsCount > 0 && (
                <span>{course.studentsCount} enrolled</span>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
