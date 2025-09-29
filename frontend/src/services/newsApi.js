import api from './api';

class NewsAPI {
  async getArticles({ page = 1, perPage = 10, search = '', feedId } = {}) {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('per_page', String(perPage));
    if (search) params.set('search', search);
    if (feedId) params.set('feed_id', String(feedId));

    const { data } = await api.get(`/articles?${params.toString()}`);
    return data; // { articles: [...], pagination: {...} }
  }

  async getArticle(id) {
    const { data } = await api.get(`/articles/${id}`);
    return data; // article detail json
  }

  async markAsRead(id) {
    const { data } = await api.patch(`/articles/${id}/mark_as_read`);
    return data; // { message, read }
  }

  async getFeeds() {
    const { data } = await api.get('/feeds');
    return data; // { feeds: [...] } or array depending on backend
  }

  async refreshFeed(feedId) {
    const { data } = await api.post(`/feeds/${feedId}/refresh`);
    return data;
  }
}

export const newsApi = new NewsAPI();
