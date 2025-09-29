import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ExternalLink, CheckCircle } from 'lucide-react';
import MedievalCard from './MedievalCard';
import { useTheme } from '../contexts/ThemeContext';

const NewsArticleCard = ({
  article,
  onRead,
  onViewDetails,
  delay = 0
}) => {
  const { isDarkMode } = useTheme();

  const getPlainSnippet = (html, maxLen = 200) => {
    if (!html) return '';
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const text = doc.body?.textContent || '';
      const clean = text.replace(/\s+/g, ' ').trim();
      return clean.length > maxLen ? clean.slice(0, maxLen).trim() + '…' : clean;
    } catch (e) {
      // Fallback simple strip
      const text = String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.length > maxLen ? text.slice(0, maxLen).trim() + '…' : text;
    }
  };

  const handleClick = () => {
    if (!article.read && onRead) onRead(article.id);
    if (onViewDetails) onViewDetails(article.id);
  };

  const preview = getPlainSnippet(article.description || article.content || '');
  const publishedDate = article.published_at ? new Date(article.published_at) : null;
  const formattedDate = publishedDate ? publishedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : null;

  return (
    <motion.div
      className="news-article-card cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <MedievalCard className="overflow-hidden">
        <div className="flex gap-4 p-4">
          {/* Image */}
          {article.image_url && (
            <div className="w-28 h-28 flex-shrink-0 rounded overflow-hidden border" style={{ borderColor: 'rgba(var(--accent-color), 0.35)' }}>
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3
                className="text-lg font-bold leading-snug truncate"
                style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}
                title={article.title}
              >
                {article.title}
              </h3>
              {article.read && (
                <div className="flex items-center gap-1 text-sm" style={{ color: `rgb(var(--accent-color))` }}>
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Read</span>
                </div>
              )}
            </div>

            <div className="text-sm opacity-80 mt-1 flex items-center gap-3 flex-wrap">
              {article.author && (
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {article.author}</span>
              )}
              {formattedDate && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formattedDate}</span>
              )}
              {article.feed_name && (
                <span className="truncate">{article.feed_name}</span>
              )}
            </div>

            <div className="mt-2">
              {preview ? (
                <div>
                  <p className="text-sm opacity-90 mb-3">
                    {preview}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      className="inline-flex items-center gap-1 px-3 py-1 rounded border hover:opacity-90 transition-opacity"
                      style={{ 
                        borderColor: 'rgba(var(--accent-color), 0.5)',
                        backgroundColor: 'rgba(var(--accent-color), 0.1)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                      }}
                    >
                      Read more
                    </button>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 hover:underline opacity-90 text-sm"
                    >
                      View original <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center flex-wrap gap-1">
                  <span className="text-sm italic opacity-70">No preview available. Click</span>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded border hover:opacity-90 transition-opacity"
                    style={{ 
                      borderColor: 'rgba(var(--accent-color), 0.5)',
                      backgroundColor: 'rgba(var(--accent-color), 0.1)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                  >
                    Read more
                  </button>
                  <span className="text-sm italic opacity-70">to view the full article.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </MedievalCard>
    </motion.div>
  );
};

export default NewsArticleCard;
