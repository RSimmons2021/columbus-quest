class FeedParserService
  require 'rss'
  require 'open-uri'

  def initialize(feed)
    @feed = feed
  end

  def call
    rss_content = fetch_rss_content
    parsed_feed = RSS::Parser.parse(rss_content)

    parsed_feed.items.each do |item|
      create_or_update_article(item)
    end

    Rails.logger.info "Parsed #{parsed_feed.items.count} items from #{@feed.name}"
  rescue => e
    Rails.logger.error "Failed to parse feed #{@feed.name}: #{e.message}"
    raise e
  end

  private

  def fetch_rss_content
    URI.open(@feed.url, 'User-Agent' => 'Columbus Quest RSS Reader/1.0').read
  end

  def create_or_update_article(item)
    # Handle different GUID formats
    guid = item.guid.respond_to?(:content) ? item.guid.content : item.guid
    guid ||= item.link

    Article.find_or_create_by!(guid: guid) do |article|
      article.feed = @feed
      article.title = item.title.to_s
      article.description = item.description.to_s if item.description
      article.content = extract_content(item)
      article.url = item.link.to_s
      article.image_url = extract_image_url(item)
      article.author = extract_author(item)
      article.published_at = extract_published_date(item)
    end
  end

  def extract_content(item)
    # Try different content fields that RSS feeds might use
    content = item.content_encoded if item.respond_to?(:content_encoded)
    content ||= item.content if item.respond_to?(:content)
    content ||= item.description if item.respond_to?(:description)
    content.to_s if content
  end

  def extract_author(item)
    return item.author.to_s if item.respond_to?(:author) && item.author
    return item.dc_creator.to_s if item.respond_to?(:dc_creator) && item.dc_creator
    nil
  end

  def extract_published_date(item)
    return item.pubDate if item.respond_to?(:pubDate) && item.pubDate
    return item.date if item.respond_to?(:date) && item.date
    Time.current
  end

  def extract_image_url(item)
    # Try different image sources
    return item.enclosure.url if item.enclosure&.type&.start_with?('image/')

    # Parse description for img tags
    if item.description
      img_match = item.description.to_s.match(/<img[^>]+src="([^"]+)"/i)
      return img_match[1] if img_match
    end

    nil
  end
end