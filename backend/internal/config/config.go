package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	App AppConfig
	DB DBconfig
	Storage StorageConfig
	Security SecurityConfig 
}

type AppConfig struct {
	Env string
	Port string
} 

type DBconfig struct {
	User string
	Password string
	Host string
	Port string
	Name string
	SSLmode string
}

type StorageConfig struct {
	Endpoint string
	AccessKey string
	SecretKey string
	Bucket string
	useSSL bool
}

type SecurityConfig struct {
	TokenSecret string	// secret key for signing tokens
	BcryptCost int	// difficulty level for password hashing
	SessionExpiryHours int
}

func Load() (*Config, error) {

	if err := godotenv.Load(); err != nil {
		fmt.Fprintf(os.Stderr, "Warning: Error loading .env file: %v\n", err)
	}

	// initiate an empty config struct
	cfg := Config{}	
	var missing []string

	// helper for required variable
	require := func(key string) (string) {
		val := os.Getenv(key)
		if val == "" {
			missing = append(missing, key)
		}
		return val
	} 

	// helper for optional variable
	optional := func(key,backup string) string {
		val := os.Getenv(key)
		if val == "" {
			return backup
		}
		return val
	}

	cfg.App = AppConfig {
		Env: optional("APP_ENV", "development"),
		Port: optional("APP_PORT", "8080"),
	}

	cfg.DB = DBconfig {
		User: require("DB_USER"),
		Password: require("DB_PASSWORD"),
		Host: optional("DB_HOST", "localhost"),
		Name: require("DB_NAME"),
		Port: optional("DB_PORT", "5432"),
		SSLmode: optional("DB_SSLMODE", "disable") ,
	} 

	cfg.Storage = StorageConfig {
		Endpoint: require("STORAGE_ENDPOINT"),
		AccessKey: require("STORAGE_ACCESS_KEY"),
		SecretKey: require("STORAGE_SECRET_KEY"),
		Bucket: optional("STORAGE_BUCKET", "custos"),
		useSSL: os.Getenv("STORAGE_USE_SSL") == "true",
	}

	cfg.Security = SecurityConfig {
		TokenSecret: require("TOKEN_SECRET"),
		BcryptCost: 12,	// default value
		SessionExpiryHours: 48,
	}
	
	// override the default if it sets in .env
	cost:= os.Getenv("BCRYPT_COST")
	if cost != "" {
		cost_int, err := strconv.Atoi(cost)
		if err == nil {
			cfg.Security.BcryptCost = cost_int
		}
	}
	
	// overrides the default if it sets in .env
	expiry := os.Getenv("SESSION_EXPIRY_HOURS")
	if expiry != "" {
		expiry_int, err := strconv.Atoi(expiry)
		if err == nil {
			cfg.Security.SessionExpiryHours = expiry_int
		}
	}
	
	// fail fast, if any env vars are missing
	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required env varibales: %v", missing)
	}

	return &cfg, nil
}