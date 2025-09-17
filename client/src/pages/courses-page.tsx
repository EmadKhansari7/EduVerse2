import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Filter, Grid, List } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { CourseCard } from "@/components/course/course-card";
import { CourseFilters } from "@/components/course/course-filters";
import { Pagination } from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/language-context";

import type { Course } from "@shared/schema";

const COURSES_PER_PAGE = 12;

export default function CoursesPage() {
  const [location] = useLocation();
  const { t } = useLanguage();
  
  // Parse URL search params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: urlParams.get('category') || '',
    level: urlParams.get('level') || '',
    price: urlParams.get('price') || '',
    instructor: urlParams.get('instructor') || '',
    sort: urlParams.get('sort') || 'newest',
  });

  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ["/api/courses", filters, searchQuery, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: COURSES_PER_PAGE.toString(),
        offset: ((currentPage - 1) * COURSES_PER_PAGE).toString(),
        isPublished: 'true',
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && { categoryId: filters.category }),
        ...(filters.level && { level: filters.level }),
        ...(filters.instructor && { instructorId: filters.instructor }),
      });
      
      const response = await fetch(`/api/courses?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // Update URL without navigation
    const newUrl = new URL(window.location.href);
    if (searchQuery) {
      newUrl.searchParams.set('search', searchQuery);
    } else {
      newUrl.searchParams.delete('search');
    }
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL
    const newUrl = new URL(window.location.href);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newUrl.searchParams.set(key, value);
      } else {
        newUrl.searchParams.delete(key);
      }
    });
    window.history.replaceState({}, '', newUrl.toString());
  };

  const totalPages = Math.ceil((courses?.length || 0) / COURSES_PER_PAGE);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Courses</h2>
            <p className="text-muted-foreground">
              There was an error loading the courses. Please try again later.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="courses-title">
            Explore Courses
          </h1>
          <p className="text-muted-foreground">
            Discover and learn from our comprehensive collection of courses
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-course-search"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-view-grid"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                data-testid="button-view-list"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80`}>
            <Card className="p-6 sticky top-24">
              <CourseFilters
                filters={filters}
                onFiltersChange={handleFilterChange}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground" data-testid="courses-count">
                {isLoading ? 'Loading...' : `${courses.length} courses found`}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading courses..." />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && courses.length === 0 && (
              <Card className="p-12 text-center" data-testid="courses-empty-state">
                <h3 className="text-xl font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setFilters({
                    category: '',
                    level: '',
                    price: '',
                    instructor: '',
                    sort: 'newest',
                  });
                  setCurrentPage(1);
                }}>
                  Clear all filters
                </Button>
              </Card>
            )}

            {/* Courses Grid/List */}
            {!isLoading && courses.length > 0 && (
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'space-y-6'
              }`} data-testid="courses-list">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    showInstructor={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && courses.length > 0 && totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
