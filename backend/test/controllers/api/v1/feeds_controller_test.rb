require "test_helper"

class Api::V1::FeedsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @active_feed = Feed.create!(
      name: "Active Feed",
      url: "https://active.com/rss.xml",
      description: "An active RSS feed",
      active: true,
      refresh_interval: 3600,
      last_fetched_at: 1.hour.ago
    )

    @inactive_feed = Feed.create!(
      name: "Inactive Feed",
      url: "https://inactive.com/rss.xml",
      description: "An inactive RSS feed",
      active: false,
      refresh_interval: 3600,
      last_fetched_at: 2.hours.ago
    )
  end

  test "index should return only active feeds" do
    get api_v1_feeds_path

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 1, json_response.length

    feed_data = json_response.first
    assert_equal @active_feed.id, feed_data['id']
    assert_equal @active_feed.name, feed_data['name']
    assert_equal @active_feed.description, feed_data['description']
    assert feed_data.key?('last_fetched_at')

    # Should not include inactive feed
    feed_ids = json_response.map { |feed| feed['id'] }
    assert_not_includes feed_ids, @inactive_feed.id
  end

  test "index should order feeds by name" do
    z_feed = Feed.create!(
      name: "Z Feed",
      url: "https://zfeed.com/rss.xml",
      description: "Z feed description",
      active: true,
      refresh_interval: 3600
    )

    a_feed = Feed.create!(
      name: "A Feed",
      url: "https://afeed.com/rss.xml",
      description: "A feed description",
      active: true,
      refresh_interval: 3600
    )

    get api_v1_feeds_path

    assert_response :success
    json_response = JSON.parse(response.body)

    # Should be ordered alphabetically
    feed_names = json_response.map { |feed| feed['name'] }
    assert_equal ['A Feed', 'Active Feed', 'Z Feed'], feed_names
  end

  test "refresh should queue job for specific feed" do
    # Mock the job to avoid actual RSS fetching in tests
    assert_enqueued_with(job: FeedRefreshJob, args: [@active_feed.id]) do
      post refresh_api_v1_feed_path(@active_feed)
    end

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_includes json_response['message'], @active_feed.name
    assert_equal @active_feed.id, json_response['feed_id']
  end

  test "refresh should return 404 for non-existent feed" do
    post refresh_api_v1_feed_path(99999)

    assert_response :not_found
  end

  test "refresh_all should queue job for all feeds" do
    assert_enqueued_with(job: FeedRefreshJob) do
      post refresh_all_api_v1_feeds_path
    end

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal "All active feeds queued for refresh", json_response['message']
  end
end