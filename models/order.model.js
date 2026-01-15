import { pool } from "../database/pgsqDB.js";

export const Order = {
  create: async (order) => {
    const query = `
      INSERT INTO orders (
        id, parent_id, status, currency, version, prices_include_tax,
        date_created, date_modified,
        discount_total, discount_tax, shipping_total, shipping_tax,
        cart_tax, total, total_tax,
        customer_id, order_key,
        billing, shipping,
        payment_method, payment_method_title, transaction_id,
        customer_ip_address, customer_user_agent, created_via, customer_note,
        date_completed, date_paid, cart_hash, number,
        meta_data, line_items, tax_lines, shipping_lines, fee_lines,
        coupon_lines, refunds,
        payment_url, is_editable, needs_payment, needs_processing,
        date_created_gmt, date_modified_gmt, date_completed_gmt, date_paid_gmt,
        currency_symbol, wpo_wcpdf_invoice_number, links
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,
        $9,$10,$11,$12,
        $13,$14,$15,
        $16,$17,
        $18::jsonb,$19::jsonb,
        $20,$21,$22,
        $23,$24,$25,$26,
        $27,$28,$29,$30,
        $31::jsonb,$32::jsonb,$33::jsonb,$34::jsonb,$35::jsonb,
        $36::jsonb,$37::jsonb,
        $38,$39,$40,$41,
        $42,$43,$44,$45,
        $46,$47,$48::jsonb
      )
      RETURNING *;
    `;

    const values = [
      order.id,
      order.parent_id,
      order.status,
      order.currency,
      order.version,
      order.prices_include_tax,

      order.date_created ? new Date(order.date_created) : null,
      order.date_modified ? new Date(order.date_modified) : null,

      order.discount_total,
      order.discount_tax,
      order.shipping_total,
      order.shipping_tax,
      order.cart_tax,
      order.total,
      order.total_tax,

      order.customer_id,
      order.order_key,

      JSON.stringify(order.billing || {}),
      JSON.stringify(order.shipping || {}),

      order.payment_method,
      order.payment_method_title,
      order.transaction_id,

      order.customer_ip_address,
      order.customer_user_agent,
      order.created_via,
      order.customer_note,

      order.date_completed ? new Date(order.date_completed) : null,
      order.date_paid ? new Date(order.date_paid) : null,
      order.cart_hash,
      order.number,

      JSON.stringify(order.meta_data || []),
      JSON.stringify(order.line_items || []),
      JSON.stringify(order.tax_lines || []),
      JSON.stringify(order.shipping_lines || []),
      JSON.stringify(order.fee_lines || []),
      JSON.stringify(order.coupon_lines || []),
      JSON.stringify(order.refunds || []),

      order.payment_url,
      order.is_editable,
      order.needs_payment,
      order.needs_processing,

      order.date_created_gmt ? new Date(order.date_created_gmt) : null,
      order.date_modified_gmt ? new Date(order.date_modified_gmt) : null,
      order.date_completed_gmt ? new Date(order.date_completed_gmt) : null,
      order.date_paid_gmt ? new Date(order.date_paid_gmt) : null,

      order.currency_symbol,
      order.wpo_wcpdf_invoice_number,

      JSON.stringify(order._links || {}),
    ];

    const res = await pool.query(query, values);
    return res.rows[0];
  },

  getById: async (id) => {
    const res = await pool.query(`SELECT * FROM orders WHERE id=$1`, [id]);
    return res.rows[0];
  },

  getAll: async () => {
    const res = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );
    return res.rows;
  },
};
