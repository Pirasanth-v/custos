package model

import ( "time" )

type Currency struct {
	ID        string  `json:"id"`
	Code      string  `json:"code"`
	Name      string  `json:"name"`
	Symbol    *string `json:"symbol,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}