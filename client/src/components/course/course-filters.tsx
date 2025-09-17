import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/i18n";
import { COURSE_LEVELS } from "@/lib/constants";
import { useLanguage } from "@/contexts/language-context";

import type { Category, User } from "@shared/schema";

interface CourseFiltersProps {
  filters: {
    category: string;
    level: string;
    price: string;
    instructor: string;
    sort: string;
  };
  onFiltersChange: (filters: {
    category: string;
    level: string;
    price: string;
    instructor: string;
    sort: string;
  }) => void;
}

export function CourseFilters({ filters, onFiltersChange }: CourseFiltersProps) {
  const { language } = useLanguage();
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    level: true,
    price: true,
    instructor: false,
    sort: true,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: instructors = [] } = useQuery<User[]>({
    queryKey: ["/api/instructors"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users");
      const users = await response.json();
      return users.filter((user: User) => user.role === 'instructor');
    },
  });

  useEffect(() => {
    if (filters.price === 'free') {
      setPriceRange([0, 0]);
    } else if (filters.price === 'paid') {
      setPriceRange([1, 500]);
    }
  }, [filters.price]);

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      category: checked ? categoryId : '',
    });
  };

  const handleLevelChange = (level: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      level: checked ? level : '',
    });
  };

  const handlePriceTypeChange = (priceType: string) => {
    onFiltersChange({
      ...filters,
      price: priceType,
    });
  };

  const handleInstructorChange = (instructorId: string) => {
    onFiltersChange({
      ...filters,
      instructor: instructorId === filters.instructor ? '' : instructorId,
    });
  };

  const handleSortChange = (sortValue: string) => {
    onFiltersChange({
      ...filters,
      sort: sortValue,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      category: '',
      level: '',
      price: '',
      instructor: '',
      sort: 'newest',
    });
    setPriceRange([0, 500]);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const activeFiltersCount = Object.values(filters).filter(value => value && value !== 'newest').length;

  return (
    <div className="space-y-6" data-testid="course-filters">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" data-testid="active-filters-count">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            data-testid="clear-all-filters"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <Collapsible
        open={expandedSections.sort}
        onOpenChange={() => toggleSection('sort')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto" data-testid="sort-section-toggle">
            <span className="font-medium">Sort by</span>
            {expandedSections.sort ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger data-testid="sort-select">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Categories */}
      <Collapsible
        open={expandedSections.category}
        onOpenChange={() => toggleSection('category')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto" data-testid="category-section-toggle">
            <span className="font-medium">Category</span>
            {expandedSections.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category === category.id}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                data-testid={`category-filter-${category.slug}`}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {language === "fa" ? category.nameFa : category.nameEn}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Level */}
      <Collapsible
        open={expandedSections.level}
        onOpenChange={() => toggleSection('level')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto" data-testid="level-section-toggle">
            <span className="font-medium">Difficulty Level</span>
            {expandedSections.level ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3">
          {COURSE_LEVELS.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={`level-${level.value}`}
                checked={filters.level === level.value}
                onCheckedChange={(checked) => handleLevelChange(level.value, checked as boolean)}
                data-testid={`level-filter-${level.value}`}
              />
              <Label
                htmlFor={`level-${level.value}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {language === "fa" ? level.labelFa : level.label}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price */}
      <Collapsible
        open={expandedSections.price}
        onOpenChange={() => toggleSection('price')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto" data-testid="price-section-toggle">
            <span className="font-medium">Price</span>
            {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-4">
          {/* Price Type */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-free"
                checked={filters.price === 'free'}
                onCheckedChange={(checked) => handlePriceTypeChange(checked ? 'free' : '')}
                data-testid="price-filter-free"
              />
              <Label htmlFor="price-free" className="text-sm font-normal cursor-pointer">
                Free
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="price-paid"
                checked={filters.price === 'paid'}
                onCheckedChange={(checked) => handlePriceTypeChange(checked ? 'paid' : '')}
                data-testid="price-filter-paid"
              />
              <Label htmlFor="price-paid" className="text-sm font-normal cursor-pointer">
                Paid
              </Label>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={500}
                min={0}
                step={10}
                className="w-full"
                data-testid="price-range-slider"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatPrice(priceRange[0].toString())}</span>
              <span>{formatPrice(priceRange[1].toString())}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Instructors */}
      <Collapsible
        open={expandedSections.instructor}
        onOpenChange={() => toggleSection('instructor')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto" data-testid="instructor-section-toggle">
            <span className="font-medium">Instructor</span>
            {expandedSections.instructor ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 space-y-3 max-h-48 overflow-y-auto">
          {instructors.slice(0, 10).map((instructor) => {
            const instructorName = `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.username;
            return (
              <div key={instructor.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`instructor-${instructor.id}`}
                  checked={filters.instructor === instructor.id}
                  onCheckedChange={() => handleInstructorChange(instructor.id)}
                  data-testid={`instructor-filter-${instructor.id}`}
                />
                <Label
                  htmlFor={`instructor-${instructor.id}`}
                  className="text-sm font-normal cursor-pointer flex-1 truncate"
                  title={instructorName}
                >
                  {instructorName}
                </Label>
              </div>
            );
          })}
        </CollapsibleContent>
      </Collapsible>

      {/* Applied Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="space-y-3" data-testid="applied-filters-summary">
          <Label className="text-sm font-medium">Applied Filters:</Label>
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Badge variant="secondary" className="text-xs">
                Category: {categories.find(c => c.id === filters.category)?.name}
              </Badge>
            )}
            {filters.level && (
              <Badge variant="secondary" className="text-xs">
                Level: {COURSE_LEVELS.find(l => l.value === filters.level)?.label}
              </Badge>
            )}
            {filters.price && (
              <Badge variant="secondary" className="text-xs">
                Price: {filters.price === 'free' ? 'Free' : 'Paid'}
              </Badge>
            )}
            {filters.instructor && (
              <Badge variant="secondary" className="text-xs">
                Instructor: {instructors.find(i => i.id === filters.instructor)?.username}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
