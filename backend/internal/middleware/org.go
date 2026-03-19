package middleware

import (
    "context"
    "net/http"
    "log/slog"

    "github.com/go-chi/chi/v5"
    "github.com/pirasanth-v/custos/internal/repository"
)

const (
    OrgIDKey   contextKey = "org_id"
    MemberKey  contextKey = "org_member"
)

type OrgMiddleware struct {
    memberRepo *repository.OrganizationMemberRepository
}

// Constructor for OrgMiddleware
func NewOrgMiddleware(memberRepo *repository.OrganizationMemberRepository) *OrgMiddleware {
    return &OrgMiddleware{memberRepo: memberRepo}
}

// ValidateOrgAccess checks if the user is a member of the organization before allowing access.
func (m *OrgMiddleware) ValidateOrgAccess(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. Extract orgID from URL parameters.
        orgID := chi.URLParam(r, "orgId")
        if orgID == "" {
            http.Error(w, `{"error": "missing org id"}`, http.StatusBadRequest)
            return
        }

        // 2. Extract userID from context. Must be set by authentication middleware.
        userID, ok := r.Context().Value(UserIDKey).(string)
        if !ok {
            http.Error(w, `{"error": "unauthorized"}`, http.StatusUnauthorized)
            return
        }

        // 3. Check if user is a member of the organization.
        member, err := m.memberRepo.GetMember(r.Context(), orgID, userID)
        if err != nil {
            slog.Error("failed to get org membership", "error", err, "org_id", orgID, "user_id", userID)
            http.Error(w, `{"error": "access denied"}`, http.StatusForbidden)
            return
        }
        if member == nil {
            // Not a member
            http.Error(w, `{"error": "access denied"}`, http.StatusForbidden)
            return
        }

        // 4. Attach orgID and member to context for downstream handlers.
        ctx := context.WithValue(r.Context(), OrgIDKey, orgID)
        ctx = context.WithValue(ctx, MemberKey, member)

        // 5. Continue with the request using the new context.
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}