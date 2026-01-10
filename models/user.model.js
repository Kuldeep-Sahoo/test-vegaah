import { pool } from "../database/pgsqDB.js";

export const User = {
  // ---------- BASIC ----------
  findByEmail: async (email) => {
    const res = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return res.rows[0];
  },

  findById: async (id) => {
    const res = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    return res.rows[0];
  },

  // ---------- PROVIDER ----------
  findByProvider: async (provider, providerId) => {
    const column = `${provider}_id`; // google_id, facebook_id, apple_id
    const res = await pool.query(`SELECT * FROM users WHERE ${column}=$1`, [
      providerId,
    ]);
    return res.rows[0];
  },

  linkProvider: async ({ provider, providerId, email }) => {
    const column = `${provider}_id`;
    await pool.query(`UPDATE users SET ${column}=$1 WHERE email=$2`, [
      providerId,
      email,
    ]);
  },

  // ---------- CREATE ----------
  createOAuthUser: async ({
    provider,
    providerId,
    username,
    email,
    avatar,
  }) => {
    const column = `${provider}_id`;

    const res = await pool.query(
      `INSERT INTO users (username, email, avatar, is_verified, is_logged_in, ${column})
       VALUES ($1,$2,$3,true,true,$4)
       RETURNING *`,
      [username, email, avatar, providerId]
    );
    return res.rows[0];
  },

  create: async ({ username, email, password }) => {
    const res = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1,$2,$3) RETURNING *`,
      [username, email, password]
    );
    return res.rows[0];
  },

  // ---------- STATUS ----------
  setLoggedIn: async (id, status) => {
    await pool.query("UPDATE users SET is_logged_in=$1 WHERE id=$2", [
      status,
      id,
    ]);
  },
  saveOTP: async (email, otp, expiry) => {
    await pool.query(`UPDATE users SET otp=$1, otp_expiry=$2 WHERE email=$3`, [
      otp,
      expiry,
      email,
    ]);
  },

  verifyUser: async (email) => {
    await pool.query(
      `UPDATE users
     SET is_verified=true, otp=NULL, otp_expiry=NULL
     WHERE email=$1`,
      [email]
    );
  },
};
