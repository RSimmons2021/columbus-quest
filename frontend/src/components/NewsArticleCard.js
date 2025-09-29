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

  const handleClick = () => {
    if (!article.read && onRead) onRead(article.id);
    if (onViewDetails) onViewDetails(article.id);
  };

  return (
    <motion.div
      className="news-article-card cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={handleClick}
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
              {article.published_at && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(article.published_at).toLocaleString()}</span>
              )}
              {article.feed_name && (
                <span className="truncate">{article.feed_name}</span>
              )}
            </div>

            <p className="text-sm mt-2 line-clamp-2 opacity-90">
              {article.description}
            </p>

            <div className="mt-3 flex items-center gap-3 text-sm">
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:underline opacity-90"
              >
                Open source <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </MedievalCard>
    </motion.div>
  );
};

export default NewsArticleCard;
