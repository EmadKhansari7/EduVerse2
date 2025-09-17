import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { useLanguage } from "@/contexts/language-context";
import { DEFAULT_AVATAR } from "@/lib/constants";

export function Navbar() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, direction } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-4" data-testid="link-home">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <span className="ml-2 text-xl font-bold text-foreground">EduPlatform</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <Input
                type="text"
                placeholder={t("nav.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2"
                data-testid="input-search"
              />
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-language">
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="button-lang-en">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("fa")} data-testid="button-lang-fa">
                  فارسی
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              data-testid="button-theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Navigation Links */}
            <Link href="/courses">
              <Button variant="ghost" className={isActive("/courses") ? "bg-muted" : ""} data-testid="link-courses">
                {t("nav.courses")}
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" className={isActive("/blog") ? "bg-muted" : ""} data-testid="link-blog">
                {t("nav.blog")}
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className={isActive("/about") ? "bg-muted" : ""} data-testid="link-about">
                {t("nav.about")}
              </Button>
            </Link>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || DEFAULT_AVATAR} alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" data-testid="link-dashboard">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "instructor" && (
                    <DropdownMenuItem asChild>
                      <Link href="/instructor" data-testid="link-instructor">
                        Instructor Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin">
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth">
                  <Button variant="ghost" data-testid="button-login">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button data-testid="button-signup">
                    {t("nav.signup")}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={direction === "rtl" ? "left" : "right"} className="w-80">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    type="text"
                    placeholder={t("nav.search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-mobile-search"
                  />
                </form>

                {/* Mobile Navigation Links */}
                <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-courses">
                    {t("nav.courses")}
                  </Button>
                </Link>
                <Link href="/blog" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-blog">
                    {t("nav.blog")}
                  </Button>
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-about">
                    {t("nav.about")}
                  </Button>
                </Link>

                {/* Mobile User Menu or Auth */}
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-dashboard">
                        Dashboard
                      </Button>
                    </Link>
                    {user.role === "instructor" && (
                      <Link href="/instructor" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-instructor">
                          Instructor Panel
                        </Button>
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start" data-testid="link-mobile-admin">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} data-testid="button-mobile-logout">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start" data-testid="button-mobile-login">
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full" data-testid="button-mobile-signup">
                        {t("nav.signup")}
                      </Button>
                    </Link>
                  </>
                )}

                {/* Mobile Settings */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Language</span>
                    <div className="flex space-x-1">
                      <Button
                        variant={language === "en" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setLanguage("en")}
                        data-testid="button-mobile-lang-en"
                      >
                        EN
                      </Button>
                      <Button
                        variant={language === "fa" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setLanguage("fa")}
                        data-testid="button-mobile-lang-fa"
                      >
                        فا
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      data-testid="button-mobile-theme"
                    >
                      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
