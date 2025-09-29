require "test_helper"
require "rss"

class FeedParserServiceTest < ActiveSupport::TestCase
  def setup
    @feed = Feed.create!(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )

    @service = FeedParserService.new(@feed)

    # Mock RSS content
    @mock_rss_content = <<~RSS
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <description>A test RSS feed</description>
          <link>https://example.com</link>
          <item>
            <title>Test Article 1</title>
            <description>This is the first test article</description>
            <link>https://example.com/article/1</link>
            <guid>article-1-guid</guid>
            <pubDate>#{Time.current.rfc2822}</pubDate>
            <author>Test Author</author>
          </item>
          <item>
            <title>Test Article 2</title>
            <description><![CDATA[This is the second test article with <img src="https://example.com/image.jpg" alt="test">]]></description>
            <link>https://example.com/article/2</link>
            <guid>article-2-guid</guid>
            <pubDate>#{1.hour.ago.rfc2822}</pubDate>
          </item>
        </channel>
      </rss>
    RSS
  end

  test "should parse RSS feed and create articles" do
    @service.stub :fetch_rss_content, @mock_rss_content do
      assert_difference 'Article.count', 2 do
        @service.call
      end
    end

    articles = Article.all.order(:created_at)

    # Check first article
    first_article = articles.first
    assert_equal "Test Article 1", first_article.title
    assert_equal "This is the first test article", first_article.description
    assert_equal "https://example.com/article/1", first_article.url
    assert_equal "article-1-guid", first_article.guid
    assert_equal "Test Author", first_article.author

    # Check second article
    second_article = articles.second
    assert_equal "Test Article 2", second_article.title
    assert_includes second_article.description, "This is the second test article"
    assert_equal "https://example.com/article/2", second_article.url
    assert_equal "article-2-guid", second_article.guid
  end

  test "should not create duplicate articles with same GUID" do
    @service.stub :fetch_rss_content, @mock_rss_content do
      # Parse once
      @service.call
      assert_equal 2, Article.count

      # Parse again - should not create duplicates
      assert_no_difference 'Article.count' do
        @service.call
      end
    end
  end

  test "should extract image URL from description" do
    rss_with_image = <<~RSS
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <item>
            <title>Article with Image</title>
            <description><![CDATA[Article content <img src="https://example.com/test-image.jpg" alt="test image"> more content]]></description>
            <link>https://example.com/article</link>
            <guid>article-with-image</guid>
            <pubDate>#{Time.current.rfc2822}</pubDate>
          </item>
        </channel>
      </rss>
    RSS

    @service.stub :fetch_rss_content, rss_with_image do
      @service.call
    end

    article = Article.first
    assert_equal "https://example.com/test-image.jpg", article.image_url
  end

  test "should handle RSS parsing errors gracefully" do
    invalid_rss = "This is not valid RSS content"

    @service.stub :fetch_rss_content, invalid_rss do
      assert_raises(RSS::Error) do
        @service.call
      end
    end
  end

  test "should handle network errors gracefully" do
    @service.stub :fetch_rss_content, -> { raise StandardError.new("Network error") } do
      error = assert_raises(StandardError) do
        @service.call
      end
      assert_equal "Network error", error.message
    end
  end

  test "should use link as fallback GUID when GUID is missing" do
    rss_without_guid = <<~RSS
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <item>
            <title>Article without GUID</title>
            <description>Article content</description>
            <link>https://example.com/no-guid-article</link>
            <pubDate>#{Time.current.rfc2822}</pubDate>
          </item>
        </channel>
      </rss>
    RSS

    @service.stub :fetch_rss_content, rss_without_guid do
      @service.call
    end

    article = Article.first
    assert_equal "https://example.com/no-guid-article", article.guid
  end

  test "should set current time as fallback when published_at is missing" do
    rss_without_date = <<~RSS
      <?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0">
        <channel>
          <title>Test Feed</title>
          <item>
            <title>Article without date</title>
            <description>Article content</description>
            <link>https://example.com/no-date-article</link>
            <guid>no-date-guid</guid>
          </item>
        </channel>
      </rss>
    RSS

    freeze_time = Time.current
    Time.stub :current, freeze_time do
      @service.stub :fetch_rss_content, rss_without_date do
        @service.call
      end
    end

    article = Article.first
    assert_in_delta freeze_time, article.published_at, 1.second
  end

  test "fetch_rss_content should set user agent" do
    uri_double = Minitest::Mock.new
    uri_double.expect :open, @mock_rss_content, ['User-Agent' => 'Columbus Quest RSS Reader/1.0']
    uri_double.expect :read, @mock_rss_content

    URI.stub :open, uri_double do
      content = @service.send(:fetch_rss_content)
      assert_equal @mock_rss_content, content
    end

    uri_double.verify
  end

  private

  def freeze_time
    Time.current
  end
end