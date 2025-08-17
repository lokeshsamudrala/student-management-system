import React, { useState, useRef, useEffect } from 'react';
import { Search, Film, X, Check, Tv, Star } from 'lucide-react';
import axios from 'axios';
import debounce from 'lodash.debounce';

const MovieSearch = ({ selectedMovies = [], onMoviesChange, maxSelections = 3 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w200';

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
          params: {
            api_key: TMDB_API_KEY,
            query: query,
            page: 1,
            include_adult: false
          }
        });

        if (response.data.results) {
          // Filter to only movies and TV shows, exclude people
          const filteredResults = response.data.results
            .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
            .slice(0, 10); // Limit to 10 results
          
          setSearchResults(filteredResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching movies:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const selectMovie = (item) => {
    // Create unique ID combining type and TMDb ID
    const uniqueId = `${item.media_type}-${item.id}`;
    
    // Check if item is already selected
    const isAlreadySelected = selectedMovies.some(selected => selected.uniqueId === uniqueId);
    
    if (isAlreadySelected) {
      return;
    }

    if (selectedMovies.length >= maxSelections) {
      return;
    }

    const movieData = {
      uniqueId: uniqueId,
      tmdbId: item.id,
      title: item.media_type === 'movie' ? item.title : item.name,
      originalTitle: item.media_type === 'movie' ? item.original_title : item.original_name,
      year: item.media_type === 'movie' 
        ? (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A')
        : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A'),
      type: item.media_type, // 'movie' or 'tv'
      poster: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : null,
      rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : null,
      overview: item.overview,
      popularity: item.popularity
    };

    onMoviesChange([...selectedMovies, movieData]);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const removeMovie = (movieToRemove) => {
    const updatedMovies = selectedMovies.filter(movie => movie.uniqueId !== movieToRemove.uniqueId);
    onMoviesChange(updatedMovies);
  };

  const isItemSelected = (item) => {
    const uniqueId = `${item.media_type}-${item.id}`;
    return selectedMovies.some(selected => selected.uniqueId === uniqueId);
  };

  const getDisplayYear = (item) => {
    if (item.media_type === 'movie') {
      return item.release_date ? new Date(item.release_date).getFullYear() : 'N/A';
    } else {
      return item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A';
    }
  };

  const getDisplayTitle = (item) => {
    return item.media_type === 'movie' ? item.title : item.name;
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-apple-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            onFocus={() => setShowResults(true)}
            className="w-full pl-10 pr-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Search for movies or TV shows... (e.g., 'Bahubali', 'Breaking Bad')"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-apple-300 rounded-xl shadow-lg max-h-80 overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button
                  key={`${item.media_type}-${item.id}`}
                  type="button"
                  onClick={() => selectMovie(item)}
                  disabled={isItemSelected(item) || selectedMovies.length >= maxSelections}
                  className={`w-full p-3 text-left hover:bg-apple-50 border-b border-apple-100 last:border-b-0 flex items-start space-x-3 transition-colors ${
                    isItemSelected(item) ? 'bg-green-50 cursor-not-allowed' : ''
                  } ${selectedMovies.length >= maxSelections && !isItemSelected(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Poster */}
                  <div className="w-12 h-16 bg-apple-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.poster_path ? (
                      <img 
                        src={`${TMDB_IMAGE_BASE_URL}${item.poster_path}`}
                        alt={getDisplayTitle(item)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-apple-400">
                        {item.media_type === 'movie' ? <Film className="h-6 w-6" /> : <Tv className="h-6 w-6" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-apple-900 truncate">{getDisplayTitle(item)}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-apple-600">{getDisplayYear(item)}</span>
                          <span className="text-apple-300">•</span>
                          <span className="text-sm text-apple-600 capitalize">
                            {item.media_type === 'movie' ? 'Movie' : 'TV Series'}
                          </span>
                          {item.vote_average && item.vote_average > 0 && (
                            <>
                              <span className="text-apple-300">•</span>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-sm text-apple-600">
                                  {Math.round(item.vote_average * 10) / 10}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        {item.overview && (
                          <p className="text-xs text-apple-500 mt-1 line-clamp-2">
                            {item.overview.length > 100 ? `${item.overview.substring(0, 100)}...` : item.overview}
                          </p>
                        )}
                      </div>
                      {isItemSelected(item) && (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-apple-600">
                {isSearching ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  'No results found'
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Movies */}
      {selectedMovies.length > 0 && (
        <div>
          <p className="text-sm font-medium text-apple-700 mb-2">
            Selected Favorites ({selectedMovies.length}/{maxSelections}):
          </p>
          <div className="space-y-2">
            {selectedMovies.map((movie) => (
              <div
                key={movie.uniqueId}
                className="flex items-center space-x-3 bg-apple-50 rounded-lg p-3"
              >
                {/* Mini Poster */}
                <div className="w-8 h-10 bg-apple-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {movie.poster ? (
                    <img 
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-apple-400">
                      {movie.type === 'movie' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
                    </div>
                  )}
                </div>
                
                {/* Movie Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-apple-900 text-sm truncate">{movie.title}</h4>
                  <p className="text-xs text-apple-600">
                    {movie.year} • {movie.type === 'movie' ? 'Movie' : 'TV Series'}
                    {movie.rating && ` • ⭐ ${movie.rating}`}
                  </p>
                </div>
                
                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeMovie(movie)}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-apple-500">
        Search and select up to {maxSelections} of your favorite movies or TV shows. 
        {selectedMovies.length >= maxSelections && (
          <span className="text-orange-600 font-medium"> You've reached the maximum selection limit.</span>
        )}
      </p>
    </div>
  );
};

export default MovieSearch;