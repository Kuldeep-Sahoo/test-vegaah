import axios from "axios";
import { Order } from "../models/order.model.js";

export const createOrder = async (req, res) => {
  try {
    const body = req.body;

    const amount = body.total;
    const email = body.billing?.email;

    if (!amount || !email) {
      return res.status(400).json({
        success: false,
        message: "Amount and billing email are required",
      });
    }

    // 🔥 CALL PAYMENT API
    const paymentRes = await axios.post(
      "http://localhost:8000/payment/initiate",
      {
        amount: String(amount),
        email,
        description: "Order Payment",
      }
    );

    if (!paymentRes.data?.success) {
      return res.status(400).json({
        success: false,
        message: "Payment initiation failed",
      });
    }

    const { paymentUrl, transactionId } = paymentRes.data;

    // ✅ BUILD ORDER OBJECT (MATCHES DB + MODEL)
    const orderData = {
      id: body.id,
      parent_id: body.parent_id || 0,
      status: body.status || "processing",
      currency: body.currency || "INR",
      version: body.version || null,
      prices_include_tax: body.prices_include_tax ?? false,

      date_created: body.date_created || new Date().toISOString(),
      date_modified: body.date_modified || new Date().toISOString(),

      discount_total: body.discount_total || 0,
      discount_tax: body.discount_tax || 0,
      shipping_total: body.shipping_total || 0,
      shipping_tax: body.shipping_tax || 0,
      cart_tax: body.cart_tax || 0,
      total: body.total,
      total_tax: body.total_tax || 0,

      customer_id: body.customer_id || 0,
      order_key: body.order_key || `wc_order_${Date.now()}`,

      billing: body.billing || {},
      shipping: body.shipping || {},

      payment_method: body.payment_method || "upi",
      payment_method_title: body.payment_method_title || "UPI / PhonePe",
      transaction_id: transactionId,

      customer_ip_address: body.customer_ip_address || "",
      customer_user_agent: body.customer_user_agent || "",
      created_via: body.created_via || "rest-api",
      customer_note: body.customer_note || "",

      date_completed: body.date_completed || null,
      date_paid: new Date().toISOString(),

      cart_hash: body.cart_hash || "",
      number: body.number || String(body.id),

      meta_data: body.meta_data || [],
      line_items: body.line_items || [],
      tax_lines: body.tax_lines || [],
      shipping_lines: body.shipping_lines || [],
      fee_lines: body.fee_lines || [],
      coupon_lines: body.coupon_lines || [],
      refunds: body.refunds || [],

      payment_url: paymentUrl,
      is_editable: body.is_editable ?? false,
      needs_payment: false,
      needs_processing: true,

      date_created_gmt: body.date_created_gmt || new Date().toISOString(),
      date_modified_gmt: body.date_modified_gmt || new Date().toISOString(),
      date_completed_gmt: body.date_completed_gmt || null,
      date_paid_gmt: new Date().toISOString(),

      currency_symbol: body.currency_symbol || "₹",
      wpo_wcpdf_invoice_number: body.wpo_wcpdf_invoice_number || "",

      _links: body._links || {},
    };

    // ✅ SAVE TO DB
    const savedOrder = await Order.create(orderData);

    return res.json({
      success: true,
      paymentUrl,
      transactionId,
      order: savedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
