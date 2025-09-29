class ApplicationController < ActionController::API
  include ActionController::Cookies

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last

    if token
      begin
        decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: 'HS256' })
        @current_user = User.find(decoded_token[0]['user_id'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { error: 'Invalid token' }, status: :unauthorized
      end
    else
      render json: { error: 'No token provided' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
