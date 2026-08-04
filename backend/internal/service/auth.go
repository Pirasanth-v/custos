package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	Config "github.com/pirasanth-v/custos/internal/config"
	"github.com/pirasanth-v/custos/internal/dto"
	"github.com/pirasanth-v/custos/internal/model"
	"github.com/pirasanth-v/custos/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo    *repository.UserRepository
	orgRepo     *repository.OrganizationRepository
	memberRepo  *repository.OrganizationMemberRepository
	sessionRepo *repository.SessionRepository
	cfg         Config.SecurityConfig
	db          *pgxpool.Pool
}

func NewAuthService(
	userRepo *repository.UserRepository,
	sessionRepo *repository.SessionRepository,
	orgRepo *repository.OrganizationRepository,
	memberRepo *repository.OrganizationMemberRepository,
	cfg Config.SecurityConfig,
	db *pgxpool.Pool,
) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		orgRepo:     orgRepo,
		memberRepo:  memberRepo,
		sessionRepo: sessionRepo,
		cfg:         cfg,
		db:          db,
	}
}

// Register a new user
func (s *AuthService) Register(ctx context.Context, req *dto.RegisterRequest) error {
	// begin transaction
	tx, err := s.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// tx-scoped repos
	userRepo := s.userRepo.WithTx(tx)
	orgRepo := s.orgRepo.WithTx(tx)
	memberRepo := s.memberRepo.WithTx(tx)

	// check email inside transaction
	exists, err := userRepo.IsEmailExists(ctx, req.Email)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("email already used")
	}

	// hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), s.cfg.BcryptCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// create user
	user := model.User{
		Id:           uuid.New().String(),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}
	if err := userRepo.CreateUser(ctx, user); err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	// create personal org
	orgID := uuid.New().String()
	org := model.Organization{
		Id:         orgID,
		Name:       req.FirstName + "'s Personal",
		IsPersonal: true,
		CreatedBy:  user.Id,
	}
	if err := orgRepo.CreateOrganization(ctx, org); err != nil {
		return fmt.Errorf("failed to create organization: %w", err)
	}

	// add user as owner
	now := time.Now().UTC()
	member := model.OrganizationMember{
		OrgID:    orgID,
		UserID:   user.Id,
		RoleID:   model.RoleOwnerID,
		Status:   "active",
		AddedBy:  &user.Id,
		JoinedAt: &now,
	}
	if err := memberRepo.AddMember(ctx, member); err != nil {
		return fmt.Errorf("failed to add owner: %w", err)
	}

	return tx.Commit(ctx)
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
