import { pool } from "../database/pgsqDB.js";

export const Product = {
  // ---------- BASIC ----------

  findById: async (id) => {
    const res = await pool.query(`SELECT * FROM products WHERE id=$1`, [id]);
    return res.rows[0];
  },

  // ---------- GET ALL (LIMIT, OFFSET) ----------
  getAll: async ({ category = null, limit = null, offset = null } = {}) => {
    let query = `SELECT * FROM products`;
    let values = [];

    if (category) {
      query += `
      WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(categories) AS c
        WHERE c->>'slug' = $1 OR c->>'name' ILIKE $1
      )
    `;
      values.push(category);
    }

    query += ` ORDER BY id DESC`;

    if (limit !== null && offset !== null) {
      query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, offset);
    }

    const res = await pool.query(query, values);
    return res.rows;
  },

  // ---------- CREATE / UPDATE (UPSERT FULL JSON STRUCTURE) ----------

  upsert: async (product) => {
    const res = await pool.query(
      `INSERT INTO products (
      id, name, slug, parent, type, variation, permalink, sku,
      short_description, description, on_sale, prices, price_html,
      average_rating, review_count, images, categories, tags, brands,
      attributes, variations, grouped_products, has_options, is_purchasable,
      is_in_stock, is_on_backorder, low_stock_remaining, stock_availability,
      sold_individually, add_to_cart, extensions
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,
      $9,$10,$11,$12,$13,
      $14,$15,$16,$17,$18,$19,
      $20,$21,$22,$23,$24,
      $25,$26,$27,$28,$29,
      $30,$31
    )
    ON CONFLICT (id) DO UPDATE SET
      name=EXCLUDED.name,
      slug=EXCLUDED.slug,
      parent=EXCLUDED.parent,
      type=EXCLUDED.type,
      variation=EXCLUDED.variation,
      permalink=EXCLUDED.permalink,
      sku=EXCLUDED.sku,
      short_description=EXCLUDED.short_description,
      description=EXCLUDED.description,
      on_sale=EXCLUDED.on_sale,
      prices=EXCLUDED.prices,
      price_html=EXCLUDED.price_html,
      average_rating=EXCLUDED.average_rating,
      review_count=EXCLUDED.review_count,
      images=EXCLUDED.images,
      categories=EXCLUDED.categories,
      tags=EXCLUDED.tags,
      brands=EXCLUDED.brands,
      attributes=EXCLUDED.attributes,
      variations=EXCLUDED.variations,
      grouped_products=EXCLUDED.grouped_products,
      has_options=EXCLUDED.has_options,
      is_purchasable=EXCLUDED.is_purchasable,
      is_in_stock=EXCLUDED.is_in_stock,
      is_on_backorder=EXCLUDED.is_on_backorder,
      low_stock_remaining=EXCLUDED.low_stock_remaining,
      stock_availability=EXCLUDED.stock_availability,
      sold_individually=EXCLUDED.sold_individually,
      add_to_cart=EXCLUDED.add_to_cart,
      extensions=EXCLUDED.extensions
    RETURNING *`,
      [
        product.id,
        product.name,
        product.slug,
        product.parent,
        product.type,
        product.variation,
        product.permalink,
        product.sku,
        product.short_description,
        product.description,
        product.on_sale,
        product.prices,
        product.price_html,
        product.average_rating,
        product.review_count,
        product.images,
        product.categories,
        product.tags,
        product.brands,
        product.attributes,
        product.variations,
        product.grouped_products,
        product.has_options,
        product.is_purchasable,
        product.is_in_stock,
        product.is_on_backorder,
        product.low_stock_remaining,
        product.stock_availability,
        product.sold_individually,
        product.add_to_cart,
        product.extensions,
      ]
    );

    return res.rows[0];
  },

  // ---------- DELETE ----------

  deleteById: async (id) => {
    await pool.query(`DELETE FROM products WHERE id=$1`, [id]);
  },

  // ---------- GET ALL UNIQUE CATEGORIES ----------
  getAllCategories: async () => {
    const res = await pool.query(`
    SELECT DISTINCT
      c->>'id'   AS id,
      c->>'name' AS name,
      c->>'slug' AS slug,
      c->>'link' AS link
    FROM products,
    jsonb_array_elements(categories) AS c
    WHERE categories IS NOT NULL
  `);

    return res.rows;
  },

  // ---------- GET PRODUCTS BY CATEGORY ----------
  getByCategory: async (slug) => {
    const res = await pool.query(
      `
    SELECT *
    FROM products
    WHERE EXISTS (
      SELECT 1
      FROM jsonb_array_elements(categories) AS c
      WHERE c->>'slug' = $1
    )
    ORDER BY id DESC
    `,
      [slug]
    );

    return res.rows;
  },
};
