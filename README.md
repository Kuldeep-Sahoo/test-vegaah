

# 🔐 Auth API Documentation (for Frontend Devs)

Base URL:

```
http://localhost:8000
```

All auth routes are prefixed with:

```
/auth
```

---

## ✅ Auth Methods Supported

Frontend can authenticate users using:

1. ✅ Email + Password (Register & Login)
2. ✅ Email + OTP Login
3. ✅ Google Social Login
4. ✅ JWT Protected Routes

---

## 🔑 JWT Token Usage

After login / register / OTP verify / social login, backend returns a **JWT token**.

Send token in headers for protected routes:

```
Authorization: Bearer <token>
```

---

## 🧾 1. Register (Email + Password)

### ➤ Endpoint

```
POST /auth/register
```

### ➤ Body

```json
{
  "username": "Kuldeep",
  "email": "kuldeep@gmail.com",
  "password": "123456"
}
```

### ➤ Success Response

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { ...userData }
}
```

---

## 🔓 2. Login (Email + Password)

### ➤ Endpoint

```
POST /auth/login
```

### ➤ Body

```json
{
  "email": "kuldeep@gmail.com",
  "password": "123456"
}
```

### ➤ Success Response

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { ...userData }
}
```

---

## 📩 3. Send OTP (Email Login)

Used when user wants to login via OTP.

### ➤ Endpoint

```
POST /auth/send-otp
```

### ➤ Body

```json
{
  "email": "kuldeep@gmail.com"
}
```

### ➤ Notes

* If user does not exist, backend auto-creates user.
* OTP valid for **5 minutes**.
* OTP is sent to email.

### ➤ Success Response

```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

## ✅ 4. Verify OTP + Login

### ➤ Endpoint

```
POST /auth/verify-otp
```

### ➤ Body

```json
{
  "email": "kuldeep@gmail.com",
  "otp": "123456"
}
```

### ➤ Success Response

```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": { ...userData }
}
```

---

## 🌐 5. Google Social Login

### ➤ Step 1: Redirect User

Frontend should redirect browser to:

```
http://localhost:8000/auth/google
```

### ➤ Step 2: After Success

Backend redirects to:

```
CLIENT_URL/auth-success?token=JWT_TOKEN
```

Frontend should:

1. Read token from URL
2. Store in localStorage / cookies
3. Redirect to dashboard

### ➤ On Failure Redirect

```
CLIENT_URL/login?error=social_failed
```

---

## 👤 6. Get Current User (Protected)

### ➤ Endpoint

```
GET /auth/me
```

### ➤ Headers

```
Authorization: Bearer JWT_TOKEN
```

### ➤ Success Response

```json
{
  "success": true,
  "user": { ...userData },
  "message": "User Authenticated Successfully"
}
```

---

## 🔐 Auth Flow Recommendation (Frontend)

### ✔ Email + Password

```
Register/Login → Get Token → Save Token → Call /me
```

### ✔ OTP Login

```
Enter Email → /send-otp → Enter OTP → /verify-otp → Save Token
```

### ✔ Google Login

```
Redirect to /auth/google → Backend → Redirect to frontend with token
```

---

## ⚠ Important Notes for Frontend

* Always store JWT securely (httpOnly cookie preferred).
* Token expiry controlled by backend via `TOKEN_EXPIRE`.
* If API returns `401`, redirect to login.
* For social login, use **window.location.href**, not Axios.
