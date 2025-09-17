import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  User, 
  Eye, 
  MessageSquare, 
  ArrowLeft,
  Share2,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/i18n";
import { useLanguage } from "@/contexts/language-context";
import { DEFAULT_AVATAR } from "@/lib/constants";

import type { BlogPost, Comment, User as UserType } from "@shared/schema";

interface BlogPostWithDetails extends BlogPost {
  author: UserType;
  comments: (Comment & { user: UserType })[];
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState("");

  const { data: post, isLoading, error } = useQuery<BlogPostWithDetails>({
    queryKey: ["/api/blog/posts", id],
    enabled: !!id,
  });

  const { data: relatedPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts", "related", post?.categoryId],
    queryFn: async () => {
      if (!post?.categoryId) return [];
      const response = await fetch(`/api/blog/posts?categoryId=${post.categoryId}&isPublished=true&limit=3`);
      return response.json();
    },
    enabled: !!post?.categoryId,
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", `/api/blog/posts/${id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/posts", id] });
      setNewComment("");
      toast({
        title: "Comment posted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to post a comment",
        variant: "destructive",
      });
      return;
    }
    
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = post ? (language === "fa" && post.titleFa ? post.titleFa : post.title) : '';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" text="Loading article..." />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/blog">
              <Button>Back to Blog</Button>
            </Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const authorName = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || post.author.username;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/blog">
            <Button variant="ghost" className="mb-4" data-testid="back-to-blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <article className="space-y-6" data-testid="blog-article">
              {/* Header */}
              <div className="space-y-4">
                {post.isFeatured && <Badge className="bg-yellow-500">Featured</Badge>}
                
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight" data-testid="blog-title">
                  {language === "fa" && post.titleFa ? post.titleFa : post.title}
                </h1>
                
                {post.excerpt && (
                  <p className="text-xl text-muted-foreground" data-testid="blog-excerpt">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.createdAt, language)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewsCount} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments?.length || 0} comments</span>
                  </div>
                  <span>5 min read</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg" data-testid="blog-author">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author.avatar || DEFAULT_AVATAR} alt={authorName} />
                    <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">By {authorName}</p>
                    {post.author.bio && (
                      <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {post.thumbnail && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={post.thumbnail}
                    alt={shareTitle}
                    className="w-full h-full object-cover"
                    data-testid="blog-featured-image"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none blog-content" data-testid="blog-content">
                {/* In a real app, this would be rendered from markdown or rich text */}
                <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br>') }} />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6" data-testid="blog-tags">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              {/* Share */}
              <div className="flex items-center justify-between py-6" data-testid="blog-share">
                <div>
                  <h3 className="font-semibold mb-2">Share this article</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')}
                      data-testid="share-twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
                      data-testid="share-facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')}
                      data-testid="share-linkedin"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        toast({ title: "Link copied to clipboard!" });
                      }}
                      data-testid="share-copy"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-6" data-testid="comments-section">
                <h3 className="text-2xl font-bold">
                  Comments ({post.comments?.length || 0})
                </h3>

                {/* Add Comment Form */}
                {user ? (
                  <Card>
                    <CardContent className="p-6">
                      <form onSubmit={handleCommentSubmit} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.username} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              rows={3}
                              data-testid="comment-input"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={commentMutation.isPending || !newComment.trim()}
                            data-testid="submit-comment"
                          >
                            {commentMutation.isPending ? "Posting..." : "Post Comment"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Please login to post a comment
                      </p>
                      <Link href="/auth">
                        <Button>Login</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comments && post.comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    post.comments?.map((comment) => (
                      <Card key={comment.id} data-testid={`comment-${comment.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={comment.user.avatar || DEFAULT_AVATAR} alt={comment.user.username} />
                              <AvatarFallback>{comment.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{comment.user.username}</span>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(comment.createdAt, language)}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Card data-testid="related-posts">
                  <CardHeader>
                    <CardTitle>Related Articles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {relatedPosts.filter(p => p.id !== post.id).slice(0, 3).map((relatedPost) => (
                      <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                        <div className="group cursor-pointer" data-testid={`related-post-${relatedPost.id}`}>
                          <div className="flex gap-3">
                            <img
                              src={relatedPost.thumbnail || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=80&h=60&fit=crop"}
                              alt={relatedPost.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                                {language === "fa" && relatedPost.titleFa ? relatedPost.titleFa : relatedPost.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(relatedPost.createdAt, language)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Newsletter Signup */}
              <Card data-testid="newsletter-signup">
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest articles and educational content delivered to your inbox
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full px-3 py-2 border border-input rounded-md text-sm"
                    />
                    <Button className="w-full" size="sm">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
