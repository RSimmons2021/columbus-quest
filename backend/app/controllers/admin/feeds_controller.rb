class Admin::FeedsController < ApplicationController
  before_action :set_feed, only: [:show, :update, :destroy]

  def index
    @feeds = Feed.all.order(:name)
    render json: @feeds.as_json(
      only: [:id, :name, :url, :description, :active, :refresh_interval, :last_fetched_at, :created_at],
      include: {
        articles: {
          only: [:id, :title, :published_at],
          methods: [:preview_text]
        }
      }
    )
  end

  def show
    render json: @feed.as_json(
      only: [:id, :name, :url, :description, :active, :refresh_interval, :last_fetched_at, :created_at],
      include: {
        articles: {
          only: [:id, :title, :description, :url, :author, :published_at, :created_at],
          methods: [:preview_text]
        }
      }
    )
  end

  def create
    @feed = Feed.new(feed_params)

    if @feed.save
      # Test the feed immediately
      begin
        @feed.fetch_and_parse!
        render json: {
          feed: @feed,
          message: 'Feed created and parsed successfully!'
        }, status: :created
      rescue => e
        @feed.update(active: false)
        render json: {
          feed: @feed,
          message: "Feed created but parsing failed: #{e.message}"
        }, status: :created
      end
    else
      render json: {
        errors: @feed.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def update
    if @feed.update(feed_params)
      render json: {
        feed: @feed,
        message: 'Feed updated successfully.'
      }
    else
      render json: {
        errors: @feed.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @feed.destroy
    render json: {
      message: 'Feed deleted successfully.'
    }
  end

  private

  def set_feed
    @feed = Feed.find(params[:id])
  end

  def feed_params
    params.require(:feed).permit(:name, :url, :description, :active, :refresh_interval)
  end
end