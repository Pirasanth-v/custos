package dto

type CreateCategoryRequest struct {
	Name string `json:"name"`
}

type UpdateCategoryRequest struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}