from flask import current_app
from google.auth.exceptions import GoogleAuthError
from google.oauth2 import id_token
from google.auth.transport import requests
from app.models import User, Student
from app.extensions import db
from flask_jwt_extended import create_access_token

class AuthService:

  @staticmethod
  def _available_google_username(preferred_username):
    base_username = preferred_username.strip()[:90] or "google_user"
    candidate = base_username
    suffix = 2

    while User.query.filter_by(username=candidate).first():
      candidate = f"{base_username}_{suffix}"
      suffix += 1

    return candidate

  @staticmethod
  def google_auth(token):
    google_client_id = current_app.config["GOOGLE_CLIENT_ID"]

    if not google_client_id:
      raise RuntimeError("Google OAuth is not configured")

    # Google Identity Services returns an OAuth 2.0 ID token, not a
    # Firebase Authentication token.
    try:
      id_info = id_token.verify_oauth2_token(
        token, requests.Request(), google_client_id
      )
    except (ValueError, GoogleAuthError) as exc:
      current_app.logger.warning(
        "Google ID token verification failed: %s",
        exc
      )
      raise ValueError("Invalid Google credential") from exc

    if not id_info.get("email") or not id_info.get("sub"):
      raise ValueError("Google credential is missing required account information")

    if not id_info.get("email_verified", False):
      raise ValueError("Google account email is not verified")

    email = id_info["email"].strip().lower()
    google_id = id_info["sub"]
    avatar = id_info.get("picture", "")
    name = id_info.get("name", "")
    default_username = name if name else email.split("@")[0]

    # Find the Google identity and email separately so an accidental conflict
    # cannot link two existing accounts together.
    user_by_google_id = User.query.filter_by(google_id=google_id).first()
    user_by_email = User.query.filter_by(email=email).first()

    if (
      user_by_google_id
      and user_by_email
      and user_by_google_id.id != user_by_email.id
    ):
      raise ValueError("Google account conflicts with an existing user")

    user = user_by_google_id or user_by_email

    try:
      if not user:
        user = User(
          email=email,
          username=AuthService._available_google_username(default_username),
          google_id=google_id,
          role="student",
          avatar_url=avatar
        )
        db.session.add(user)
        db.session.flush()

        student = Student(
            user_id=user.id,
            enrollment_status="Enrolled"
        )

        db.session.add(student)
        db.session.commit()

      elif not user.google_id:
        user.google_id = google_id
        db.session.commit()
    except Exception:
      db.session.rollback()
      raise

    if not user.is_active:
      raise PermissionError("Account is deactivated")
    
    # issue the jwt token
    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "username": user.username}
      )

    return {
      "access_token": access_token,
      "user": user.to_dict()
    }

  @staticmethod
  def login_user(email, password):
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
      raise ValueError("Invalid Email or Password")

    if not user.is_active:
      raise PermissionError("Account is deactivated")

    access_token = create_access_token(
      identity=str(user.id),
      additional_claims={"role": user.role, "username": user.username}
    )

    return {
      "token": access_token,
      "user": user.to_dict()
    }

  @staticmethod
  def register_user(username, email, password):

    existing_user = User.query.filter(
      (User.email == email) | (User.username == username)
    ).first()

    if existing_user:
      raise ValueError("Username or email already exist")

    try:
      new_user = User(
        username=username,
        email=email,
        password=password
      )

      db.session.add(new_user)
      db.session.flush()

      new_student = Student(
            user_id=new_user.id,
            enrollment_status="Enrolled"
        )

      db.session.add(new_student)
      db.session.commit()

      return new_user
    except Exception:
      db.session.rollback()
      raise

  @staticmethod
  def get_current_user(user_id):
    user = db.session.get(User, user_id)

    if not user or not user.is_active:
      raise ValueError("User not found or inactive")

    return user
