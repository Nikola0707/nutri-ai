"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecipeFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    cuisine: string;
    difficulty: string;
    dietaryTags: string[];
  }) => void;
}

export function RecipeFilters({ onFiltersChange }: RecipeFiltersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("any");
  const [selectedDifficulty, setSelectedDifficulty] = useState("any");
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const cuisineTypes = [
    "Mediterranean",
    "American",
    "Asian-Fusion",
    "Italian",
    "Mexican",
    "Indian",
    "Thai",
    "Japanese",
    "French",
    "Greek",
    "Middle Eastern",
    "Chinese",
  ];

  const dietaryTags = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "keto-friendly",
    "low-carb",
    "high-protein",
    "healthy",
    "paleo",
    "whole30",
  ];

  // Debounce only search input, not other filters
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        onFiltersChange({
          search: searchQuery,
          cuisine: selectedCuisine,
          difficulty: selectedDifficulty,
          dietaryTags: selectedDietaryTags,
        });
      },
      searchQuery ? 300 : 0
    ); // Only debounce when there's a search query

    return () => clearTimeout(timeoutId);
  }, [
    searchQuery,
    selectedCuisine,
    selectedDifficulty,
    selectedDietaryTags,
    onFiltersChange,
  ]);

  const toggleDietaryTag = (tag: string) => {
    setSelectedDietaryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine("any");
    setSelectedDifficulty("any");
    setSelectedDietaryTags([]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCuisine !== "any" ||
    selectedDifficulty !== "any" ||
    selectedDietaryTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-neutral-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={`border-neutral-200 ${
            showFilters
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : ""
          }`}
        >
          <Filter size={20} />
          Filters
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-600">Active filters:</span>
          {selectedCuisine !== "any" && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              {selectedCuisine}
              <X
                size={14}
                className="ml-1 cursor-pointer"
                onClick={() => setSelectedCuisine("any")}
              />
            </Badge>
          )}
          {selectedDifficulty !== "any" && (
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              {selectedDifficulty}
              <X
                size={14}
                className="ml-1 cursor-pointer"
                onClick={() => setSelectedDifficulty("any")}
              />
            </Badge>
          )}
          {selectedDietaryTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-emerald-100 text-emerald-800"
            >
              {tag}
              <X
                size={14}
                className="ml-1 cursor-pointer"
                onClick={() => toggleDietaryTag(tag)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-neutral-500 hover:text-neutral-700"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cuisine Type
              </label>
              <Select
                value={selectedCuisine}
                onValueChange={setSelectedCuisine}
              >
                <SelectTrigger className="bg-white border-neutral-200">
                  <SelectValue placeholder="Any cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any cuisine</SelectItem>
                  {cuisineTypes.map((cuisine) => (
                    <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                      {cuisine}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Difficulty
              </label>
              <Select
                value={selectedDifficulty}
                onValueChange={setSelectedDifficulty}
              >
                <SelectTrigger className="bg-white border-neutral-200">
                  <SelectValue placeholder="Any difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any difficulty</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Dietary Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {dietaryTags.map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleDietaryTag(tag)}
                  className={`border-neutral-200 ${
                    selectedDietaryTags.includes(tag)
                      ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
