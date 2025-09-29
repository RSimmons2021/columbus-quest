class Article < ApplicationRecord
  belongs_to :feed
  has_many :read_statuses, dependent: :destroy

  validates :title, presence: true
  validates :url, presence: true
  validates :guid, presence: true, uniqueness: true

  scope :recent, -> { order(published_at: :desc, created_at: :desc) }
  scope :published_after, ->(date) { where('published_at > ?', date) }

  # PostgreSQL full-text search
  scope :search, ->(query) {
    where("to_tsvector('english', title || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')) @@ plainto_tsquery('english', ?)", query)
  }

  def read_by?(session_id)
    read_statuses.exists?(user_session_id: session_id)
  end

  def mark_as_read!(session_id)
    read_statuses.find_or_create_by!(user_session_id: session_id) do |rs|
      rs.read_at = Time.current
    end
  end

  def preview_text(limit = 200)
    return description.truncate(limit) if description.present?
    content&.truncate(limit) || ""
  end
end