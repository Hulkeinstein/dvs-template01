-- =============================================================================
-- Phase 1: Enhanced Orders Table for Checkout System
-- Date: 2025-09-28
-- Description: Add order number, idempotency, and atomic order creation
-- =============================================================================

-- Add new columns to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number VARCHAR(24) UNIQUE,
  ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON public.orders(user_id, status);

-- =============================================================================
-- RPC Function: Atomic Order Creation for Single Course
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_user_id UUID,
  p_course_id UUID,
  p_order_number TEXT,
  p_idempotency_key TEXT,
  p_order_data JSONB,
  p_subtotal DECIMAL(10, 2),
  p_tax_amount DECIMAL(10, 2),
  p_discount_amount DECIMAL(10, 2),
  p_amount DECIMAL(10, 2),
  p_currency VARCHAR(3),
  p_payment_method VARCHAR(50),
  p_notes TEXT DEFAULT NULL
) RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order public.orders;
BEGIN
  -- Check idempotency: return existing order if key exists
  IF p_idempotency_key IS NOT NULL THEN
    SELECT * INTO v_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;

    IF FOUND THEN
      RETURN v_order;
    END IF;
  END IF;

  -- Create new order
  INSERT INTO public.orders(
    user_id,
    course_id,
    order_number,
    idempotency_key,
    order_data,
    subtotal,
    tax_amount,
    discount_amount,
    amount,
    currency,
    payment_method,
    status,
    payment_status,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_course_id,
    p_order_number,
    p_idempotency_key,
    p_order_data,
    p_subtotal,
    p_tax_amount,
    p_discount_amount,
    p_amount,
    p_currency,
    p_payment_method,
    'pending',
    'pending',
    p_notes,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_order;

  RETURN v_order;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle race condition: if unique constraint violation, return existing order
    SELECT * INTO v_order
    FROM public.orders
    WHERE idempotency_key = p_idempotency_key
    LIMIT 1;
    RETURN v_order;
END;
$$;

-- =============================================================================
-- RPC Function: Create Order with Multiple Items (Cart)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_user_id UUID,
  p_order_number TEXT,
  p_idempotency_key TEXT,
  p_order_data JSONB,
  p_items JSONB,
  p_subtotal DECIMAL(10, 2),
  p_tax_amount DECIMAL(10, 2),
  p_discount_amount DECIMAL(10, 2),
  p_total_amount DECIMAL(10, 2),
  p_currency VARCHAR(3),
  p_payment_method VARCHAR(50),
  p_notes TEXT DEFAULT NULL
) RETURNS TABLE(order_id UUID, order_number TEXT, created BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_created BOOLEAN := FALSE;
  v_course_id UUID;
  v_item_price DECIMAL(10, 2);
  v_item_key TEXT;
BEGIN
  -- Check if order already exists (idempotency)
  SELECT id INTO v_order_id
  FROM public.orders
  WHERE idempotency_key = p_idempotency_key
  LIMIT 1;

  IF FOUND THEN
    -- Order already exists, return existing info
    RETURN QUERY SELECT v_order_id, p_order_number, FALSE;
    RETURN;
  END IF;

  -- Create orders for each course item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_course_id := (v_item->>'course_id')::UUID;
    v_item_price := (v_item->>'price')::DECIMAL;
    v_item_key := p_idempotency_key || '_' || v_course_id::TEXT;

    -- Insert order for this course
    INSERT INTO public.orders(
      user_id,
      course_id,
      order_number,
      idempotency_key,
      order_data,
      subtotal,
      tax_amount,
      discount_amount,
      amount,
      currency,
      payment_method,
      status,
      payment_status,
      notes,
      created_at,
      updated_at
    ) VALUES (
      p_user_id,
      v_course_id,
      p_order_number,
      v_item_key,
      p_order_data || jsonb_build_object('item', v_item),
      v_item_price,
      v_item_price * 0.05, -- 5% tax per item
      0,
      v_item_price * 1.05, -- Total with tax
      p_currency,
      p_payment_method,
      'pending',
      'pending',
      p_notes,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_order_id;

    v_created := TRUE;
  END LOOP;

  RETURN QUERY SELECT v_order_id, p_order_number, v_created;
END;
$$;

-- =============================================================================
-- Function: Get Order by Number
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_order_by_number(
  p_order_number TEXT
) RETURNS SETOF public.orders
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.orders
  WHERE order_number = p_order_number
  ORDER BY created_at DESC;
END;
$$;

-- =============================================================================
-- Grant Permissions
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.create_order_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_by_number TO authenticated;

-- =============================================================================
-- Add Comments for Documentation
-- =============================================================================
COMMENT ON FUNCTION public.create_order_atomic IS 'Creates a single order atomically with idempotency support';
COMMENT ON FUNCTION public.create_order_with_items IS 'Creates multiple orders for cart items with idempotency support';
COMMENT ON FUNCTION public.get_order_by_number IS 'Retrieves orders by order number';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number (e.g., ORD-20250928-1234)';
COMMENT ON COLUMN public.orders.idempotency_key IS 'Unique key to prevent duplicate order creation';
COMMENT ON COLUMN public.orders.subtotal IS 'Order subtotal before tax and discounts';
COMMENT ON COLUMN public.orders.tax_amount IS 'Calculated tax amount';
COMMENT ON COLUMN public.orders.discount_amount IS 'Applied discount amount';
COMMENT ON COLUMN public.orders.notes IS 'Customer order notes';