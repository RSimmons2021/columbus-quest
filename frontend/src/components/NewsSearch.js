import React, { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, X } from 'lucide-react';

const useDebouncedValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const NewsSearch = ({ onSearch, loading }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 400);

  useEffect(() => {
    onSearch?.(debouncedQuery.trim());
  }, [debouncedQuery, onSearch]);

  const clearable = useMemo(() => query.length > 0, [query]);

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border w-full max-w-xl mx-auto"
         style={{ borderColor: 'rgba(var(--accent-color), 0.35)', background: 'rgba(0,0,0,0.04)' }}>
      <Search className="w-4 h-4 opacity-70" />
      <input
        className="flex-1 bg-transparent outline-none text-sm"
        placeholder="Search articles..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {clearable && (
        <button
          aria-label="Clear search"
          onClick={() => setQuery('')}
          className="opacity-60 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default NewsSearch;
