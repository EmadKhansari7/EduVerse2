import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, Calendar, User, Eye, MessageSquare } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Pagination } from "@/components/ui/pagination";
import { useLanguage } from "@/contexts/language-context";
import { formatDate } from "@/lib/i18n";

import type { BlogPost, Category } from "@shared/schema";

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [location] = useLocation();
  const { language } = useLanguage();
  
  // Parse URL search params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(urlParams.get('category') || '');

  const { data: blogPosts = [], isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", searchQuery, selectedCategory, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: POSTS_PER_PAGE.toString(),
        offset: ((currentPage - 1) * POSTS_PER_PAGE).toString(),
        isPublished: 'true',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { categoryId: selectedCategory }),
      });
      
      const response = await fetch(`/api/blog/posts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "featured"],
    queryFn: async () => {
      const response = await fetch("/api/blog/posts?isFeatured=true&isPublished=true&limit=3");
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

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    
    // Update URL
    const newUrl = new URL(window.location.href);
    if (categoryId) {
      newUrl.searchParams.set('category', categoryId);
    } else {
      newUrl.searchParams.delete('category');
    }
    window.history.replaceState({}, '', newUrl.toString());
  };

  const totalPages = Math.ceil((blogPosts?.length || 0) / POSTS_PER_PAGE);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Blog</h2>
            <p className="text-muted-foreground">
              There was an error loading the blog posts. Please try again later.
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
      
      {/* Hero Section */}
      <section className="bg-muted/30 py-16" data-testid="blog-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Educational Blog
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover insights, tips, and trends in education and technology
            </p>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-blog-search"
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-12" data-testid="featured-posts-section">
            <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden card-hover group border border-border" data-testid={`featured-post-${post.id}`}>
                  <Link href={`/blog/${post.id}`}>
                    <img
                      src={post.thumbnail || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge className="bg-yellow-500">Featured</Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(post.createdAt, language)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
                        {language === "fa" && post.titleFa ? post.titleFa : post.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {post.excerpt || "Read this interesting article..."}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {post.viewsCount}
                          </span>
                        </div>
                        <Button variant="ghost" className="text-primary font-medium hover:text-primary/80 transition-colors p-0">
                          Read More →
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-80">
            <Card className="p-6 sticky top-24">
              <h3 className="font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleCategoryFilter('')}
                  data-testid="category-filter-all"
                >
                  All Articles
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handleCategoryFilter(category.id)}
                    data-testid={`category-filter-${category.slug}`}
                  >
                    {language === "fa" ? category.nameFa : category.nameEn}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {selectedCategory ? 'Category: ' + categories.find(c => c.id === selectedCategory)?.name : 'All Articles'}
              </h2>
              <p className="text-muted-foreground" data-testid="blog-posts-count">
                {isLoading ? 'Loading...' : `${blogPosts.length} articles found`}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading articles..." />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && blogPosts.length === 0 && (
              <Card className="p-12 text-center" data-testid="blog-empty-state">
                <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or check back later for new content
                </p>
                <Button onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}>
                  Clear filters
                </Button>
              </Card>
            )}

            {/* Blog Posts Grid */}
            {!isLoading && blogPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="blog-posts-list">
                {blogPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden card-hover group border border-border" data-testid={`blog-post-${post.id}`}>
                    <Link href={`/blog/${post.id}`}>
                      <img
                        src={post.thumbnail || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-3">
                          {post.isFeatured && <Badge>Featured</Badge>}
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.createdAt, language)}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2">
                          {language === "fa" && post.titleFa ? post.titleFa : post.title}
                        </h3>
                        
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.excerpt || "Read this interesting article..."}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {post.viewsCount}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">5 min read</span>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && blogPosts.length > 0 && totalPages > 1 && (
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
