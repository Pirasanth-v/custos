package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/pirasanth-v/custos/internal/repository"
	"github.com/pirasanth-v/custos/internal/dto"
	Config "github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/model"
	"golang.org/x/crypto/bcrypt"
	"github.com/google/uuid"
)

type AuthService struct {
	userRepo *repository.UserRepository
	cfg Config.SecurityConfig
}

func NewAuthService(userRepo *repository.UserRepository, cfg Config.SecurityConfig) *AuthService {
	return &AuthService{
		userRepo: userRepo,
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