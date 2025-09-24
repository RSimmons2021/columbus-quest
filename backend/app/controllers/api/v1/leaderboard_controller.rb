class Api::V1::LeaderboardController < ApplicationController
  before_action :authenticate_user!

  def index
    # Get users with their total points, ordered by points desc
    leaderboard = User.joins(:trackers)
                     .joins("JOIN checkpoints ON checkpoints.id = trackers.checkpoint_id")
                     .joins("JOIN quests ON quests.id = checkpoints.quest_id")
                     .group("users.id")
                     .select("users.*, SUM(quests.points_per_checkpoint) as total_points")
                     .order("total_points DESC")
                     .limit(50)

    # Add ranking and current user position
    ranked_users = leaderboard.map.with_index(1) do |user, rank|
      {
        rank: rank,
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        total_points: user.total_points.to_i,
        is_current_user: user.id == current_user.id
      }
    end

    # Find current user's position if not in top 50
    current_user_rank = nil
    unless ranked_users.any? { |u| u[:is_current_user] }
      current_user_points = current_user.total_points
      users_above = User.joins(:trackers)
                       .joins("JOIN checkpoints ON checkpoints.id = trackers.checkpoint_id")
                       .joins("JOIN quests ON quests.id = checkpoints.quest_id")
                       .group("users.id")
                       .having("SUM(quests.points_per_checkpoint) > ?", current_user_points)
                       .count

      current_user_rank = {
        rank: users_above + 1,
        id: current_user.id,
        username: current_user.username,
        first_name: current_user.first_name,
        total_points: current_user_points,
        is_current_user: true
      }
    end

    render json: {
      leaderboard: ranked_users,
      current_user_position: current_user_rank
    }
  end
end