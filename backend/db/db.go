package db

import (
	"context"
	"database/sql"
	"time"
)

func New(dsn string, maxOpenConns, maxIdleConns int, maxIdleTime string) (*sql.DB, error) {
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}

	duration, err := time.ParseDuration(maxIdleTime)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(maxOpenConns)
	db.SetMaxIdleConns(maxIdleConns)
	db.SetConnMaxIdleTime(duration)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err = db.PingContext(ctx); err != nil {
		// When your program exits then any open connection is closed,
		// it does not stay open somewhere in the ether awaiting your program to start again,
		// so do not worry about the connections "growing" when you CTRL-C your app,
		// so you don't necessarily have to Close the connection.
		db.Close()
		return nil, err
	}

	return db, nil
}
