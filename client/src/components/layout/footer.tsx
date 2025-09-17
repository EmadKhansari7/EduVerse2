import { Link } from "wouter";
import { useLanguage } from "@/contexts/language-context";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">E</span>
                </div>
                <span className="ml-2 text-xl font-bold text-foreground">EduPlatform</span>
              </div>
              <p className="text-muted-foreground mb-6">
                Empowering learners worldwide with high-quality, accessible education. Join our community and unlock your potential.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-linkedin">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" data-testid="link-instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.119.112.219.085.336-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-12.013C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/courses">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-courses">
                      All Courses
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/courses?category=programming">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-categories">
                      Categories
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/instructors">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-instructors">
                      Instructors
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/instructor">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-become-instructor">
                      Become Instructor
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-dashboard">
                      Student Dashboard
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Support</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/help">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-help">
                      Help Center
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-contact">
                      Contact Us
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/blog">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-blog">
                      Blog
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-faq">
                      FAQs
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/status">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-status">
                      System Status
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/terms">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-terms">
                      Terms of Service
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-privacy">
                      Privacy Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/cookies">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-cookies">
                      Cookie Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/refund">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-refund">
                      Refund Policy
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/accessibility">
                    <a className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-accessibility">
                      Accessibility
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-muted-foreground text-sm">
                © 2024 EduPlatform. All rights reserved.
              </p>
              <div className="flex items-center space-x-6 mt-4 md:mt-0">
                <span className="text-sm text-muted-foreground">Available in:</span>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="button-footer-lang-en">
                  English
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="button-footer-lang-fa">
                  فارسی
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
