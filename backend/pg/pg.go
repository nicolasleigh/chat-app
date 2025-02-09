package pg

import (
	"context"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5/pgxpool"
)

type postgres struct {
	db *pgxpool.Pool
}

var (
	pgInstance *postgres
	pgOnce     sync.Once
)

// https://donchev.is/post/working-with-postgresql-in-go-using-pgx/
func NewPG(ctx context.Context, connString string) (*postgres, error) {
	var conerr error
	pgOnce.Do(func() {
		db, err := pgxpool.New(ctx, connString)
		if err != nil {
			conerr = fmt.Errorf("unable to create connection pool: %w", err)
		}

		pgInstance = &postgres{db}
	})
	if conerr != nil {
		return nil, conerr
	}

	return pgInstance, nil
}

func (pg *postgres) Ping(ctx context.Context) error {
	return pg.db.Ping(ctx)
}

func (pg *postgres) Close() {
	pg.db.Close()
}
