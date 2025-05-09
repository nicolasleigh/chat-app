package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/clerk/clerk-sdk-go/v2"
	clerkhttp "github.com/clerk/clerk-sdk-go/v2/http"
)

func (app *application) NewServer() *http.Server {
	mux := app.NewRouter()
	errLog := slog.NewLogLogger(NewLog.Handler(), slog.LevelError)
	clerk.SetKey(os.Getenv("CLERK_KEY"))

	jwtExtractor := clerkhttp.AuthorizationJWTExtractor(func(r *http.Request) string {
		jwt := r.Header.Get("Sec-WebSocket-Protocol")
		return jwt
	})
	// wrap middlewares
	wrappedMux := app.enableCORS(clerkhttp.WithHeaderAuthorization(jwtExtractor)(mux))
	// wrappedMux := app.enableCORS(mux)

	srv := &http.Server{
		Addr:     fmt.Sprintf(":%d", app.config.port),
		Handler:  wrappedMux,
		ErrorLog: errLog,
	}
	return srv
}
