import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, User, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { newsApi } from '../services/newsApi';

const NewsDetail = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsApi.getArticle(id);
      setArticle(data);
    } catch (e) {
      setError(e?.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container mx-auto px-6 pb-16">
      <div className="pt-6 pb-4 flex items-center gap-3">
        <button
          className="px-3 py-2 rounded border inline-flex items-center gap-2"
          style={{ borderColor: 'rgba(var(--accent-color), 0.35)' }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {loading && (
        <MedievalCard className="mt-6">
          <LoadingSpinner variant="progress" message="Summoning the full chronicle..." />
        </MedievalCard>
      )}

      {error && !loading && (
        <MedievalCard className="p-6 mt-6">
          <p className="text-red-400">{error}</p>
        </MedievalCard>
      )}

      {!loading && !error && article && (
        <MedievalCard className="overflow-hidden mt-4">
          {article.image_url && (
            <div className="w-full h-64 overflow-hidden">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6">
            <h1 className="text-2xl font-bold" style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}>{article.title}</h1>
            <div className="text-sm opacity-80 mt-2 flex items-center gap-3 flex-wrap">
              {article.author && <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.author}</span>}
              {article.formatted_date ? (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {article.formatted_date}</span>
              ) : (
                article.published_at && <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(article.published_at).toLocaleString()}</span>
              )}
            </div>

            {/* Prefer content, fallback to description */}
            <div className="prose max-w-none mt-6 opacity-95">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p>{article.description}</p>
              )}
            </div>

            <div className="mt-6">
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border px-3 py-2 rounded"
                style={{ borderColor: 'rgba(var(--accent-color), 0.35)' }}
              >
                Read original <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </MedievalCard>
      )}
    </div>
  );
};

export default NewsDetail;
