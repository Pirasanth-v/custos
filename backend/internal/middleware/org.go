package middleware

import (
    "context"
    "net/http"
    "log/slog"

    "github.com/go-chi/chi/v5"
    "github.com/pirasanth-v/custos/internal/repository"
    response "github.com/pirasanth-v/custos/pkg"
    
)

const (
    OrgIDKey   contextKey = "org_id"
    MemberKey  contextKey = "org_member"
    RoleKey    contextKey = "member_role"
)

type OrgMiddleware struct {
    memberRepo *repository.OrganizationMemberRepository
    roleRepo *repository.RoleRepository
}

func NewOrgMiddleware(memberRepo *repository.OrganizationMemberRepository, roleRepo *repository.RoleRepository) *OrgMiddleware {
    return &OrgMiddleware{
        memberRepo: memberRepo,
        roleRepo: roleRepo,
    }
}

// ValidateOrgAccess checks if the user is a member of the organization before allowing access.
func (m *OrgMiddleware) ValidateOrgAccess(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // 1. Extract orgID from URL parameters.
        orgID := chi.URLParam(r, "orgId")
        if orgID == "" {
            response.Error(w, http.StatusBadRequest, "missing org id")
            return
        }

        // 2. Extract userID from context. Must be set by authentication middleware.
        userID, ok := r.Context().Value(UserIDKey).(string)
        if !ok {
            response.Error(w, http.StatusUnauthorized, "unauthorized")
            return
        }

        // 3. Check if user is a member of the organization.
        member, err := m.memberRepo.GetMember(r.Context(), orgID, userID)
        if err != nil {
            slog.Error("failed to get org membership", "error", err)
            response.Error(w, http.StatusForbidden, "access denied")
            return
        }
        if member == nil {
            // Not a member
            response.Error(w, http.StatusForbidden, "access denied")
            return
        }

        // 4. Get role of member
        role, err := m.roleRepo.GetRoleByID(r.Context(), member.RoleID)
        if err != nil {
            slog.Error("failed to get role", "error", err)
            response.Error(w, http.StatusInternalServerError, "internal server error") 
            return
        }

        // 5. Attach orgID and member to context for downstream handlers.
        ctx := context.WithValue(r.Context(), OrgIDKey, orgID)
        ctx = context.WithValue(ctx, MemberKey, member)
        ctx = context.WithValue(ctx, RoleKey, role)

        // 6. Continue with the request using the new context.
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}