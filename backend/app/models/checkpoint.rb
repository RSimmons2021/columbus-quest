class Checkpoint < ApplicationRecord
  belongs_to :quest
  has_many :trackers, dependent: :destroy

  validates :name, presence: true
  validates :latitude, presence: true, numericality: true
  validates :longitude, presence: true, numericality: true

  def visited_by?(user)
    trackers.exists?(user: user)
  end
end