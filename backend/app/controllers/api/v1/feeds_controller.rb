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