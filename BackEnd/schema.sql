-- schema.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Paused',
    budget NUMERIC(10, 2) NOT NULL,
    spend NUMERIC(10, 2) DEFAULT 0,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    conversions INT DEFAULT 0,
    deleted_at TIMESTAMP NULL, -- For Soft Delete
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    campaign_id INT REFERENCES campaigns(id),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dummy User For Login
-- Password is 'password123' hashed with bcrypt
INSERT INTO users (email, password) 
VALUES ('admin@agency.com', '$2a$10$wY.D9U.N8w8M5G8HqK0c..2iXj2.QvB/6U6l2oB9Xy2yUo5E2XG');


-- Alert Rules Table (Configurable thresholds per campaign)
CREATE TABLE alert_rules (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id),
    metric VARCHAR(50) NOT NULL,
    operator VARCHAR(10) NOT NULL,
    threshold NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Alert Rules
INSERT INTO alert_rules (campaign_id, metric, operator, threshold) VALUES
(1, 'spend_percentage', '>', 90),
(1, 'ctr', '<', 1),
(2, 'spend_percentage', '>', 90),
(2, 'ctr', '<', 1);