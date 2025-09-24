class Tracker < ApplicationRecord
  belongs_to :user
  belongs_to :checkpoint

  has_one :quest, through: :checkpoint

  validates :user_id, uniqueness: { scope: :checkpoint_id }

  scope :recent, -> { order(created_at: :desc) }
end