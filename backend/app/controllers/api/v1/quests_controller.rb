class Api::V1::QuestsController < ApplicationController
  before_action :authenticate_user!
  before_action :find_quest, only: [:show, :check_in]

  def index
    @quests = Quest.where(active: true).includes(:checkpoints)
    render json: @quests.map { |quest| quest_with_progress(quest) }
  end

  def show
    render json: quest_with_progress(@quest)
  end

  def check_in
    checkpoint_id = params[:checkpoint_id]

    # Find the checkpoint for this quest
    checkpoint = @quest.checkpoints.find_by(id: checkpoint_id)

    if checkpoint.nil?
      render json: { error: "Invalid checkpoint for this quest" }, status: :bad_request
      return
    end

    # Use transaction to prevent race conditions
    ActiveRecord::Base.transaction do
      # Check if user already checked in here
      existing_tracker = Tracker.find_by(user: current_user, checkpoint: checkpoint)

      if existing_tracker
        render json: { message: "Already checked in here!" }, status: :ok
        return
      end

      # Create the check-in
      tracker = Tracker.create!(
        user: current_user,
        checkpoint: checkpoint
      )

      # Check if quest is complete
      quest_complete = @quest.completed_by?(current_user)

      render json: {
        message: "Checked in successfully!",
        points_earned: @quest.points_per_checkpoint,
        quest_completed: quest_complete,
        checkpoint: checkpoint.name,
        total_points: current_user.total_points
      }
    end
  rescue ActiveRecord::RecordNotUnique
    render json: { message: "Already checked in here!" }, status: :ok
  end

  private

  def find_quest
    @quest = Quest.find(params[:id])
  end

  def quest_with_progress(quest)
    user_checkpoints = Tracker.where(user: current_user, checkpoint: quest.checkpoints).pluck(:checkpoint_id)

    {
      id: quest.id,
      name: quest.name,
      description: quest.description,
      points_per_checkpoint: quest.points_per_checkpoint,
      total_checkpoints: quest.checkpoints.count,
      completed_checkpoints: user_checkpoints.count,
      is_completed: quest.completed_by?(current_user),
      checkpoints: quest.checkpoints.map do |checkpoint|
        {
          id: checkpoint.id,
          name: checkpoint.name,
          description: checkpoint.description,
          order_number: checkpoint.order_number,
          visited: user_checkpoints.include?(checkpoint.id)
        }
      end
    }
  end
end