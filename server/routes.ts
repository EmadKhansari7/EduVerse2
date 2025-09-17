import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertCourseSchema, insertLessonSchema, insertReviewSchema, insertBlogPostSchema, insertCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Courses routes
  app.get("/api/courses", async (req, res) => {
    try {
      const {
        categoryId,
        instructorId,
        level,
        status,
        isPublished,
        isFeatured,
        limit,
        offset,
        search
      } = req.query;

      const filters = {
        categoryId: categoryId as string,
        instructorId: instructorId as string,
        level: level as string,
        status: status as string,
        isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        search: search as string,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const courses = await storage.getAllCourses(filters);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Get course lessons
      const lessons = await storage.getLessonsByCourse(course.id);
      
      // Get course reviews
      const reviews = await storage.getReviewsByCourse(course.id);

      // Get instructor info
      const instructor = await storage.getUser(course.instructorId);

      res.json({
        ...course,
        lessons,
        reviews,
        instructor
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseData = insertCourseSchema.parse(req.body);
      
      // Ensure user is instructor or admin
      if (req.user!.role !== 'instructor' && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Only instructors can create courses" });
      }

      // Set instructor ID from authenticated user
      courseData.instructorId = req.user!.id;

      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this course" });
      }

      const updatedCourse = await storage.updateCourse(req.params.id, req.body);
      res.json(updatedCourse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this course" });
      }

      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Lessons routes
  app.get("/api/courses/:courseId/lessons", async (req, res) => {
    try {
      const lessons = await storage.getLessonsByCourse(req.params.courseId);
      res.json(lessons);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:courseId/lessons", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to add lessons to this course" });
      }

      const lessonData = insertLessonSchema.parse({
        ...req.body,
        courseId: req.params.courseId
      });

      const lesson = await storage.createLesson(lessonData);
      res.status(201).json(lesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/lessons/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this lesson" });
      }

      const updatedLesson = await storage.updateLesson(req.params.id, req.body);
      res.json(updatedLesson);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/lessons/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const lesson = await storage.getLesson(req.params.id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const course = await storage.getCourse(lesson.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user owns the course or is admin
      if (course.instructorId !== req.user!.id && req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to delete this lesson" });
      }

      await storage.deleteLesson(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enrollments routes
  app.get("/api/my-enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const enrollments = await storage.getEnrollmentsByUser(req.user!.id);
      
      // Get course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return { ...enrollment, course };
        })
      );

      res.json(enrollmentsWithCourses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:courseId/enroll", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollmentByUserAndCourse(
        req.user!.id,
        req.params.courseId
      );

      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment({
        userId: req.user!.id,
        courseId: req.params.courseId,
        status: "active",
      });

      res.status(201).json(enrollment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Reviews routes
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByCourse(req.params.courseId);
      
      // Get user details for each review
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return { ...review, user };
        })
      );

      res.json(reviewsWithUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:courseId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if user is enrolled in the course
      const enrollment = await storage.getEnrollmentByUserAndCourse(
        req.user!.id,
        req.params.courseId
      );

      if (!enrollment) {
        return res.status(400).json({ message: "Must be enrolled to review this course" });
      }

      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
        courseId: req.params.courseId
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/my-wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const wishlist = await storage.getUserWishlist(req.user!.id);
      
      // Get course details for each wishlist item
      const wishlistWithCourses = await Promise.all(
        wishlist.map(async (item) => {
          const course = await storage.getCourse(item.courseId);
          return { ...item, course };
        })
      );

      res.json(wishlistWithCourses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/courses/:courseId/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const course = await storage.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already in wishlist
      const existingItem = await storage.getWishlistByUserAndCourse(
        req.user!.id,
        req.params.courseId
      );

      if (existingItem) {
        return res.status(400).json({ message: "Course already in wishlist" });
      }

      const wishlistItem = await storage.addToWishlist({
        userId: req.user!.id,
        courseId: req.params.courseId
      });

      res.status(201).json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/courses/:courseId/wishlist", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const removed = await storage.removeFromWishlist(req.user!.id, req.params.courseId);
      if (!removed) {
        return res.status(404).json({ message: "Course not found in wishlist" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Blog routes
  app.get("/api/blog/posts", async (req, res) => {
    try {
      const {
        authorId,
        categoryId,
        isPublished,
        isFeatured,
        limit,
        offset,
        search
      } = req.query;

      const filters = {
        authorId: authorId as string,
        categoryId: categoryId as string,
        isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
        isFeatured: isFeatured === 'true' ? true : isFeatured === 'false' ? false : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        search: search as string,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key as keyof typeof filters] === undefined) {
          delete filters[key as keyof typeof filters];
        }
      });

      const posts = await storage.getAllBlogPosts(filters);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/blog/posts/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      // Get author info
      const author = await storage.getUser(post.authorId);
      
      // Get comments
      const comments = await storage.getCommentsByBlogPost(post.id);

      res.json({
        ...post,
        author,
        comments
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/blog/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      // Only admin can create blog posts
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can create blog posts" });
      }

      const postData = insertBlogPostSchema.parse({
        ...req.body,
        authorId: req.user!.id
      });

      const post = await storage.createBlogPost(postData);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Comments routes
  app.post("/api/blog/posts/:postId/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const post = await storage.getBlogPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      const commentData = insertCommentSchema.parse({
        ...req.body,
        userId: req.user!.id,
        blogPostId: req.params.postId
      });

      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const users = await storage.getAllUsers();
      const courses = await storage.getAllCourses();
      const enrollments = await storage.getEnrollmentsByUser(''); // Get all enrollments
      const payments = await storage.getPaymentsByUser(''); // Get all payments

      const stats = {
        totalUsers: users.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalRevenue: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0),
        usersByRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        coursesByStatus: courses.reduce((acc, course) => {
          acc[course.status] = (acc[course.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const { limit, offset } = req.query;
      const users = await storage.getAllUsers(
        limit ? parseInt(limit as string) : undefined,
        offset ? parseInt(offset as string) : undefined
      );
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
