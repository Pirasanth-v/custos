package service

import (
	"context"
	"errors"
	"time"
	"fmt"
	"crypto/sha256"
	"encoding/hex"

	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/dto"
	Config "github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/model"
	"golang.org/x/crypto/bcrypt"
	"github.com/google/uuid"
)

type AuthService struct {
	userRepo *repository.UserRepository
	sessionRepo *repository.SessionRepository
	cfg Config.SecurityConfig
}

func NewAuthService(userRepo *repository.UserRepository, sessionRepo *repository.SessionRepository, cfg Config.SecurityConfig) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		sessionRepo: sessionRepo,
		cfg: cfg,
	}
}

// Register a new user
func (s *AuthService) Register(ctx context.Context, req *dto.RegisterRequest) error {
	// Check whether email already used or not
	exists, err := s.userRepo.IsEmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already used")
	}

	// Hashed the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.cfg.BcryptCost)
	if err != nil {
		return fmt.Errorf("failed to hash password %w", err)
	}

	// Build user model
	user := &model.User{
		Id: uuid.New().String(),
		FirstName: req.FirstName,
		LastName: req.LastName,
		Email: req.Email,
		PasswordHash: string(hashedPassword),
	}
	
	// Insert into DB
	if err := s.userRepo.CreateUser(ctx, *user); err != nil {
		return fmt.Errorf("failed to create user %w", err)
	}

	return nil
}

func (s *AuthService) Login(ctx context.Context, req *dto.LoginRequest) (string, error) {
	// 1. Verify Email exists
	user, err := s.userRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if err.Error() == "user not found" {
			return "", errors.New("invalid email")
		}
		return "", err
	}

	// 2. Verify the password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return "", errors.New("invalid password")
	}

	// 3. Assign token, sessionid, expiry time
	sessionToken := uuid.New().String()
	sessionID := uuid.New().String()
	sessionExpiry := time.Now().Add(time.Duration(s.cfg.SessionExpiryHours) * time.Hour)

	// 4. Hash Token
	hash := sha256.Sum256([]byte(sessionToken))
	hashedSessionToken := hex.EncodeToString(hash[:])

	// Build session model
	session := &model.Session{
		ID:        sessionID,
		UserID:    user.Id,
		TokenHash: hashedSessionToken,
		ExpiresAt: sessionExpiry,
	}

	// 5. Create session in db
	if err := s.sessionRepo.CreateSession(ctx, *session); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	return sessionToken, nil
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	// Hash the provided token
	hash := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(hash[:])

	// Attempt to revoke the session in the repository
	if err := s.sessionRepo.RevokeSession(ctx, tokenHash); err != nil {
		return fmt.Errorf("failed to revoke session: %w", err)
	}

	return nil
}

func (s *AuthService) Me(ctx context.Context, userID string) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetUserById(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user by id: %w", err)
	}

	return user, nil
}