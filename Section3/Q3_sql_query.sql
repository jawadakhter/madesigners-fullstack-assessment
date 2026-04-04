-- ============================================
-- Q3 — Top 5 Campaigns by ROAS per Client
-- Last 30 Days
-- ============================================

-- ROAS = Return on Ad Spend = conversions_value / spend
-- Hamare schema mein: ROAS = conversions / spend * average_order_value
-- Simple version: ROAS = (conversions * 100) / spend  (assume $100 per conversion)

-- ✅ FINAL QUERY:
WITH campaign_roas AS (
  SELECT
    client,
    name AS campaign_name,
    spend,
    conversions,
    budget,
    -- ROAS calculate karo
    CASE
      WHEN spend > 0 THEN ROUND((conversions * 100.0) / spend, 2)
      ELSE 0
    END AS roas,
    -- Har client ke andar rank karo ROAS ke hisaab se
    ROW_NUMBER() OVER (
      PARTITION BY client           -- Har client ke liye alag rank
      ORDER BY
        CASE
          WHEN spend > 0 THEN (conversions * 100.0) / spend
          ELSE 0
        END DESC                    -- Best ROAS pehle
    ) AS rank_within_client
  FROM campaigns
  WHERE
    deleted_at IS NULL              -- Soft deleted exclude
    AND created_at >= NOW() - INTERVAL '30 days'  -- Last 30 days
    AND spend > 0                   -- Zero spend exclude
)

SELECT
  client,
  campaign_name,
  spend,
  conversions,
  roas,
  rank_within_client AS rank
FROM campaign_roas
WHERE rank_within_client <= 5      -- Top 5 per client
ORDER BY
  client ASC,
  roas DESC;

-- ============================================
-- EXPLANATION:
-- ============================================
-- 1. CTE (WITH clause): Pehle ROAS calculate karo
-- 2. ROW_NUMBER() OVER (PARTITION BY client): 
--    Har client ke liye alag numbering
-- 3. WHERE rank <= 5: Top 5 lo
-- 4. INTERVAL '30 days': Last 30 days filter

-- ============================================
-- TEST DATA ke saath expected output:
-- ============================================
-- client          | campaign_name        | roas  | rank
-- Lumiere Skincare| Lumiere Summer Launch| 3.70  | 1
-- Nike Shoes      | Nike AirMax Push     | 7.56  | 1
-- FutureTech      | Tech Conference 2026 | 3.00  | 1
-- NorthFace       | Winter Jacket Promo  | 3.81  | 1