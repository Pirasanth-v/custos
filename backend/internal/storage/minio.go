package storage

import (
    "context"
    "fmt"
    "net/url"
    "time"

    "github.com/minio/minio-go/v7"
    "github.com/minio/minio-go/v7/pkg/credentials"
)

type MinIOClient struct {
    client     *minio.Client
    bucket     string
    publicHost string // used when building presigned URLs for external access
}

type PresignedUploadResult struct {
    UploadURL string
    ObjectKey string
}

func NewMinIOClient(endpoint, accessKey, secretKey, bucket string, useSSL bool, publicHost string) (*MinIOClient, error) {
    client, err := minio.New(endpoint, &minio.Options{
        Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
        Secure: useSSL,
    })
    if err != nil {
        return nil, fmt.Errorf("create minio client: %w", err)
    }
    return &MinIOClient{
        client:     client,
        bucket:     bucket,
        publicHost: publicHost,
    }, nil
}

// EnsureBucket creates the bucket if it doesn't exist. Call once on startup.
func (m *MinIOClient) EnsureBucket(ctx context.Context) error {
    exists, err := m.client.BucketExists(ctx, m.bucket)
    if err != nil {
        return fmt.Errorf("check bucket: %w", err)
    }
    if !exists {
        if err := m.client.MakeBucket(ctx, m.bucket, minio.MakeBucketOptions{}); err != nil {
            return fmt.Errorf("create bucket: %w", err)
        }
    }
    return nil
}

// PresignedPutURL generates a time-limited URL the browser uses to PUT a file.
// objectKey is the full path like "bills/org-uuid/tx-uuid/uuid-filename.pdf"
func (m *MinIOClient) PresignedPutURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
    presignedURL, err := m.client.PresignedPutObject(ctx, m.bucket, objectKey, expiry)
    if err != nil {
        return "", fmt.Errorf("presign put url: %w", err)
    }

    // In local dev, MinIO endpoint is "localhost:9000" and that's fine.
    // In production, replace with your public MinIO domain.
    return presignedURL.String(), nil
}

// PresignedGetURL generates a time-limited URL to view/download a file.
func (m *MinIOClient) PresignedGetURL(ctx context.Context, objectKey string, expiry time.Duration) (string, error) {
    reqParams := url.Values{}
    presignedURL, err := m.client.PresignedGetObject(ctx, m.bucket, objectKey, expiry, reqParams)
    if err != nil {
        return "", fmt.Errorf("presign get url: %w", err)
    }
    return presignedURL.String(), nil
}

// DeleteObject permanently removes a file from MinIO.
func (m *MinIOClient) DeleteObject(ctx context.Context, objectKey string) error {
    err := m.client.RemoveObject(ctx, m.bucket, objectKey, minio.RemoveObjectOptions{})
    if err != nil {
        return fmt.Errorf("delete object %s: %w", objectKey, err)
    }
    return nil
}

// ObjectExists checks whether a key actually exists in MinIO.
// Use this to validate that the browser actually finished uploading.
func (m *MinIOClient) ObjectExists(ctx context.Context, objectKey string) (bool, error) {
    _, err := m.client.StatObject(ctx, m.bucket, objectKey, minio.StatObjectOptions{})
    if err != nil {
        // MinIO SDK wraps not-found as an error response code
        if minio.ToErrorResponse(err).Code == "NoSuchKey" {
            return false, nil
        }
        return false, fmt.Errorf("stat object: %w", err)
    }
    return true, nil
}