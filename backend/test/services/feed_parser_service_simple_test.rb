require "test_helper"
require "ostruct"

class FeedParserServiceSimpleTest < ActiveSupport::TestCase
  def setup
    @feed = Feed.create!(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )

    @service = FeedParserService.new(@feed)
  end

  test "should initialize with a feed" do
    assert_equal @feed, @service.instance_variable_get(:@feed)
  end

  test "should handle extract_content method with different RSS item types" do
    # Create a mock RSS item
    mock_item = OpenStruct.new(
      content_encoded: "Full content",
      content: "Fallback content",
      description: "Description content"
    )

    content = @service.send(:extract_content, mock_item)
    assert_equal "Full content", content
  end

  test "should handle extract_content method with missing content_encoded" do
    mock_item = OpenStruct.new(
      content: "Fallback content",
      description: "Description content"
    )

    content = @service.send(:extract_content, mock_item)
    assert_equal "Fallback content", content
  end

  test "should handle extract_content method with only description" do
    mock_item = OpenStruct.new(
      description: "Description content"
    )

    content = @service.send(:extract_content, mock_item)
    assert_equal "Description content", content
  end

  test "should extract author from RSS item" do
    mock_item = OpenStruct.new(
      author: "Test Author"
    )

    author = @service.send(:extract_author, mock_item)
    assert_equal "Test Author", author
  end

  test "should extract author from dc_creator when author is missing" do
    mock_item = OpenStruct.new(
      dc_creator: "DC Creator"
    )

    author = @service.send(:extract_author, mock_item)
    assert_equal "DC Creator", author
  end

  test "should return nil when no author information available" do
    mock_item = OpenStruct.new

    author = @service.send(:extract_author, mock_item)
    assert_nil author
  end

  test "should extract published date from pubDate" do
    test_time = Time.current
    mock_item = OpenStruct.new(
      pubDate: test_time
    )

    published_at = @service.send(:extract_published_date, mock_item)
    assert_equal test_time, published_at
  end

  test "should extract published date from date when pubDate is missing" do
    test_time = Time.current
    mock_item = OpenStruct.new(
      date: test_time
    )

    published_at = @service.send(:extract_published_date, mock_item)
    assert_equal test_time, published_at
  end

  test "should return current time when no date information available" do
    mock_item = OpenStruct.new

    published_at = @service.send(:extract_published_date, mock_item)
    assert_in_delta Time.current, published_at, 5.seconds
  end

  test "should extract image URL from description HTML" do
    mock_item = OpenStruct.new(
      description: '<p>Some content <img src="https://example.com/image.jpg" alt="test"> more content</p>'
    )

    image_url = @service.send(:extract_image_url, mock_item)
    assert_equal "https://example.com/image.jpg", image_url
  end

  test "should return nil when no image found in description" do
    mock_item = OpenStruct.new(
      description: '<p>Some content without images</p>'
    )

    image_url = @service.send(:extract_image_url, mock_item)
    assert_nil image_url
  end

  test "should handle missing description when extracting image" do
    mock_item = OpenStruct.new

    image_url = @service.send(:extract_image_url, mock_item)
    assert_nil image_url
  end
end