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