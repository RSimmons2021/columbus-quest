# 📰 RSS Feed Reader - Complete Implementation Documentation

## 🎯 **Final Configuration**
- **Admin Interface**: Simple Rails views (not medieval themed)
- **Initial Setup**: Automatically add Atlas Obscura feed on database setup
- **Search Scope**: Search across all feeds simultaneously
- **Content Storage**: Store full HTML content from RSS feeds
- **Background Jobs**: Default Rails queue (ActiveJob with async adapter)

---

## 🗄️ **Step 1: Database Migrations**

### Migration 1: Create Feeds Table
```ruby
# db/migrate/[timestamp]_create_feeds.rb
class CreateFeeds < ActiveRecord::Migration[8.0]
  def change
    create_table :feeds do |t|
      t.string :name, null: false
      t.string :url, null: false
      t.text :description
      t.datetime :last_fetched_at
      t.boolean :active, default: true
      t.integer :refresh_interval, default: 3600 # 1 hour in seconds
      t.timestamps
    end

    add_index :feeds, :url, unique: true
    add_index :feeds, :active
    add_index :feeds, :last_fetched_at
  end
end
```

### Migration 2: Create Articles Table
```ruby
# db/migrate/[timestamp]_create_articles.rb
class CreateArticles < ActiveRecord::Migration[8.0]
  def change
    create_table :articles do |t|
      t.references :feed, null: false, foreign_key: true
      t.string :title, null: false
      t.text :description
      t.text :content # Full HTML content
      t.string :url, null: false
      t.string :image_url
      t.string :author
      t.datetime :published_at
      t.string :guid, null: false # RSS GUID for deduplication
      t.timestamps
    end

    add_index :articles, :feed_id
    add_index :articles, :published_at
    add_index :articles, :guid, unique: true
    add_index :articles, :url
    add_index :articles, :created_at

    # PostgreSQL full-text search index
    # This creates a GIN index for fast text searching
    execute <<-SQL
      CREATE INDEX articles_search_idx ON articles
      USING gin(to_tsvector('english',
        title || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(content, '')
      ))
    SQL
  end
end
```

### Migration 3: Create Read Statuses Table
```ruby
# db/migrate/[timestamp]_create_read_statuses.rb
class CreateReadStatuses < ActiveRecord::Migration[8.0]
  def change
    create_table :read_statuses do |t|
      t.references :article, null: false, foreign_key: true
      t.string :user_session_id, null: false
      t.datetime :read_at, null: false
      t.timestamps
    end

    # Composite unique index to prevent duplicate reads
    add_index :read_statuses, [:article_id, :user_session_id], unique: true
    add_index :read_statuses, :user_session_id
    add_index :read_statuses, :read_at
  end
end
```

---

## 📦 **Step 2: Update Gemfile**

### Add Required Gems
```ruby
# Add to Gemfile
gem 'kaminari' # For pagination
gem 'rss' # For RSS parsing (built-in to Ruby, but explicit)

# Development gems (already present)
gem 'whenever', require: false # For cron job scheduling (optional)
```

---

## 🏗️ **Step 3: Rails Models**

### Feed Model
```ruby
# app/models/feed.rb
class Feed < ApplicationRecord
  has_many :articles, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :url, presence: true, uniqueness: true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :refresh_interval, numericality: { greater_than: 300 } # Minimum 5 minutes

  scope :active, -> { where(active: true) }

  def needs_refresh?
    last_fetched_at.nil? || last_fetched_at < refresh_interval.seconds.ago
  end

  def fetch_and_parse!
    Rails.logger.info "Fetching feed: #{name} (#{url})"
    FeedParserService.new(self).call
    update!(last_fetched_at: Time.current)
    Rails.logger.info "Successfully parsed feed: #{name}"
  rescue => e
    Rails.logger.error "Failed to parse feed #{name}: #{e.message}"
    raise e
  end

  def articles_count
    articles.count
  end

  def latest_article_date
    articles.maximum(:published_at)
  end
end
```

### Article Model
```ruby
# app/models/article.rb
class Article < ApplicationRecord
  belongs_to :feed
  has_many :read_statuses, dependent: :destroy

  validates :title, presence: true, length: { maximum: 500 }
  validates :url, presence: true
  validates :guid, presence: true, uniqueness: true

  scope :recent, -> { order(published_at: :desc, created_at: :desc) }
  scope :published_after, ->(date) { where('published_at > ?', date) }
  scope :unread_for_session, ->(session_id) {
    left_joins(:read_statuses)
      .where('read_statuses.user_session_id != ? OR read_statuses.id IS NULL', session_id)
  }

  # PostgreSQL full-text search
  scope :search, ->(query) {
    return all if query.blank?

    where(
      "to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')) @@ plainto_tsquery('english', ?)",
      query
    )
  }

  def read_by?(session_id)
    return false if session_id.blank?
    read_statuses.exists?(user_session_id: session_id)
  end

  def mark_as_read!(session_id)
    return if session_id.blank? || read_by?(session_id)

    read_statuses.find_or_create_by!(user_session_id: session_id) do |rs|
      rs.read_at = Time.current
    end
  end

  def preview_text(limit = 200)
    text = description.presence || content.presence || ""
    # Strip HTML tags for preview
    ActionController::Base.helpers.strip_tags(text).truncate(limit)
  end

  def formatted_published_date
    return "Unknown date" unless published_at

    if published_at.today?
      published_at.strftime("%l:%M %p").strip
    elsif published_at >= 1.week.ago
      published_at.strftime("%A")
    else
      published_at.strftime("%B %d, %Y")
    end
  end

  def reading_time
    return 0 unless content.present?

    word_count = ActionController::Base.helpers.strip_tags(content).split.size
    (word_count / 200.0).ceil # Average reading speed: 200 words per minute
  end
end
```

### ReadStatus Model
```ruby
# app/models/read_status.rb
class ReadStatus < ApplicationRecord
  belongs_to :article

  validates :user_session_id, presence: true
  validates :read_at, presence: true
  validates :article_id, uniqueness: { scope: :user_session_id }

  scope :recent, -> { order(read_at: :desc) }
  scope :for_session, ->(session_id) { where(user_session_id: session_id) }
end
```

---

## ⚙️ **Step 4: Service Classes**

### FeedParserService
```ruby
# app/services/feed_parser_service.rb
class FeedParserService
  require 'rss'
  require 'open-uri'

  def initialize(feed)
    @feed = feed
    @parsed_count = 0
    @error_count = 0
  end

  def call
    rss_content = fetch_rss_content
    parsed_feed = RSS::Parser.parse(rss_content)

    parsed_feed.items.each do |item|
      create_or_update_article(item)
    rescue => e
      Rails.logger.warn "Failed to parse individual item: #{e.message}"
      @error_count += 1
    end

    Rails.logger.info "Feed parsing complete - Created/Updated: #{@parsed_count}, Errors: #{@error_count}"
  rescue => e
    Rails.logger.error "Failed to parse feed #{@feed.name}: #{e.message}"
    raise e
  end

  private

  def fetch_rss_content
    options = {
      'User-Agent' => 'Columbus Quest RSS Reader/1.0 (Educational Project)',
      read_timeout: 30,
      open_timeout: 10
    }

    URI.open(@feed.url, options).read
  end

  def create_or_update_article(item)
    guid = extract_guid(item)
    return unless guid.present?

    article = Article.find_or_initialize_by(guid: guid)

    if article.new_record?
      article.assign_attributes(
        feed: @feed,
        title: clean_text(item.title),
        description: clean_html(item.description),
        content: extract_content(item),
        url: item.link,
        image_url: extract_image_url(item),
        author: extract_author(item),
        published_at: extract_published_date(item)
      )

      if article.save
        @parsed_count += 1
        Rails.logger.debug "Created article: #{article.title}"
      else
        Rails.logger.warn "Failed to save article: #{article.errors.full_messages.join(', ')}"
        @error_count += 1
      end
    end

    article
  end

  def extract_guid(item)
    # Try different GUID sources
    item.guid&.content ||
    item.guid ||
    item.link ||
    item.title&.parameterize
  end

  def extract_content(item)
    # Try different content fields in RSS feeds
    content = item.content_encoded ||
              item.try(:content) ||
              item.description ||
              ""

    clean_html(content)
  end

  def extract_image_url(item)
    # Method 1: Check for media:content or enclosure
    if item.enclosure&.url && item.enclosure.type&.start_with?('image/')
      return item.enclosure.url
    end

    # Method 2: Parse description/content for img tags
    content_to_search = [item.description, extract_content(item)].compact.join(' ')

    if content_to_search.present?
      img_match = content_to_search.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
      return img_match[1] if img_match
    end

    # Method 3: Check for media:thumbnail (some feeds have this)
    return item.media_thumbnail.url if item.respond_to?(:media_thumbnail) && item.media_thumbnail

    nil
  end

  def extract_author(item)
    item.author ||
    item.try(:dc_creator) ||
    item.try(:managingEditor) ||
    @feed.name
  end

  def extract_published_date(item)
    date = item.pubDate || item.date || item.try(:published) || item.try(:updated)

    return Time.current unless date

    date.is_a?(String) ? Time.parse(date) : date
  rescue
    Time.current
  end

  def clean_text(text)
    return "" unless text.present?

    # Remove HTML tags and clean up whitespace
    ActionController::Base.helpers.strip_tags(text.to_s).strip
  end

  def clean_html(html)
    return "" unless html.present?

    # Basic HTML cleaning - remove scripts, styles, but keep formatting
    html_string = html.to_s

    # Remove script and style tags completely
    html_string = html_string.gsub(/<script[^>]*>.*?<\/script>/mi, '')
    html_string = html_string.gsub(/<style[^>]*>.*?<\/style>/mi, '')

    # Clean up whitespace
    html_string.strip
  end
end
```

---

## 🚀 **Step 5: Background Jobs**

### FeedRefreshJob
```ruby
# app/jobs/feed_refresh_job.rb
class FeedRefreshJob < ApplicationJob
  queue_as :default

  def perform(feed_id = nil)
    if feed_id
      # Refresh specific feed
      feed = Feed.find(feed_id)
      refresh_feed(feed)
    else
      # Refresh all feeds that need it
      Feed.active.each do |feed|
        refresh_feed(feed) if feed.needs_refresh?
      end
    end
  end

  private

  def refresh_feed(feed)
    Rails.logger.info "Starting refresh for feed: #{feed.name}"
    feed.fetch_and_parse!
    Rails.logger.info "Successfully refreshed feed: #{feed.name}"
  rescue => e
    Rails.logger.error "Failed to refresh feed #{feed.name}: #{e.message}"
    # Don't re-raise - we want other feeds to continue processing
  end
end
```

---

## 🛣️ **Step 6: API Controllers**

### Articles API Controller
```ruby
# app/controllers/api/v1/articles_controller.rb
class Api::V1::ArticlesController < ApplicationController
  before_action :ensure_session_id
  before_action :set_article, only: [:show, :mark_as_read]

  def index
    @articles = Article.includes(:feed, :read_statuses)
                      .recent

    # Apply search filter if provided
    @articles = @articles.search(params[:search]) if params[:search].present?

    # Apply feed filter if provided (optional)
    @articles = @articles.where(feed_id: params[:feed_id]) if params[:feed_id].present?

    # Pagination
    page = [params[:page].to_i, 1].max
    per_page = [[params[:per_page].to_i, 10].max, 50].min # Default 10, max 50

    @articles = @articles.page(page).per(per_page)

    render json: {
      articles: articles_json(@articles),
      pagination: pagination_json(@articles, per_page),
      search_query: params[:search],
      total_feeds: Feed.active.count
    }
  end

  def show
    render json: article_detail_json(@article)
  end

  def mark_as_read
    @article.mark_as_read!(current_session_id)

    render json: {
      message: 'Article marked as read',
      article_id: @article.id,
      read: true,
      read_at: Time.current.iso8601
    }
  end

  private

  def set_article
    @article = Article.find(params[:id])
  end

  def articles_json(articles)
    articles.map do |article|
      {
        id: article.id,
        title: article.title,
        description: article.preview_text(250),
        url: article.url,
        image_url: article.image_url,
        author: article.author,
        published_at: article.published_at&.iso8601,
        formatted_date: article.formatted_published_date,
        reading_time: article.reading_time,
        feed: {
          id: article.feed.id,
          name: article.feed.name
        },
        read: article.read_by?(current_session_id)
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
      published_at: article.published_at&.iso8601,
      formatted_date: article.formatted_published_date,
      reading_time: article.reading_time,
      feed: {
        id: article.feed.id,
        name: article.feed.name
      },
      read: article.read_by?(current_session_id)
    }
  end

  def pagination_json(articles, per_page)
    {
      current_page: articles.current_page,
      total_pages: articles.total_pages,
      total_count: articles.total_count,
      per_page: per_page,
      has_next: articles.current_page < articles.total_pages,
      has_prev: articles.current_page > 1,
      next_page: articles.current_page < articles.total_pages ? articles.current_page + 1 : nil,
      prev_page: articles.current_page > 1 ? articles.current_page - 1 : nil
    }
  end

  def ensure_session_id
    session[:session_id] ||= SecureRandom.uuid
  end

  def current_session_id
    session[:session_id]
  end
end
```

### Feeds API Controller
```ruby
# app/controllers/api/v1/feeds_controller.rb
class Api::V1::FeedsController < ApplicationController
  def index
    @feeds = Feed.active.order(:name)

    render json: {
      feeds: @feeds.map do |feed|
        {
          id: feed.id,
          name: feed.name,
          description: feed.description,
          articles_count: feed.articles_count,
          last_fetched_at: feed.last_fetched_at&.iso8601,
          latest_article_date: feed.latest_article_date&.iso8601
        }
      end
    }
  end

  def refresh
    feed = Feed.find(params[:id])

    # Queue background job for refresh
    FeedRefreshJob.perform_later(feed.id)

    render json: {
      message: "Feed refresh queued for #{feed.name}",
      feed_id: feed.id,
      status: 'queued'
    }
  end

  def refresh_all
    FeedRefreshJob.perform_later

    render json: {
      message: "All active feeds queued for refresh",
      feeds_count: Feed.active.count,
      status: 'queued'
    }
  end
end
```

---

## 🏛️ **Step 7: Admin Interface (Simple Rails Views)**

### Admin Base Controller
```ruby
# app/controllers/admin_controller.rb
class AdminController < ApplicationController
  layout 'admin'
  before_action :authenticate_admin! # Add authentication as needed

  private

  def authenticate_admin!
    # Simple authentication - you can enhance this
    return true if Rails.env.development?

    # Add proper authentication here for production
    redirect_to root_path unless session[:admin_authenticated]
  end
end
```

### Admin Feeds Controller
```ruby
# app/controllers/admin/feeds_controller.rb
class Admin::FeedsController < AdminController
  before_action :set_feed, only: [:show, :edit, :update, :destroy, :refresh]

  def index
    @feeds = Feed.all.order(:name)
    @active_feeds_count = Feed.active.count
    @total_articles_count = Article.count
  end

  def show
    @recent_articles = @feed.articles.recent.limit(10)
    @articles_count = @feed.articles.count
    @latest_article = @feed.articles.recent.first
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
        redirect_to admin_feed_path(@feed), notice: "Feed '#{@feed.name}' created and parsed successfully! Found #{@feed.articles.count} articles."
      rescue => e
        @feed.update(active: false)
        redirect_to admin_feed_path(@feed), alert: "Feed created but parsing failed: #{e.message}. Feed has been marked as inactive."
      end
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @feed.update(feed_params)
      redirect_to admin_feed_path(@feed), notice: "Feed '#{@feed.name}' updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    feed_name = @feed.name
    articles_count = @feed.articles.count
    @feed.destroy

    redirect_to admin_feeds_path, notice: "Feed '#{feed_name}' and #{articles_count} associated articles deleted successfully."
  end

  def refresh
    FeedRefreshJob.perform_later(@feed.id)
    redirect_to admin_feed_path(@feed), notice: "Feed refresh queued for '#{@feed.name}'. Check back in a few moments."
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

## 🎨 **Step 8: Admin Views (Simple Rails HTML)**

### Admin Layout
```erb
<!-- app/views/layouts/admin.html.erb -->
<!DOCTYPE html>
<html>
  <head>
    <title>Columbus Quest - Admin</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
      .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
      .header { border-bottom: 2px solid #ddd; margin-bottom: 20px; padding-bottom: 10px; }
      .nav { margin-bottom: 20px; }
      .nav a { margin-right: 15px; padding: 8px 15px; background: #007cba; color: white; text-decoration: none; border-radius: 4px; }
      .nav a:hover { background: #005a87; }
      .btn { padding: 8px 15px; background: #28a745; color: white; text-decoration: none; border-radius: 4px; border: none; cursor: pointer; }
      .btn-danger { background: #dc3545; }
      .btn-warning { background: #ffc107; color: black; }
      .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
      .table th { background: #f8f9fa; }
      .form-group { margin-bottom: 15px; }
      .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
      .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
      .alert { padding: 15px; margin-bottom: 20px; border-radius: 4px; }
      .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
      .alert-danger { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      .stats { display: flex; gap: 20px; margin-bottom: 20px; }
      .stat-card { background: #e9ecef; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Columbus Quest - RSS Admin</h1>
      </div>

      <div class="nav">
        <%= link_to "Feeds", admin_feeds_path %>
        <%= link_to "Back to Main App", root_path %>
      </div>

      <% flash.each do |type, message| %>
        <div class="alert alert-<%= type == 'notice' ? 'success' : 'danger' %>">
          <%= message %>
        </div>
      <% end %>

      <%= yield %>
    </div>
  </body>
</html>
```

### Feeds Index View
```erb
<!-- app/views/admin/feeds/index.html.erb -->
<div class="stats">
  <div class="stat-card">
    <h3><%= @feeds.count %></h3>
    <p>Total Feeds</p>
  </div>
  <div class="stat-card">
    <h3><%= @active_feeds_count %></h3>
    <p>Active Feeds</p>
  </div>
  <div class="stat-card">
    <h3><%= @total_articles_count %></h3>
    <p>Total Articles</p>
  </div>
</div>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
  <h2>RSS Feeds</h2>
  <div>
    <%= link_to "Refresh All Feeds", refresh_all_api_v1_feeds_path, method: :post, class: "btn btn-warning" %>
    <%= link_to "Add New Feed", new_admin_feed_path, class: "btn" %>
  </div>
</div>

<table class="table">
  <thead>
    <tr>
      <th>Name</th>
      <th>URL</th>
      <th>Articles</th>
      <th>Last Fetched</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <% @feeds.each do |feed| %>
      <tr>
        <td><%= link_to feed.name, admin_feed_path(feed) %></td>
        <td><%= truncate(feed.url, length: 50) %></td>
        <td><%= feed.articles_count %></td>
        <td>
          <% if feed.last_fetched_at %>
            <%= time_ago_in_words(feed.last_fetched_at) %> ago
          <% else %>
            Never
          <% end %>
        </td>
        <td>
          <span style="color: <%= feed.active? ? 'green' : 'red' %>;">
            <%= feed.active? ? 'Active' : 'Inactive' %>
          </span>
        </td>
        <td>
          <%= link_to "View", admin_feed_path(feed), class: "btn" %>
          <%= link_to "Edit", edit_admin_feed_path(feed), class: "btn btn-warning" %>
          <%= link_to "Delete", admin_feed_path(feed), method: :delete,
                      confirm: "Are you sure? This will delete all #{feed.articles_count} articles.",
                      class: "btn btn-danger" %>
        </td>
      </tr>
    <% end %>
  </tbody>
</table>

<% if @feeds.empty? %>
  <p style="text-align: center; margin: 40px 0;">
    No feeds configured yet. <%= link_to "Add the first feed", new_admin_feed_path, class: "btn" %>
  </p>
<% end %>
```

### Feed Form Partial
```erb
<!-- app/views/admin/feeds/_form.html.erb -->
<%= form_with model: [:admin, @feed], local: true do |form| %>
  <% if @feed.errors.any? %>
    <div class="alert alert-danger">
      <h4><%= pluralize(@feed.errors.count, "error") %> prohibited this feed from being saved:</h4>
      <ul>
        <% @feed.errors.full_messages.each do |message| %>
          <li><%= message %></li>
        <% end %>
      </ul>
    </div>
  <% end %>

  <div class="form-group">
    <%= form.label :name %>
    <%= form.text_field :name, placeholder: "e.g. Atlas Obscura" %>
  </div>

  <div class="form-group">
    <%= form.label :url, "RSS Feed URL" %>
    <%= form.url_field :url, placeholder: "https://www.atlasobscura.com/feeds/latest" %>
  </div>

  <div class="form-group">
    <%= form.label :description %>
    <%= form.text_area :description, rows: 3, placeholder: "Optional description of this feed" %>
  </div>

  <div class="form-group">
    <%= form.label :refresh_interval, "Refresh Interval (seconds)" %>
    <%= form.number_field :refresh_interval, min: 300, step: 300, placeholder: "3600" %>
    <small>Minimum 300 seconds (5 minutes)</small>
  </div>

  <div class="form-group">
    <%= form.check_box :active %>
    <%= form.label :active, "Active (automatically refresh this feed)" %>
  </div>

  <div>
    <%= form.submit class: "btn" %>
    <%= link_to "Cancel", admin_feeds_path, class: "btn btn-warning" %>
  </div>
<% end %>
```

---

## 🛣️ **Step 9: Update Routes**

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :quests do
        member do
          post 'check_in/:checkpoint_id', to: 'quests#check_in'
        end
      end

      get 'leaderboard', to: 'leaderboard#index'

      # RSS Feed routes
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

  # Admin routes
  namespace :admin do
    resources :feeds do
      member do
        post :refresh
      end
    end

    root 'feeds#index'
  end

  root 'pwa#index'
  get '*path', to: 'pwa#index'
end
```

---

## 📊 **Step 10: Database Seeds (Auto-add Atlas Obscura)**

```ruby
# db/seeds.rb

# Clear existing data in development
if Rails.env.development?
  puts "Clearing existing RSS data..."
  ReadStatus.delete_all
  Article.delete_all
  Feed.delete_all
end

# Create Atlas Obscura feed
puts "Creating Atlas Obscura feed..."
atlas_feed = Feed.find_or_create_by!(url: "https://www.atlasobscura.com/feeds/latest") do |feed|
  feed.name = "Atlas Obscura"
  feed.description = "Curious and wondrous travel destinations and stories from around the world"
  feed.active = true
  feed.refresh_interval = 3600 # 1 hour
end

puts "Atlas Obscura feed created: #{atlas_feed.name}"

# Fetch initial articles
puts "Fetching initial articles from Atlas Obscura..."
begin
  atlas_feed.fetch_and_parse!
  puts "Successfully fetched #{atlas_feed.articles.count} articles from Atlas Obscura"
rescue => e
  puts "Warning: Could not fetch initial articles: #{e.message}"
  puts "You can refresh the feed manually from the admin interface at /admin"
end

# Create some additional sample feeds (optional)
if Rails.env.development?
  puts "Creating additional sample feeds for development..."

  sample_feeds = [
    {
      name: "History.com",
      url: "https://www.history.com/rss",
      description: "Historical articles and stories"
    },
    {
      name: "Smithsonian Magazine - History",
      url: "https://www.smithsonianmag.com/rss/history/",
      description: "History articles from Smithsonian Magazine"
    }
  ]

  sample_feeds.each do |feed_data|
    begin
      feed = Feed.find_or_create_by!(url: feed_data[:url]) do |f|
        f.name = feed_data[:name]
        f.description = feed_data[:description]
        f.active = true
        f.refresh_interval = 7200 # 2 hours
      end
      puts "Created sample feed: #{feed.name}"
    rescue => e
      puts "Warning: Could not create feed #{feed_data[:name]}: #{e.message}"
    end
  end
end

puts ""
puts "RSS feed setup complete!"
puts "- Visit /admin to manage feeds"
puts "- Visit /api/v1/articles to see the API"
puts "- The frontend will be available at /news (once implemented)"
puts ""
```

---

## 🎨 **Step 11: Frontend React Components**

### Update App.js to include News route
```javascript
// src/App.js - Add import and route
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

// In the Routes section, add:
<Route path="/news" element={<News />} />
<Route path="/news/:id" element={<NewsDetail />} />
```

### Update Navigation
```javascript
// src/components/MedievalNavbar.js - Add news to navItems
const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/quests', label: 'Quest Board', icon: Scroll },
  { path: '/news', label: 'Chronicles', icon: BookOpen }, // Add BookOpen import
  { path: '/map', label: 'Map', icon: Map },
  { path: '/progress', label: 'Progress', icon: BarChart3 },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy }
];
```

### News API Service
```javascript
// src/services/newsApi.js
const API_BASE = process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:3001/api/v1';

class NewsAPI {
  async getArticles(page = 1, search = '', perPage = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (search) {
      params.append('search', search);
    }

    const response = await fetch(`${API_BASE}/articles?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  }

  async getArticle(id) {
    const response = await fetch(`${API_BASE}/articles/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return response.json();
  }

  async markAsRead(id) {
    const response = await fetch(`${API_BASE}/articles/${id}/mark_as_read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to mark article as read');
    }
    return response.json();
  }

  async getFeeds() {
    const response = await fetch(`${API_BASE}/feeds`);
    if (!response.ok) {
      throw new Error('Failed to fetch feeds');
    }
    return response.json();
  }

  async refreshFeed(feedId) {
    const response = await fetch(`${API_BASE}/feeds/${feedId}/refresh`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to refresh feed');
    }
    return response.json();
  }
}

export const newsApi = new NewsAPI();
```

### News Article Card Component
```javascript
// src/components/NewsArticleCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, ExternalLink, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from './MedievalCard';

const NewsArticleCard = ({
  article,
  onRead,
  onViewDetails,
  delay = 0
}) => {
  const { isDarkMode } = useTheme();

  const handleCardClick = () => {
    if (!article.read) {
      onRead(article.id);
    }
    onViewDetails(article.id);
  };

  return (
    <motion.div
      className="news-article-card cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      onClick={handleCardClick}
    >
      <MedievalCard
        variant="parchment"
        elevation="medium"
        className={`p-6 h-full transition-all duration-300 ${
          article.read ? 'opacity-75' : ''
        }`}
      >
        {/* Read Status Indicator */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span
              style={{
                color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)'
              }}
            >
              {article.feed.name}
            </span>
          </div>

          {article.read && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <CheckCircle
                className="w-5 h-5 text-emerald-600"
                fill="currentColor"
              />
            </motion.div>
          )}
        </div>

        {/* Article Image */}
        {article.image_url && (
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Title */}
        <h3
          className={`text-xl font-bold mb-3 line-clamp-2 ${
            article.read ? 'opacity-70' : ''
          }`}
          style={{
            color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
            fontFamily: 'serif'
          }}
        >
          {article.title}
        </h3>

        {/* Article Description */}
        <p
          className="text-sm mb-4 line-clamp-3 leading-relaxed opacity-80"
          style={{
            color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
            fontStyle: 'italic'
          }}
        >
          {article.description}
        </p>

        {/* Article Meta */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            {article.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{article.author}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{article.formatted_date}</span>
            </div>

            {article.reading_time > 0 && (
              <div className="flex items-center gap-1">
                <span>{article.reading_time} min read</span>
              </div>
            )}
          </div>

          <ExternalLink className="w-3 h-3 opacity-50" />
        </div>

        {/* Decorative Border */}
        <div
          className="mt-4 h-px w-full rounded-full opacity-30"
          style={{
            background: `rgb(var(--accent-color))`
          }}
        />
      </MedievalCard>
    </motion.div>
  );
};

export default NewsArticleCard;
```

---

## ⏭️ **Next Steps Summary**

### What I've Documented So Far:

1. ✅ **Complete Database Schema** - 3 tables with proper indexes and relationships
2. ✅ **Rails Models** - Full validation, scopes, and business logic
3. ✅ **RSS Parsing Service** - Robust parsing with error handling
4. ✅ **Background Jobs** - Automated feed refreshing
5. ✅ **API Controllers** - RESTful endpoints with pagination and search
6. ✅ **Admin Interface** - Simple Rails views for feed management
7. ✅ **Database Seeds** - Auto-setup Atlas Obscura feed
8. ✅ **Frontend Architecture** - React components and API service
9. ✅ **Routes Configuration** - Complete routing setup

### Still Need to Implement:

10. 🔄 **News Page Component** (main listing)
11. 🔄 **News Detail Page** (full article view)
12. 🔄 **Search Component** (with debouncing)
13. 🔄 **Pagination Component** (medieval themed)
14. 🔄 **Integration & Testing**

**Would you like me to continue with the remaining frontend components and complete the implementation?**

The current documentation provides you with complete knowledge to explain:
- Database design decisions and PostgreSQL full-text search
- Service-oriented architecture with background jobs
- RESTful API design with proper error handling
- Session-based read tracking implementation
- Admin interface for feed management
- RSS parsing and content extraction strategies

This gives you excellent talking points for your interview! 🏛️