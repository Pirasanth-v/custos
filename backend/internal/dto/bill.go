package dto

import "time"

// Request: browser asks for presigned URLs before uploading
type PresignBillsRequest struct {
    Files []PresignFileInput `json:"files" validate:"required,min=1,max=10"`
}

type PresignFileInput struct {
    FileName string `json:"file_name" validate:"required"`
    MimeType string `json:"mime_type" validate:"required"`
    FileSize int64  `json:"file_size_bytes" validate:"required,min=1,max=26214400"` // 25MB cap
}

// Response: the presigned URL + the objectKey browser must send back after upload
type PresignBillResult struct {
    UploadURL string `json:"upload_url"`
    ObjectKey string `json:"object_key"`
    FileName  string `json:"file_name"`
}

// Request: browser confirms which uploads completed
type ConfirmBillsRequest struct {
    Bills []ConfirmBillInput `json:"bills" validate:"required,min=1"`
}

type ConfirmBillInput struct {
    ObjectKey string `json:"object_key" validate:"required"`
    FileName  string `json:"file_name" validate:"required"`
    MimeType  string `json:"mime_type" validate:"required"`
    FileSize  int64  `json:"file_size_bytes" validate:"required"`
}

// Response: a bill record with a short-lived view URL
type BillResponse struct {
    ID            string    `json:"id"`
    TransactionID string    `json:"transaction_id"`
	OrgID		  string 	`json:"org_id"`
	UploadedBy    string    `json:"uploaded_by"`    // user id
	ObjectKey      string    `json:"view_url"`       // viewURL => presigned GET, valid 15 min
    FileName      string    `json:"file_name"`
    MimeType      string    `json:"mime_type"`
    FileSizeBytes int64     `json:"file_size_bytes"`
    CreatedAt     time.Time `json:"created_at"`
}

type BillStats struct {
    Total      int    `json:"total_bills"`
    Images     int    `json:"image_count"`
    PDFs       int    `json:"pdf_count"`
    TotalBytes int64  `json:"total_file_size_bytes"`
}