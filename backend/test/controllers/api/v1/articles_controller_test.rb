require "test_helper"

class Api::V1::ArticlesControllerTest < ActionDispatch::IntegrationTest
  def setup
    @feed = Feed.create!(
      name: "Test Feed",
      url: "https://example.com/rss.xml",
      description: "A test RSS feed",
      active: true,
      refresh_interval: 3600
    )

    @article1 = Article.create!(
      feed: @feed,
      title: "First Article",
      description: "This is the first article description",
      content: "Full content of the first article",
      url: "https://example.com/article/1",
      image_url: "https://example.com/image1.jpg",
      author: "Author One",
      published_at: 2.hours.ago,
      guid: "article-1-guid"
    )

    @article2 = Article.create!(
      feed: @feed,
      title: "Second Article with Search Term",
      description: "This article contains medieval keywords for testing search",
      content: "Full content about medieval times and castles",
      url: "https://example.com/article/2",
      image_url: "https://example.com/image2.jpg",
      author: "Author Two",
      published_at: 1.hour.ago,
      guid: "article-2-guid"
    )
  end

  test "index should return articles with pagination" do
    get api_v1_articles_path

    assert_response :success
    json_response = JSON.parse(response.body)

    assert json_response.key?('articles')
    assert json_response.key?('pagination')

    articles = json_response['articles']
    assert_equal 2, articles.length

    # Check article structure
    article = articles.first
    assert article.key?('id')
    assert article.key?('title')
    assert article.key?('description')
    assert article.key?('url')
    assert article.key?('image_url')
    assert article.key?('author')
    assert article.key?('published_at')
    assert article.key?('feed_name')
    assert article.key?('read')

    # Check pagination structure
    pagination = json_response['pagination']
    assert pagination.key?('current_page')
    assert pagination.key?('total_pages')
    assert pagination.key?('total_count')
    assert pagination.key?('per_page')
    assert pagination.key?('has_next')
    assert pagination.key?('has_prev')

    assert_equal 1, pagination['current_page']
    assert_equal 2, pagination['total_count']
    assert_equal 10, pagination['per_page']
    assert_equal false, pagination['has_next']
    assert_equal false, pagination['has_prev']
  end

  test "index should order articles by recent first" do
    get api_v1_articles_path

    assert_response :success
    json_response = JSON.parse(response.body)
    articles = json_response['articles']

    # More recent article should come first
    assert_equal @article2.title, articles.first['title']
    assert_equal @article1.title, articles.second['title']
  end

  test "index should support pagination parameters" do
    get api_v1_articles_path, params: { page: 1, per_page: 1 }

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 1, json_response['articles'].length
    assert_equal 1, json_response['pagination']['current_page']
    assert_equal 2, json_response['pagination']['total_pages']
    assert_equal true, json_response['pagination']['has_next']
    assert_equal false, json_response['pagination']['has_prev']
  end

  test "index should support search functionality" do
    get api_v1_articles_path, params: { search: 'medieval' }

    assert_response :success
    json_response = JSON.parse(response.body)

    # Only the article with 'medieval' in description should be returned
    assert_equal 1, json_response['articles'].length
    assert_equal @article2.title, json_response['articles'].first['title']
  end

  test "index should support feed filtering" do
    another_feed = Feed.create!(
      name: "Another Feed",
      url: "https://another.com/rss.xml",
      description: "Another test feed",
      active: true,
      refresh_interval: 3600
    )

    another_article = Article.create!(
      feed: another_feed,
      title: "Article from Another Feed",
      url: "https://another.com/article",
      guid: "another-article-guid",
      published_at: Time.current
    )

    get api_v1_articles_path, params: { feed_id: @feed.id }

    assert_response :success
    json_response = JSON.parse(response.body)

    # Should only return articles from the specified feed
    assert_equal 2, json_response['articles'].length
    json_response['articles'].each do |article_data|
      # Find the actual article to check its feed
      article = Article.find(article_data['id'])
      assert_equal @feed.id, article.feed.id
    end
  end

  test "index should limit per_page to maximum of 50" do
    get api_v1_articles_path, params: { per_page: 100 }

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 50, json_response['pagination']['per_page']
  end

  test "show should return specific article details" do
    get api_v1_article_path(@article1)

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal @article1.id, json_response['id']
    assert_equal @article1.title, json_response['title']
    assert_equal @article1.description, json_response['description']
    assert_equal @article1.content, json_response['content']
    assert_equal @article1.url, json_response['url']
    assert_equal @article1.image_url, json_response['image_url']
    assert_equal @article1.author, json_response['author']

    # Check feed information
    assert json_response.key?('feed')
    assert_equal @feed.id, json_response['feed']['id']
    assert_equal @feed.name, json_response['feed']['name']

    # Check read status
    assert json_response.key?('read')
    assert_equal false, json_response['read'] # Should be false initially
  end

  test "show should return 404 for non-existent article" do
    get api_v1_article_path(99999)

    assert_response :not_found
  end

  test "mark_as_read should update read status" do
    patch mark_as_read_api_v1_article_path(@article1)

    assert_response :success
    json_response = JSON.parse(response.body)

    assert_equal 'Article marked as read', json_response['message']
    assert_equal true, json_response['read']
  end

  test "mark_as_read should return 404 for non-existent article" do
    patch mark_as_read_api_v1_article_path(99999)

    assert_response :not_found
  end

  # Note: Session-based read tracking tests would require session setup
  # For now, these tests verify the API structure works correctly
end