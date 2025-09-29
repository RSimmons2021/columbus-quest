# 📰 RSS Feed Reader Implementation Plan

## 🎯 **Requirements Summary**
- **RSS Feed**: Atlas Obscura (configurable via admin interface)
- **Route**: `/news` (new page route)
- **Pagination**: 10 items per page
- **Read Tracking**: Persistent across sessions
- **Search**: PostgreSQL full-text search
- **Architecture**: Rails API endpoints + React frontend

---

## 🏗️ **Database Schema Design**

### 1. **Feeds Table**
```ruby
class CreateFeeds < ActiveRecord::Migration[8.0]
  def change
    create_table :feeds do |t|
      t.string :name, null: false              # "Atlas Obscura"
      t.string :url, null: false               # RSS feed URL
      t.text :description                      # Feed description
      t.datetime :last_fetched_at             # Track last update
      t.boolean :active, default: true        # Enable/disable feed
      t.integer :refresh_interval, default: 3600 # Seconds between updates
      t.timestamps
    end

    add_index :feeds, :url, unique: true
    add_index :feeds, :active
  end
end
```

### 2. **Articles Table**
```ruby
class CreateArticles < ActiveRecord::Migration[8.0]
  def change
    create_table :articles do |t|
      t.references :feed, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description                     # RSS description/summary
      t.text :content                         # Full article content (if available)
      t.string :url, null: false              # Original article URL
      t.string :image_url                     # Featured image
      t.string :author                        # Article author
      t.datetime :published_at                # Original publish date
      t.string :guid                          # RSS GUID for deduplication
      t.timestamps
    end

    add_index :articles, :feed_id
    add_index :articles, :published_at
    add_index :articles, :guid, unique: true
    add_index :articles, :url

    # PostgreSQL full-text search indexes
    execute "CREATE INDEX articles_search_idx ON articles USING gin(to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')))"
  end
end
```

### 3. **Read Statuses Table**
```ruby
class CreateReadStatuses < ActiveRecord::Migration[8.0]
  def change
    create_table :read_statuses do |t|
      t.references :article, null: false, foreign_key: true
      t.string :user_session_id, null: false  # Browser session ID
      t.datetime :read_at, null: false
      t.timestamps
    end

    add_index :read_statuses, [:article_id, :user_session_id], unique: true
    add_index :read_statuses, :user_session_id
  end
end
```

---

## 🎯 **Rails Models**

### 1. **Feed Model**
```ruby
class Feed < ApplicationRecord
  has_many :articles, dependent: :destroy

  validates :name, presence: true
  validates :url, presence: true, uniqueness: true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :refresh_interval, numericality: { greater_than: 300 } # Min 5 minutes

  scope :active, -> { where(active: true) }

  def needs_refresh?
    last_fetched_at.nil? || last_fetched_at < refresh_interval.seconds.ago
  end

  def fetch_and_parse!
    FeedParserService.new(self).call
    update!(last_fetched_at: Time.current)
  end
end
```

### 2. **Article Model**
```ruby
class Article < ApplicationRecord
  belongs_to :feed
  has_many :read_statuses, dependent: :destroy

  validates :title, presence: true
  validates :url, presence: true
  validates :guid, presence: true, uniqueness: true

  scope :recent, -> { order(published_at: :desc, created_at: :desc) }
  scope :published_after, ->(date) { where('published_at > ?', date) }

  # PostgreSQL full-text search
  scope :search, ->(query) {
    where("to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')) @@ plainto_tsquery('english', ?)", query)
  }

  def read_by?(session_id)
    read_statuses.exists?(user_session_id: session_id)
  end

  def mark_as_read!(session_id)
    read_statuses.find_or_create_by!(user_session_id: session_id) do |rs|
      rs.read_at = Time.current
    end
  end

  def preview_text(limit = 200)
    return description.truncate(limit) if description.present?
    content&.truncate(limit) || ""
  end
end
```

### 3. **ReadStatus Model**
```ruby
class ReadStatus < ApplicationRecord
  belongs_to :article

  validates :user_session_id, presence: true
  validates :read_at, presence: true
  validates :article_id, uniqueness: { scope: :user_session_id }
end
```

---

## ⚙️ **Rails Services**

### 1. **FeedParserService**
```ruby
class FeedParserService
  require 'rss'
  require 'open-uri'

  def initialize(feed)
    @feed = feed
  end

  def call
    rss_content = fetch_rss_content
    parsed_feed = RSS::Parser.parse(rss_content)

    parsed_feed.items.each do |item|
      create_or_update_article(item)
    end

    Rails.logger.info "Parsed #{parsed_feed.items.count} items from #{@feed.name}"
  rescue => e
    Rails.logger.error "Failed to parse feed #{@feed.name}: #{e.message}"
    raise e
  end

  private

  def fetch_rss_content
    URI.open(@feed.url, 'User-Agent' => 'Columbus Quest RSS Reader/1.0').read
  end

  def create_or_update_article(item)
    Article.find_or_create_by!(guid: item.guid&.content || item.link) do |article|
      article.feed = @feed
      article.title = item.title
      article.description = item.description
      article.content = extract_content(item)
      article.url = item.link
      article.image_url = extract_image_url(item)
      article.author = item.author || item.dc_creator
      article.published_at = item.pubDate || item.date || Time.current
    end
  end

  def extract_content(item)
    # Try different content fields that RSS feeds might use
    item.content_encoded || item.content || item.description
  end

  def extract_image_url(item)
    # Try different image sources
    return item.enclosure.url if item.enclosure&.type&.start_with?('image/')

    # Parse description for img tags
    if item.description
      img_match = item.description.match(/<img[^>]+src="([^"]+)"/i)
      return img_match[1] if img_match
    end

    nil
  end
end
```

### 2. **FeedRefreshJob** (Background Job)
```ruby
class FeedRefreshJob < ApplicationJob
  queue_as :default

  def perform(feed_id = nil)
    feeds = feed_id ? [Feed.find(feed_id)] : Feed.active.select(&:needs_refresh?)

    feeds.each do |feed|
      begin
        feed.fetch_and_parse!
        Rails.logger.info "Successfully refreshed feed: #{feed.name}"
      rescue => e
        Rails.logger.error "Failed to refresh feed #{feed.name}: #{e.message}"
      end
    end
  end
end
```

---

## 🛣️ **Rails API Controllers**

### 1. **Api::V1::ArticlesController**
```ruby
class Api::V1::ArticlesController < ApplicationController
  before_action :ensure_session_id

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
    @article.mark_as_read!(session[:session_id])

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
        read: article.read_by?(session[:session_id])
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
      read: article.read_by?(session[:session_id])
    }
  end

  def ensure_session_id
    session[:session_id] ||= SecureRandom.uuid
  end
end
```

### 2. **Api::V1::FeedsController**
```ruby
class Api::V1::FeedsController < ApplicationController
  def index
    @feeds = Feed.active.order(:name)
    render json: @feeds.as_json(only: [:id, :name, :description, :last_fetched_at])
  end

  def refresh
    @feed = Feed.find(params[:id])
    FeedRefreshJob.perform_later(@feed.id)

    render json: {
      message: "Feed refresh queued for #{@feed.name}",
      feed_id: @feed.id
    }
  end

  def refresh_all
    FeedRefreshJob.perform_later
    render json: { message: "All active feeds queued for refresh" }
  end
end
```

### 3. **Admin::FeedsController** (Simple Admin Interface)
```ruby
class Admin::FeedsController < ApplicationController
  before_action :set_feed, only: [:show, :edit, :update, :destroy]

  def index
    @feeds = Feed.all.order(:name)
  end

  def show
  end

  def new
    @feed = Feed.new
  end

  def create
    @feed = Feed.new(feed_params)

    if @feed.save
      # Test the feed immediately
      begin
        @feed.fetch_and_parse!
        redirect_to admin_feed_path(@feed), notice: 'Feed created and parsed successfully!'
      rescue => e
        @feed.update(active: false)
        redirect_to admin_feed_path(@feed), alert: "Feed created but parsing failed: #{e.message}"
      end
    else
      render :new
    end
  end

  def edit
  end

  def update
    if @feed.update(feed_params)
      redirect_to admin_feed_path(@feed), notice: 'Feed updated successfully.'
    else
      render :edit
    end
  end

  def destroy
    @feed.destroy
    redirect_to admin_feeds_path, notice: 'Feed deleted successfully.'
  end

  private

  def set_feed
    @feed = Feed.find(params[:id])
  end

  def feed_params
    params.require(:feed).permit(:name, :url, :description, :active, :refresh_interval)
  end
end
```

---

## 🛣️ **Rails Routes**
```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :quests do
        member do
          post 'check_in/:checkpoint_id', to: 'quests#check_in'
        end
      end

      get 'leaderboard', to: 'leaderboard#index'

      # New RSS endpoints
      resources :articles, only: [:index, :show] do
        member do
          patch :mark_as_read
        end
      end

      resources :feeds, only: [:index] do
        member do
          post :refresh
        end

        collection do
          post :refresh_all
        end
      end
    end
  end

  namespace :admin do
    resources :feeds
  end

  root 'pwa#index'
  get '*path', to: 'pwa#index'
end
```

---

## 🎨 **React Frontend Components**

### 1. **News Page Component**
```javascript
// src/pages/News.js
const News = () => {
  const { isDarkMode } = useTheme();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Implementation details...
};
```

### 2. **Article Card Component**
```javascript
// src/components/NewsArticleCard.js
const NewsArticleCard = ({
  article,
  onRead,
  onViewDetails
}) => {
  const { isDarkMode } = useTheme();

  // Medieval-themed article card implementation...
};
```

### 3. **Article Detail Component**
```javascript
// src/pages/NewsDetail.js
const NewsDetail = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const [article, setArticle] = useState(null);

  // Full article view implementation...
};
```

### 4. **Search Component**
```javascript
// src/components/NewsSearch.js
const NewsSearch = ({
  onSearch,
  loading
}) => {
  const [query, setQuery] = useState('');

  // Debounced search implementation...
};
```

---

## 📊 **API Endpoints Summary**

### Articles API
```
GET    /api/v1/articles?page=1&per_page=10&search=medieval&feed_id=1
GET    /api/v1/articles/:id
PATCH  /api/v1/articles/:id/mark_as_read
```

### Feeds API
```
GET    /api/v1/feeds
POST   /api/v1/feeds/:id/refresh
POST   /api/v1/feeds/refresh_all
```

### Admin Interface
```
GET    /admin/feeds           # List all feeds
GET    /admin/feeds/new       # New feed form
POST   /admin/feeds           # Create feed
GET    /admin/feeds/:id/edit  # Edit feed form
PATCH  /admin/feeds/:id       # Update feed
DELETE /admin/feeds/:id       # Delete feed
```

---

## 🔄 **Background Job Setup**

### Recurring Job (using whenever gem)
```ruby
# config/schedule.rb
every 1.hour do
  runner "FeedRefreshJob.perform_later"
end
```

### Manual Refresh via Admin
```ruby
# In admin interface
FeedRefreshJob.perform_later(feed.id)
```

---

## 🎯 **Key Technical Features**

### 1. **PostgreSQL Full-Text Search**
- Uses `to_tsvector` and `plainto_tsquery` for natural language search
- Searches across title, description, and content fields
- Indexed for performance

### 2. **Pagination**
- Backend: Uses Kaminari gem for pagination
- Frontend: Page-based navigation with prev/next
- Configurable items per page (default 10, max 50)

### 3. **Read Status Tracking**
- Session-based persistent tracking
- Unique constraint prevents duplicate reads
- Efficient lookup with indexed queries

### 4. **RSS Feed Management**
- Configurable feed URLs via admin interface
- Automatic deduplication using GUID
- Error handling for invalid feeds
- Rate limiting and respectful fetching

### 5. **Performance Optimizations**
- Database indexes on frequently queried columns
- Eager loading to prevent N+1 queries
- Background job processing for feed updates
- Pagination to handle large datasets

---

## 🚀 **Implementation Steps**

### Backend (90 minutes)
1. **Database Setup** (15 min) - Migrations, models
2. **RSS Parsing Service** (30 min) - Feed parsing logic
3. **API Controllers** (30 min) - REST endpoints
4. **Admin Interface** (15 min) - Simple feed management

### Frontend (75 minutes)
1. **News Page Route** (15 min) - Basic page structure
2. **Article Cards** (20 min) - Medieval-themed cards
3. **Search & Pagination** (20 min) - UI components
4. **Article Detail Page** (20 min) - Full article view

### Integration & Testing (30 minutes)
1. **Seed Atlas Obscura feed** (5 min)
2. **Test all endpoints** (10 min)
3. **End-to-end testing** (15 min)

---

## 🎤 **Interview Talking Points**

### Technical Decisions
- **PostgreSQL full-text search** vs ElasticSearch (appropriate for scale)
- **Session-based read tracking** vs user authentication
- **Background jobs** for RSS fetching (non-blocking)
- **Pagination** strategy for large datasets

### Scalability Considerations
- Database indexing strategy
- RSS feed refresh frequency
- Memory usage for large articles
- API rate limiting

### Code Quality
- Service objects for business logic
- Controller concerns separation
- Model validations and scopes
- Error handling and logging

---

**Ready to proceed with implementation? Any questions or modifications to this plan?** 🏛️