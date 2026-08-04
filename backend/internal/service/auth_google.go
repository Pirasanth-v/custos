package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/pirasanth-v/custos/internal/model"
	"google.golang.org/api/idtoken"
)

func VerifyGoogleToken(ctx context.Context, idToken, clientID string) (*model.GoogleUser, error) {
	payload, err := idtoken.Validate(ctx, idToken, clientID)
	if err != nil {
		return nil, fmt.Errorf("invalid google token: %w", err)
	}

	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	picture, _ := payload.Claims["picture"].(string)
	emailVerified, _ := payload.Claims["email_verified"].(bool)

	if !emailVerified {
		return nil, fmt.Errorf("google email not verified")
	}

	uniqueID := uuid.New().String()

	return &model.GoogleUser{
		GoogleID: payload.Subject, // Google's unique user ID
		UserID:   uniqueID,        // Primary key in the db
		Email:    email,
		Name:     name,
		Picture:  picture,
	}, nil
}

func (s *AuthService) LoginWithGoogle(ctx context.Context, gUser *model.GoogleUser) (string, error) {
	if gUser == nil {
		return "", errors.New("invalid google user")
	}

	isNewUser := false

	// 1. Find user by google_id.
	user, err := s.userRepo.GetByGoogleID(ctx, gUser.GoogleID)
	if err != nil {
		// Only fall back to email lookup when google_id isn't found.
		if err.Error() != "user not found" {
			return "", err
		}

		// 2. If email exists, link google_id; otherwise create a new user.
		existing, emailErr := s.userRepo.GetUserByEmail(ctx, gUser.Email)
		if emailErr == nil {
			if err := s.userRepo.LinkGoogleID(ctx, existing.Id, gUser.GoogleID); err != nil {
				return "", fmt.Errorf("failed to link google id to user: %w", err)
			}
			user = &existing
		} else {
			user, err = s.userRepo.CreateFromGoogle(ctx, gUser)
			if err != nil {
				return "", fmt.Errorf("failed to create user from google: %w", err)
			}
			isNewUser = true
		}
	}

	// 3. Create session/token (same flow as Login()).
	sessionToken := uuid.New().String()
	sessionID := uuid.New().String()
	sessionExpiry := time.Now().Add(time.Duration(s.cfg.SessionExpiryHours) * time.Hour)

	hash := sha256.Sum256([]byte(sessionToken))
	hashedSessionToken := hex.EncodeToString(hash[:])

	session := &model.Session{
		ID:        sessionID,
		UserID:    user.Id,
		TokenHash: hashedSessionToken,
		ExpiresAt: sessionExpiry,
	}

	if err := s.sessionRepo.CreateSession(ctx, *session); err != nil {
		return "", fmt.Errorf("failed to create session: %w", err)
	}

	// Only create personal org for brand new users
	if isNewUser {
		tx, err := s.db.Begin(ctx)
		if err != nil {
			return "", fmt.Errorf("failed to begin transaction: %w", err)
		}
		defer func() { _ = tx.Rollback(ctx) }()

		orgRepo := s.orgRepo.WithTx(tx)
		memberRepo := s.memberRepo.WithTx(tx)

		orgID := uuid.New().String()
		org := model.Organization{
			Id:         orgID,
			Name:       user.FirstName + "'s Personal",
			IsPersonal: true,
			CreatedBy:  user.Id,
		}
		if err := orgRepo.CreateOrganization(ctx, org); err != nil {
			return "", fmt.Errorf("failed to create organization: %w", err)
		}

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
			return "", fmt.Errorf("failed to add owner: %w", err)
		}

		if err := tx.Commit(ctx); err != nil {
			return "", fmt.Errorf("failed to commit transaction: %w", err)
		}
	}

	return sessionToken, nil
}
