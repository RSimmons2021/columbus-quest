require "test_helper"

class FeedTest < ActiveSupport::TestCase
  def setup
    @feed = Feed.new(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )
  end

  test "should be valid with valid attributes" do
    assert @feed.valid?
  end

  test "should require name" do
    @feed.name = nil
    assert_not @feed.valid?
    assert_includes @feed.errors[:name], "can't be blank"
  end

  test "should require url" do
    @feed.url = nil
    assert_not @feed.valid?
    assert_includes @feed.errors[:url], "can't be blank"
  end

  test "should require unique url" do
    @feed.save!
    duplicate_feed = Feed.new(
      name: "Another Feed",
      url: @feed.url,
      description: "Another test feed",
      active: true,
      refresh_interval: 3600
    )
    assert_not duplicate_feed.valid?
    assert_includes duplicate_feed.errors[:url], "has already been taken"
  end

  test "should validate url format" do
    @feed.url = "invalid-url"
    assert_not @feed.valid?
    assert_includes @feed.errors[:url], "is invalid"
  end

  test "should require minimum refresh interval" do
    @feed.refresh_interval = 100
    assert_not @feed.valid?
    assert_includes @feed.errors[:refresh_interval], "must be greater than 300"
  end

  test "should have active scope" do
    active_feed = Feed.create!(
      name: "Active Feed",
      url: "https://active.com/rss.xml",
      description: "Active feed",
      active: true,
      refresh_interval: 3600
    )

    inactive_feed = Feed.create!(
      name: "Inactive Feed",
      url: "https://inactive.com/rss.xml",
      description: "Inactive feed",
      active: false,
      refresh_interval: 3600
    )

    active_feeds = Feed.active
    assert_includes active_feeds, active_feed
    assert_not_includes active_feeds, inactive_feed
  end

  test "needs_refresh? should return true when never fetched" do
    @feed.last_fetched_at = nil
    assert @feed.needs_refresh?
  end

  test "needs_refresh? should return true when refresh interval passed" do
    @feed.last_fetched_at = 2.hours.ago
    @feed.refresh_interval = 3600 # 1 hour
    assert @feed.needs_refresh?
  end

  test "needs_refresh? should return false when within refresh interval" do
    @feed.last_fetched_at = 30.minutes.ago
    @feed.refresh_interval = 3600 # 1 hour
    assert_not @feed.needs_refresh?
  end

  test "should destroy associated articles when destroyed" do
    @feed.save!
    article = @feed.articles.create!(
      title: "Test Article",
      url: "https://example.com/article",
      guid: "test-guid-123",
      published_at: Time.current
    )

    assert_difference 'Article.count', -1 do
      @feed.destroy
    end
  end
end