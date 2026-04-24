package model

import ( "time" )

type Organization struct {
	Id         string     `json:"id"`
	Name       string     `json:"name"`
	Email      string     `json:"email"`
	Address    *string    `json:"address"`
	CreatedBy  string     `json:"created_by"`
	IsPersonal bool	      `json:"is_personal"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	DeletedAt  *time.Time `json:"deleted_at"`
}