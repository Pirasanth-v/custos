package ratelimit

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// Store holds per-IP limiters. One Store instance per rate-limit tier.
type Store struct {
	mu       sync.Mutex
	visitors map[string]*visitor
	r        rate.Limit // tokens per second
	burst    int
}

func NewStore(reqsPerMinute int, burst int) *Store {
	s := &Store{
		visitors: make(map[string]*visitor),
		r:        rate.Limit(float64(reqsPerMinute) / 60.0), // convert to per-second
		burst:    burst,
	}
	go s.cleanup()
	return s
}

func (s *Store) Burst() int { return s.burst }

func (s *Store) Allow(ip string) bool {
	return s.getLimiter(ip).Allow()
}

func (s *Store) getLimiter(ip string) *rate.Limiter {
	s.mu.Lock()
	defer s.mu.Unlock()

	v, ok := s.visitors[ip]
	if !ok {
		l := rate.NewLimiter(s.r, s.burst)
		s.visitors[ip] = &visitor{limiter: l, lastSeen: time.Now()}
		return l
	}
	v.lastSeen = time.Now()
	return v.limiter
}

// cleanup removes stale entries every 5 minutes to prevent memory growth.
func (s *Store) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.mu.Lock()
		for ip, v := range s.visitors {
			if time.Since(v.lastSeen) > 10*time.Minute {
				delete(s.visitors, ip)
			}
		}
		s.mu.Unlock()
	}
}

// GetIP extracts the real client IP, respecting Railway's X-Forwarded-For proxy header.
func GetIP(r *http.Request) string {
	// Railway sets X-Forwarded-For reliably
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Format: "client, proxy1, proxy2" — take the first
		parts := strings.SplitN(xff, ",", 2)
		if ip := strings.TrimSpace(parts[0]); ip != "" {
			return ip
		}
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}