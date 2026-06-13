-- ============================================================
-- STUDEX (Student Express) — Database Schema
-- PostgreSQL
-- ============================================================

-- ============================================================
-- Tabel Users
-- ============================================================
CREATE TABLE users (
    id                 SERIAL       PRIMARY KEY,
    name               VARCHAR(255) NOT NULL,
    email              VARCHAR(255) UNIQUE NOT NULL,
    google_id          VARCHAR(255) UNIQUE,
    profile_pic        TEXT,
    phone_number       VARCHAR(20),
    role               VARCHAR(50)  NOT NULL DEFAULT 'USER',   -- USER | DRIVER | ADMIN
    is_driver_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at         TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabel Driver Profiles
-- ============================================================
CREATE TABLE driver_profiles (
    id          SERIAL       PRIMARY KEY,
    user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ktm_url     TEXT         NOT NULL,
    qris_url    TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT FALSE,
    avg_rating  NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    total_trips INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================================
-- Tabel Orders
-- ============================================================
CREATE TABLE orders (
    id                SERIAL        PRIMARY KEY,
    user_id           INT           NOT NULL REFERENCES users(id),
    driver_id         INT           REFERENCES users(id),
    shop_name         VARCHAR(255)  NOT NULL,
    items_description JSONB         NOT NULL,
    -- Struktur wajib: [{"name": "...", "qty": 1, "note": "..."}]
    notes             TEXT,
    -- Pembayaran P2P face-to-face via QRIS; tidak ada kolom harga di sistem.
    status            VARCHAR(50)   NOT NULL DEFAULT 'MENCARI_DRIVER',
    -- MENCARI_DRIVER → DIPROSES_DRIVER → DALAM_PERJALANAN
    -- → DRIVER_SAMPAI → PESANAN_TIBA → COMPLETED
    -- (cabang cancel): MENCARI_DRIVER → CANCELLED
    cancelled_by      VARCHAR(20)   CHECK (cancelled_by IN ('USER', 'SYSTEM')),
    cancel_reason     TEXT,
    buyer_lat         NUMERIC(10,7) NOT NULL,
    buyer_lng         NUMERIC(10,7) NOT NULL,
    created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (
        status IN (
            'MENCARI_DRIVER',
            'DIPROSES_DRIVER',
            'DALAM_PERJALANAN',
            'DRIVER_SAMPAI',
            'PESANAN_TIBA',
            'COMPLETED',
            'CANCELLED'
        )
    ),
    CONSTRAINT cancelled_fields CHECK (
        (status = 'CANCELLED' AND cancelled_by IS NOT NULL)
        OR (status != 'CANCELLED' AND cancelled_by IS NULL)
    )
);

-- ============================================================
-- Tabel Ratings
-- ============================================================
CREATE TABLE ratings (
    id         SERIAL    PRIMARY KEY,
    order_id   INT       NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_user  INT       NOT NULL REFERENCES users(id),
    to_user    INT       NOT NULL REFERENCES users(id),
    score      SMALLINT  NOT NULL CHECK (score BETWEEN 1 AND 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, from_user)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_orders_driver_id  ON orders(driver_id);
CREATE INDEX idx_orders_user_id    ON orders(user_id);
CREATE INDEX idx_orders_updated_at ON orders(updated_at);
CREATE INDEX idx_users_google_id   ON users(google_id);

-- ============================================================
-- Function: auto-update updated_at on orders
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();
