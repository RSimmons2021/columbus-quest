require "test_helper"

class ReadStatusTest < ActiveSupport::TestCase
  def setup
    @feed = Feed.create!(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )

    @article = Article.create!(
      feed: @feed,
      title: "Test Article",
      url: "https://example.com/article",
      guid: "test-guid-123",
      published_at: Time.current
    )

    @read_status = ReadStatus.new(
      article: @article,
      user_session_id: "session-123",
      read_at: Time.current
    )
  end

  test "should be valid with valid attributes" do
    assert @read_status.valid?
  end

  test "should require article" do
    @read_status.article = nil
    assert_not @read_status.valid?
    assert_includes @read_status.errors[:article], "must exist"
  end

  test "should require user_session_id" do
    @read_status.user_session_id = nil
    assert_not @read_status.valid?
    assert_includes @read_status.errors[:user_session_id], "can't be blank"
  end

  test "should require read_at" do
    @read_status.read_at = nil
    assert_not @read_status.valid?
    assert_includes @read_status.errors[:read_at], "can't be blank"
  end

  test "should require unique article_id and user_session_id combination" do
    @read_status.save!

    duplicate_read_status = ReadStatus.new(
      article: @article,
      user_session_id: @read_status.user_session_id,
      read_at: Time.current
    )

    assert_not duplicate_read_status.valid?
    assert_includes duplicate_read_status.errors[:article_id], "has already been taken"
  end

  test "should allow same article to be read by different sessions" do
    @read_status.save!

    another_session_read = ReadStatus.new(
      article: @article,
      user_session_id: "session-456",
      read_at: Time.current
    )

    assert another_session_read.valid?
  end

  test "should allow same session to read different articles" do
    @read_status.save!

    another_article = Article.create!(
      feed: @feed,
      title: "Another Article",
      url: "https://example.com/article/2",
      guid: "test-guid-456",
      published_at: Time.current
    )

    another_article_read = ReadStatus.new(
      article: another_article,
      user_session_id: @read_status.user_session_id,
      read_at: Time.current
    )

    assert another_article_read.valid?
  end
end