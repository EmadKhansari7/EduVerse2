import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import {
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Enrollment,
  type InsertEnrollment,
  type Review,
  type InsertReview,
  type Payment,
  type InsertPayment,
  type BlogPost,
  type InsertBlogPost,
  type Comment,
  type InsertComment,
  type Wishlist,
  type InsertWishlist,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: session.SessionStore;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;

  // Category methods
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;

  // Course methods
  getCourse(id: string): Promise<Course | undefined>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;
  getAllCourses(filters?: {
    categoryId?: string;
    instructorId?: string;
    level?: string;
    status?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Course[]>;
  getCoursesByInstructor(instructorId: string): Promise<Course[]>;

  // Lesson methods
  getLesson(id: string): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined>;
  deleteLesson(id: string): Promise<boolean>;
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;

  // Enrollment methods
  getEnrollment(id: string): Promise<Enrollment | undefined>;
  getEnrollmentByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | undefined>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment | undefined>;
  getEnrollmentsByUser(userId: string): Promise<Enrollment[]>;
  getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]>;

  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  deleteReview(id: string): Promise<boolean>;
  getReviewsByCourse(courseId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;

  // Payment methods
  getPayment(id: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getPaymentsByCourse(courseId: string): Promise<Payment[]>;

  // Blog methods
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;
  getAllBlogPosts(filters?: {
    authorId?: string;
    categoryId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<BlogPost[]>;

  // Comment methods
  getComment(id: string): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: string, updates: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<boolean>;
  getCommentsByBlogPost(blogPostId: string): Promise<Comment[]>;

  // Wishlist methods
  getWishlistItem(id: string): Promise<Wishlist | undefined>;
  getWishlistByUserAndCourse(userId: string, courseId: string): Promise<Wishlist | undefined>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, courseId: string): Promise<boolean>;
  getUserWishlist(userId: string): Promise<Wishlist[]>;
}

export class MemStorage implements IStorage {
  public sessionStore: session.SessionStore;
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private courses: Map<string, Course>;
  private lessons: Map<string, Lesson>;
  private enrollments: Map<string, Enrollment>;
  private reviews: Map<string, Review>;
  private payments: Map<string, Payment>;
  private blogPosts: Map<string, BlogPost>;
  private comments: Map<string, Comment>;
  private wishlistItems: Map<string, Wishlist>;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.users = new Map();
    this.categories = new Map();
    this.courses = new Map();
    this.lessons = new Map();
    this.enrollments = new Map();
    this.reviews = new Map();
    this.payments = new Map();
    this.blogPosts = new Map();
    this.comments = new Map();
    this.wishlistItems = new Map();

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const programmingCategory: Category = {
      id: randomUUID(),
      name: "Programming",
      nameEn: "Programming",
      nameFa: "برنامه‌نویسی",
      slug: "programming",
      description: "Learn programming languages and frameworks",
      icon: "code",
      color: "#3b82f6",
      isActive: true,
      createdAt: new Date(),
    };

    const businessCategory: Category = {
      id: randomUUID(),
      name: "Business",
      nameEn: "Business",
      nameFa: "کسب و کار",
      slug: "business",
      description: "Business and entrepreneurship courses",
      icon: "briefcase",
      color: "#10b981",
      isActive: true,
      createdAt: new Date(),
    };

    const designCategory: Category = {
      id: randomUUID(),
      name: "Design",
      nameEn: "Design",
      nameFa: "طراحی",
      slug: "design",
      description: "UI/UX and graphic design courses",
      icon: "palette",
      color: "#8b5cf6",
      isActive: true,
      createdAt: new Date(),
    };

    this.categories.set(programmingCategory.id, programmingCategory);
    this.categories.set(businessCategory.id, businessCategory);
    this.categories.set(designCategory.id, designCategory);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(limit = 50, offset = 0): Promise<User[]> {
    const users = Array.from(this.users.values());
    return users.slice(offset, offset + limit);
  }

  // Category methods
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  // Course methods
  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(course => course.slug === slug);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      ...insertCourse,
      id,
      studentsCount: 0,
      rating: "0",
      reviewsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: insertCourse.isPublished ? new Date() : null,
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, updates: Partial<Course>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { 
      ...course, 
      ...updates, 
      updatedAt: new Date(),
      publishedAt: updates.isPublished && !course.publishedAt ? new Date() : course.publishedAt
    };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  async getAllCourses(filters?: {
    categoryId?: string;
    instructorId?: string;
    level?: string;
    status?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<Course[]> {
    let courses = Array.from(this.courses.values());

    if (filters) {
      if (filters.categoryId) {
        courses = courses.filter(course => course.categoryId === filters.categoryId);
      }
      if (filters.instructorId) {
        courses = courses.filter(course => course.instructorId === filters.instructorId);
      }
      if (filters.level) {
        courses = courses.filter(course => course.level === filters.level);
      }
      if (filters.status) {
        courses = courses.filter(course => course.status === filters.status);
      }
      if (filters.isPublished !== undefined) {
        courses = courses.filter(course => course.isPublished === filters.isPublished);
      }
      if (filters.isFeatured !== undefined) {
        courses = courses.filter(course => course.isFeatured === filters.isFeatured);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        courses = courses.filter(course => 
          course.title.toLowerCase().includes(search) ||
          course.description.toLowerCase().includes(search)
        );
      }
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    return courses.slice(offset, offset + limit);
  }

  async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.instructorId === instructorId);
  }

  // Lesson methods
  async getLesson(id: string): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = randomUUID();
    const lesson: Lesson = {
      ...insertLesson,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.lessons.set(id, lesson);
    return lesson;
  }

  async updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    const updatedLesson = { ...lesson, ...updates, updatedAt: new Date() };
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.lessons.delete(id);
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.courseId === courseId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  // Enrollment methods
  async getEnrollment(id: string): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getEnrollmentByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | undefined> {
    return Array.from(this.enrollments.values()).find(
      enrollment => enrollment.userId === userId && enrollment.courseId === courseId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = randomUUID();
    const enrollment: Enrollment = {
      ...insertEnrollment,
      id,
      progress: 0,
      completedLessons: [],
      certificateIssued: false,
      enrolledAt: new Date(),
      completedAt: null,
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: string, updates: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = this.enrollments.get(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, ...updates };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  async getEnrollmentsByUser(userId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.userId === userId);
  }

  async getEnrollmentsByCourse(courseId: string): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(enrollment => enrollment.courseId === courseId);
  }

  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    return this.reviews.get(id);
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...updates, updatedAt: new Date() };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  async deleteReview(id: string): Promise<boolean> {
    return this.reviews.delete(id);
  }

  async getReviewsByCourse(courseId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.courseId === courseId && review.isPublished)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.userId === userId);
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.userId === userId);
  }

  async getPaymentsByCourse(courseId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(payment => payment.courseId === courseId);
  }

  // Blog methods
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(post => post.slug === slug);
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = randomUUID();
    const blogPost: BlogPost = {
      ...insertBlogPost,
      id,
      viewsCount: 0,
      publishedAt: insertBlogPost.isPublished ? new Date() : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }

  async updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const blogPost = this.blogPosts.get(id);
    if (!blogPost) return undefined;
    
    const updatedBlogPost = { 
      ...blogPost, 
      ...updates, 
      updatedAt: new Date(),
      publishedAt: updates.isPublished && !blogPost.publishedAt ? new Date() : blogPost.publishedAt
    };
    this.blogPosts.set(id, updatedBlogPost);
    return updatedBlogPost;
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    return this.blogPosts.delete(id);
  }

  async getAllBlogPosts(filters?: {
    authorId?: string;
    categoryId?: string;
    isPublished?: boolean;
    isFeatured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<BlogPost[]> {
    let posts = Array.from(this.blogPosts.values());

    if (filters) {
      if (filters.authorId) {
        posts = posts.filter(post => post.authorId === filters.authorId);
      }
      if (filters.categoryId) {
        posts = posts.filter(post => post.categoryId === filters.categoryId);
      }
      if (filters.isPublished !== undefined) {
        posts = posts.filter(post => post.isPublished === filters.isPublished);
      }
      if (filters.isFeatured !== undefined) {
        posts = posts.filter(post => post.isFeatured === filters.isFeatured);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        posts = posts.filter(post => 
          post.title.toLowerCase().includes(search) ||
          post.content.toLowerCase().includes(search)
        );
      }
    }

    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;
    return posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }

  // Comment methods
  async getComment(id: string): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    const updatedComment = { ...comment, ...updates, updatedAt: new Date() };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  async getCommentsByBlogPost(blogPostId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.blogPostId === blogPostId && comment.isPublished)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Wishlist methods
  async getWishlistItem(id: string): Promise<Wishlist | undefined> {
    return this.wishlistItems.get(id);
  }

  async getWishlistByUserAndCourse(userId: string, courseId: string): Promise<Wishlist | undefined> {
    return Array.from(this.wishlistItems.values()).find(
      item => item.userId === userId && item.courseId === courseId
    );
  }

  async addToWishlist(insertWishlist: InsertWishlist): Promise<Wishlist> {
    const id = randomUUID();
    const wishlistItem: Wishlist = {
      ...insertWishlist,
      id,
      createdAt: new Date(),
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(userId: string, courseId: string): Promise<boolean> {
    const item = await this.getWishlistByUserAndCourse(userId, courseId);
    if (!item) return false;
    return this.wishlistItems.delete(item.id);
  }

  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    return Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();
