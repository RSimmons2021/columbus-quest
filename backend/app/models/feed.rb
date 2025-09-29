class Feed < ApplicationRecord
  has_many :articles, dependent: :destroy

  validates :name, presence: true
  validates :url, presence: true, uniqueness: true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :refresh_interval, numericality: { greater_than: 300 } # Min 5 minutes

  scope :active, -> { where(active: true) }

  def needs_refresh?
    last_fetched_at.nil? || last_fetched_at < refresh_interval.seconds.ago
  end

  def fetch_and_parse!
    FeedParserService.new(self).call
    update!(last_fetched_at: Time.current)
  end
end