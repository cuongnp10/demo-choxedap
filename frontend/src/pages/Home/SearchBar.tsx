import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, Loader2, X, TrendingUp } from "lucide-react";
import { aiApi } from "../../lib/api";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

// Simple in-memory cache to reduce "lag" from redundant API calls
const suggestionsCache: Record<string, string[]> = {};

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    // Check cache first for instant results (including empty query for initial recommendations)
    const cacheKey = trimmedQuery || "__initial__";
    if (suggestionsCache[cacheKey]) {
      setSuggestions(suggestionsCache[cacheKey]);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);
    
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Pass empty string for initial trending suggestions
      const data = await aiApi.getSuggestions(trimmedQuery);
      suggestionsCache[cacheKey] = data;
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("AI Suggestions error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce AI suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only auto-fetch if there's text OR if it's already focused and empty
      if (query.trim().length >= 2) {
        fetchSuggestions(query);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Handle focus to show initial recommendations
  const handleFocus = () => {
    if (query.trim().length < 2) {
      fetchSuggestions("");
    } else {
      setShowSuggestions(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = (searchQuery || query).trim();
    if (finalQuery) {
      onSearch(finalQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearQuery = () => {
    setQuery("");
    fetchSuggestions(""); // Show initial suggestions again after clearing
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-0 -mt-10 relative z-50">
      <div className="relative w-full max-w-4xl mx-auto" ref={dropdownRef}>
        <div className="bg-white rounded-2xl md:rounded-full flex items-center p-2 pl-6 pr-2 w-full shadow-2xl border border-gray-100 transition-transform hover:scale-[1.01] focus-within:ring-4 focus-within:ring-primary/10">
          <div className="w-6 h-6 shrink-0 mr-4 text-gray-400">
            <Search className="w-full h-full" />
          </div>

          <input
            type="text"
            placeholder="Bạn đang tìm thương hiệu hay dòng xe nào?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="flex-1 text-base md:text-lg text-gray-800 font-medium placeholder-gray-400 outline-none bg-transparent h-14 md:h-16"
          />

          <div className="flex items-center gap-2 mr-2">
            {query && (
              <button 
                onClick={clearQuery}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
            {isLoading && (
              <div className="animate-in fade-in duration-200">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            className="bg-primary rounded-xl md:rounded-full flex items-center justify-center px-10 py-3 md:py-4 shrink-0 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
          >
            <span className="text-white text-base md:text-lg font-bold">
              Tìm kiếm
            </span>
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-40">
            <div className="p-3 border-b border-gray-50 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider bg-primary/5">
              {query.trim().length > 0 ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  Gợi ý từ AI
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3" />
                  Gợi ý cho bạn
                </>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {isLoading && suggestions.length === 0 ? (
                <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                  <span className="text-sm">Đang chuẩn bị gợi ý...</span>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center gap-3 group border-b border-gray-50 last:border-0"
                  >
                    <Search className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    <span className="text-gray-700 font-medium group-hover:text-primary transition-colors">
                      {suggestion}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
