import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';

declare const Deno: { env: { get: (k: string) => string | undefined } };

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, business_id, order_id } = body;

    // ACTION: Create a new order
    if (action === 'create') {
      const { customer_id, items, pickup_time, notes, payment_method } = body;

      if (!business_id || !customer_id || !items?.length) {
        return errorResponse('Missing required fields: business_id, customer_id, items', 400);
      }

      // Validate items and calculate total
      let subtotal = 0;
      const validatedItems: unknown[] = [];

      for (const item of items) {
        const { data: catalogItem } = await supabase
          .from('catalog_items')
          .select('id, name, price, is_available')
          .eq('id', item.catalog_item_id)
          .eq('business_id', business_id)
          .single();

        if (!catalogItem) {
          return errorResponse(`Item ${item.catalog_item_id} not found`, 404);
        }
        if (!catalogItem.is_available) {
          return errorResponse(`Item "${catalogItem.name}" is not available`, 400);
        }

        const itemTotal = catalogItem.price * item.quantity;
        subtotal += itemTotal;
        validatedItems.push({
          catalog_item_id: item.catalog_item_id,
          name: catalogItem.name,
          unit_price: catalogItem.price,
          quantity: item.quantity,
          total_price: itemTotal,
          notes: item.notes || null,
        });
      }

      // Apply coupon if provided
      let discountAmount = 0;
      if (body.coupon_code) {
        const { data: coupon } = await supabase
          .from('coupons')
          .select('*')
          .eq('code', body.coupon_code)
          .eq('business_id', business_id)
          .eq('is_active', true)
          .single();

        if (coupon) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = subtotal * (coupon.discount_value / 100);
          } else {
            discountAmount = coupon.discount_value;
          }
          discountAmount = Math.min(discountAmount, subtotal);
        }
      }

      const total = subtotal - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          business_id,
          customer_id,
          status: 'pending',
          subtotal,
          discount_amount: discountAmount,
          total_amount: total,
          pickup_time: pickup_time || null,
          notes: notes || null,
          payment_method: payment_method || 'cash',
          coupon_code: body.coupon_code || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) return errorResponse(orderError.message);

      // Create order items
      const orderItems = validatedItems.map((item: any) => ({
        ...item,
        order_id: order.id,
      }));

      await supabase.from('order_items').insert(orderItems);

      return jsonResponse({ success: true, order, items: orderItems });
    }

    // ACTION: Update order status
    if (action === 'update_status') {
      const { status } = body;
      if (!order_id || !status) {
        return errorResponse('Missing required fields: order_id, status', 400);
      }

      const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
      }

      const updateData: Record<string, unknown> = { status };
      if (status === 'completed') updateData.completed_at = new Date().toISOString();
      if (status === 'cancelled') updateData.cancelled_at = new Date().toISOString();

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order_id)
        .select()
        .single();

      if (error) return errorResponse(error.message);

      // If completed, award loyalty points
      if (status === 'completed' && order) {
        const { data: loyaltyProgram } = await supabase
          .from('loyalty_programs')
          .select('*')
          .eq('business_id', order.business_id)
          .eq('is_active', true)
          .single();

        if (loyaltyProgram && loyaltyProgram.points_per_currency) {
          const pointsEarned = Math.floor(order.total_amount * loyaltyProgram.points_per_currency);
          if (pointsEarned > 0) {
            await supabase.from('loyalty_transactions').insert({
              business_id: order.business_id,
              customer_id: order.customer_id,
              transaction_type: 'earn',
              points: pointsEarned,
              source: 'order',
              reference_id: order.id,
              description: `Compra completada - Orden #${order.id.slice(0, 8)}`,
              created_at: new Date().toISOString(),
            });
          }
        }
      }

      return jsonResponse({ success: true, order });
    }

    // ACTION: Get live orders for a business
    if (action === 'get_live') {
      if (!business_id) return errorResponse('Missing required field: business_id', 400);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('business_id', business_id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) return errorResponse(error.message);
      return jsonResponse({ orders });
    }

    return errorResponse('Unknown action', 400);
  } catch (err) {
    console.error('process-order error:', err);
    return errorResponse(err.message);
  }
});
