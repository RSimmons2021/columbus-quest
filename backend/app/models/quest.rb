class Quest < ApplicationRecord
  has_many :checkpoints, dependent: :destroy
  has_many :trackers, dependent: :destroy
  has_many :users, through: :trackers

  validates :name, presence: true
  validates :description, presence: true
  validates :points_per_checkpoint, presence: true, numericality: { greater_than: 0 }

  def total_possible_points
    checkpoints.count * points_per_checkpoint
  end

  def completed_by?(user)
    user_checkpoints = trackers.where(user: user).pluck(:checkpoint_id)
    required_checkpoints = checkpoints.pluck(:id)
    (required_checkpoints - user_checkpoints).empty?
  end
end