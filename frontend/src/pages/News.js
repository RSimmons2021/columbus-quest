import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MedievalCard from '../components/MedievalCard';
import NewsArticleCard from '../components/NewsArticleCard';
import NewsSearch from '../components/NewsSearch';
import { newsApi } from '../services/newsApi';

const PAGE_SIZE = 10;

const News = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, has_next: false, has_prev: false });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getArticles({ page, perPage: PAGE_SIZE, search });
      setArticles(data.articles || []);
      setPagination(data.pagination || { current_page: 1, total_pages: 1, has_next: false, has_prev: false });
    } catch (e) {
      setError(e?.message || 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = useCallback((q) => {
    setSearch(q || '');
    setPage(1);
  }, []);

  const markRead = useCallback(async (id) => {
    try {
      await newsApi.markAsRead(id);
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    } catch {}
  }, []);

  const goDetail = useCallback((id) => navigate(`/news/${id}`), [navigate]);

  const pager = useMemo(() => ({
    prev: () => pagination.has_prev && setPage((p) => Math.max(1, p - 1)),
    next: () => pagination.has_next && setPage((p) => p + 1)
  }), [pagination]);

  return (
    <div className="container mx-auto px-6 pb-16">
      <div className="pt-6 pb-4 flex items-center gap-3">
        <BookOpen className="w-6 h-6" style={{ color: `rgb(var(--accent-color))` }} />
        <h1 className="text-2xl font-bold" style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}>Chronicles</h1>
      </div>

      <div className="mb-4">
        <NewsSearch onSearch={handleSearch} loading={loading} />
      </div>

      {loading && (
        <MedievalCard className="mt-6">
          <LoadingSpinner variant="progress" message="Summoning latest chronicles..." />
        </MedievalCard>
      )}

      {error && !loading && (
        <MedievalCard className="p-6 mt-6">
          <p className="text-red-400">{error}</p>
        </MedievalCard>
      )}

      {!loading && !error && (
        <>
          {articles.length === 0 ? (
            <MedievalCard className="p-8 text-center mt-6">
              <p className="opacity-80">No articles found.</p>
            </MedievalCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {articles.map((a, idx) => (
                <NewsArticleCard
                  key={a.id}
                  article={a}
                  onRead={markRead}
                  onViewDetails={goDetail}
                  delay={idx * 0.03}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              className="px-3 py-2 rounded border inline-flex items-center gap-1 disabled:opacity-50"
              style={{ borderColor: 'rgba(var(--accent-color), 0.35)' }}
              onClick={pager.prev}
              disabled={!pagination.has_prev}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="opacity-80 text-sm">
              Page {pagination.current_page} of {pagination.total_pages || 1}
            </span>
            <button
              className="px-3 py-2 rounded border inline-flex items-center gap-1 disabled:opacity-50"
              style={{ borderColor: 'rgba(var(--accent-color), 0.35)' }}
              onClick={pager.next}
              disabled={!pagination.has_next}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default News;
