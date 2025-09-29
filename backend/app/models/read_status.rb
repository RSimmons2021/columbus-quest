class ReadStatus < ApplicationRecord
  belongs_to :article

  validates :user_session_id, presence: true
  validates :read_at, presence: true
  validates :article_id, uniqueness: { scope: :user_session_id }
end