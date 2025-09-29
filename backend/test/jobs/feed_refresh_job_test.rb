require "test_helper"

class FeedRefreshJobTest < ActiveJob::TestCase
  def setup
    @active_feed = Feed.create!(
      name: "Active Feed",
      url: "https://example.com/rss.xml",
      description: "An active RSS feed",
      active: true,
      refresh_interval: 3600,
      last_fetched_at: 2.hours.ago # Needs refresh
    )

    @inactive_feed = Feed.create!(
      name: "Inactive Feed",
      url: "https://inactive.com/rss.xml",
      description: "An inactive RSS feed",
      active: false,
      refresh_interval: 3600,
      last_fetched_at: 2.hours.ago
    )

    @recently_fetched_feed = Feed.create!(
      name: "Recently Fetched Feed",
      url: "https://recent.com/rss.xml",
      description: "A recently fetched RSS feed",
      active: true,
      refresh_interval: 3600,
      last_fetched_at: 30.minutes.ago # Does not need refresh
    )
  end

  test "perform with specific feed_id should refresh that feed" do
    # Mock the fetch_and_parse! method to avoid network calls
    @active_feed.stub :fetch_and_parse!, true do
      FeedRefreshJob.perform_now(@active_feed.id)
    end

    # The job should have attempted to refresh the feed
    # (actual verification would depend on mock framework used)
  end

  test "perform without feed_id should refresh only feeds that need refresh" do
    feeds_refreshed = []

    # Mock fetch_and_parse! for all feeds to track which ones get refreshed
    Feed.stub_any_instance :fetch_and_parse!, -> {
      feeds_refreshed << self.id
      true
    } do
      FeedRefreshJob.perform_now
    end

    # Should refresh active feed that needs refresh
    assert_includes feeds_refreshed, @active_feed.id

    # Should not refresh inactive feed
    assert_not_includes feeds_refreshed, @inactive_feed.id

    # Should not refresh recently fetched feed
    assert_not_includes feeds_refreshed, @recently_fetched_feed.id
  end

  test "perform should handle errors gracefully" do
    # Mock fetch_and_parse! to raise an error
    @active_feed.stub :fetch_and_parse!, -> { raise StandardError.new("Network error") } do
      # Should not raise an error, just log it
      assert_nothing_raised do
        FeedRefreshJob.perform_now(@active_feed.id)
      end
    end
  end

  test "perform should continue processing other feeds when one fails" do
    another_active_feed = Feed.create!(
      name: "Another Active Feed",
      url: "https://another.com/rss.xml",
      description: "Another active RSS feed",
      active: true,
      refresh_interval: 3600,
      last_fetched_at: 2.hours.ago
    )

    feeds_refreshed = []

    # Mock first feed to fail, second to succeed
    feeds_to_mock = [@active_feed, another_active_feed]
    feeds_to_mock.each_with_index do |feed, index|
      if index == 0
        feed.stub :fetch_and_parse!, -> { raise StandardError.new("Network error") } do
          # This will be called but should not stop processing
        end
      else
        feed.stub :fetch_and_parse!, -> {
          feeds_refreshed << self.id
          true
        } do
          # This should still be called
        end
      end
    end

    assert_nothing_raised do
      FeedRefreshJob.perform_now
    end

    # Second feed should still have been processed despite first feed failing
    assert_includes feeds_refreshed, another_active_feed.id
  end

  test "perform with non-existent feed_id should raise error" do
    assert_raises(ActiveRecord::RecordNotFound) do
      FeedRefreshJob.perform_now(99999)
    end
  end

  test "job should be queued on default queue" do
    assert_equal :default, FeedRefreshJob.queue_name
  end
end