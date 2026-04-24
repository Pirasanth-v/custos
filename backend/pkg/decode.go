package pkg

import (
	"net/http"
	"log/slog"
	"encoding/json"
)

func Decode(w http.ResponseWriter, r *http.Request, receivingBody any) bool {
	defer func() {
		if err := r.Body.Close(); err != nil {
			slog.Error("Decode: failed to close request body", "error", err)
		}
	}()
	err := json.NewDecoder(r.Body).Decode(receivingBody)
	if err != nil {
		slog.Error("Decode: failed to decode JSON", "error", err)
		Error(w, http.StatusBadRequest, "invalid request body")
		return false
	}
	return true
}