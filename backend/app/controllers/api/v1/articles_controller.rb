class Api::V1::ArticlesController < ApplicationController
  # Session-based read tracking temporarily disabled for demo purposes
  # before_action :ensure_session_id

  def index
    @articles = Article.includes(:feed)
                      .recent

    # Apply search filter
    @articles = @articles.search(params[:search]) if params[:search].present?

    # Apply feed filter
    @articles = @articles.where(feed_id: params[:feed_id]) if params[:feed_id].present?

    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    per_page = [per_page, 50].min # Max 50 items per page

    @articles = @articles.page(page).per(per_page)

    render json: {
      articles: articles_json(@articles),
      pagination: {
        current_page: @articles.current_page,
        total_pages: @articles.total_pages,
        total_count: @articles.total_count,
        per_page: per_page,
        has_next: @articles.current_page < @articles.total_pages,
        has_prev: @articles.current_page > 1
      }
    }
  end

  def show
    @article = Article.find(params[:id])
    render json: article_detail_json(@article)
  end

  def mark_as_read
    @article = Article.find(params[:id])
    @article.mark_as_read!("demo-session")

    render json: {
      message: 'Article marked as read',
      read: true
    }
  end

  private

  def articles_json(articles)
    articles.map do |article|
      {
        id: article.id,
        title: article.title,
        description: article.preview_text,
        url: article.url,
        image_url: article.image_url,
        author: article.author,
        published_at: article.published_at,
        feed_name: article.feed.name,
        read: article.read_by?("demo-session")
      }
    end
  end

  def article_detail_json(article)
    {
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      image_url: article.image_url,
      author: article.author,
      published_at: article.published_at,
      feed: {
        id: article.feed.id,
        name: article.feed.name
      },
      read: article.read_by?("demo-session")
    }
  end

  def ensure_session_id
    session[:session_id] ||= SecureRandom.uuid
  end
end