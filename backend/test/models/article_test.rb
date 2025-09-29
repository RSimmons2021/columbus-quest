require "test_helper"

class ArticleTest < ActiveSupport::TestCase
  def setup
    @feed = Feed.create!(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )

    @article = Article.new(
      feed: @feed,
      title: "Test Article",
      description: "This is a test article description that is longer than the preview limit to test truncation functionality properly.",
      content: "This is the full content of the test article with much more detail.",
      url: "https://example.com/article/1",
      image_url: "https://example.com/image.jpg",
      author: "Test Author",
      published_at: Time.current,
      guid: "test-guid-123"
    )
  end

  test "should be valid with valid attributes" do
    assert @article.valid?
  end

  test "should require title" do
    @article.title = nil
    assert_not @article.valid?
    assert_includes @article.errors[:title], "can't be blank"
  end

  test "should require url" do
    @article.url = nil
    assert_not @article.valid?
    assert_includes @article.errors[:url], "can't be blank"
  end

  test "should require guid" do
    @article.guid = nil
    assert_not @article.valid?
    assert_includes @article.errors[:guid], "can't be blank"
  end

  test "should require unique guid" do
    @article.save!
    duplicate_article = Article.new(
      feed: @feed,
      title: "Another Article",
      url: "https://example.com/article/2",
      guid: @article.guid,
      published_at: Time.current
    )
    assert_not duplicate_article.valid?
    assert_includes duplicate_article.errors[:guid], "has already been taken"
  end

  test "should require feed" do
    @article.feed = nil
    assert_not @article.valid?
    assert_includes @article.errors[:feed], "must exist"
  end

  test "recent scope should order by published_at desc" do
    old_article = Article.create!(
      feed: @feed,
      title: "Old Article",
      url: "https://example.com/old",
      guid: "old-guid",
      published_at: 1.day.ago
    )

    new_article = Article.create!(
      feed: @feed,
      title: "New Article",
      url: "https://example.com/new",
      guid: "new-guid",
      published_at: 1.hour.ago
    )

    recent_articles = Article.recent
    assert_equal new_article, recent_articles.first
    assert_equal old_article, recent_articles.second
  end

  test "published_after scope should filter by date" do
    old_article = Article.create!(
      feed: @feed,
      title: "Old Article",
      url: "https://example.com/old",
      guid: "old-guid",
      published_at: 2.days.ago
    )

    new_article = Article.create!(
      feed: @feed,
      title: "New Article",
      url: "https://example.com/new",
      guid: "new-guid",
      published_at: 1.hour.ago
    )

    filtered_articles = Article.published_after(1.day.ago)
    assert_includes filtered_articles, new_article
    assert_not_includes filtered_articles, old_article
  end

  test "preview_text should return description when present" do
    expected = @article.description.truncate(200)
    assert_equal expected, @article.preview_text
  end

  test "preview_text should return truncated content when description is blank" do
    @article.description = nil
    expected = @article.content.truncate(200)
    assert_equal expected, @article.preview_text
  end

  test "preview_text should return empty string when both description and content are blank" do
    @article.description = nil
    @article.content = nil
    assert_equal "", @article.preview_text
  end

  test "preview_text should respect custom limit" do
    expected = @article.description.truncate(50)
    assert_equal expected, @article.preview_text(50)
  end

  test "read_by? should return false when no read status exists" do
    @article.save!
    assert_not @article.read_by?("session-123")
  end

  test "read_by? should return true when read status exists" do
    @article.save!
    @article.read_statuses.create!(
      user_session_id: "session-123",
      read_at: Time.current
    )
    assert @article.read_by?("session-123")
  end

  test "mark_as_read! should create read status" do
    @article.save!

    assert_difference 'ReadStatus.count', 1 do
      @article.mark_as_read!("session-123")
    end

    assert @article.read_by?("session-123")
  end

  test "mark_as_read! should not create duplicate read status" do
    @article.save!
    @article.mark_as_read!("session-123")

    assert_no_difference 'ReadStatus.count' do
      @article.mark_as_read!("session-123")
    end

    assert @article.read_by?("session-123")
  end

  test "should destroy associated read statuses when destroyed" do
    @article.save!
    @article.read_statuses.create!(
      user_session_id: "session-123",
      read_at: Time.current
    )

    assert_difference 'ReadStatus.count', -1 do
      @article.destroy
    end
  end
end