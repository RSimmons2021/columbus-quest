class User < ApplicationRecord
  has_secure_password

  has_many :trackers, dependent: :destroy
  has_many :quests, through: :trackers

  validates :email, presence: true, uniqueness: true
  validates :username, presence: true, uniqueness: true

  def total_points
    trackers.sum(:points_earned)
  end

  def completed_quests
    trackers.where(completed: true).includes(:quest)
  end
end