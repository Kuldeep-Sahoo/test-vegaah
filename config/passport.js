import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import AppleStrategy from "passport-apple";
import { User } from "../models/user.model.js"; // PostgreSQL model

// --------- COMMON FIND OR CREATE ----------
const findOrCreateUser = async ({ provider, providerId, profile }) => {
  const email = profile.emails?.[0]?.value || null;
  const name = profile.displayName || "User";
  const avatar = profile.photos?.[0]?.value || null;

  // 1. Try find by provider ID (google_id / facebook_id / apple_id)
  let user = await User.findByProvider(provider, providerId);

  // 2. If not found, try linking with same email
  if (!user && email) {
    user = await User.findByEmail(email);

    if (user) {
      await User.linkProvider({
        provider,
        providerId,
        email,
      });
      await User.setLoggedIn(user.id, true);
      return await User.findById(user.id);
    }
  }

  // 3. If still not found, create new user
  if (!user) {
    user = await User.createOAuthUser({
      provider,
      providerId,
      username: name,
      email,
      avatar,
    });
  } else {
    await User.setLoggedIn(user.id, true);
  }

  return user;
};

/// ---------------- GOOGLE ----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const user = await findOrCreateUser({
          provider: "google",
          providerId: profile.id,
          profile,
        });
        return cb(null, user);
      } catch (err) {
        return cb(err, null);
      }
    }
  )
);

/// ---------------- FACEBOOK ----------------
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "/auth/facebook/callback",
//       profileFields: ["id", "displayName", "emails", "photos"],
//     },
//     async (accessToken, refreshToken, profile, cb) => {
//       try {
//         const user = await findOrCreateUser({
//           provider: "facebook",
//           providerId: profile.id,
//           profile,
//         });
//         return cb(null, user);
//       } catch (err) {
//         return cb(err, null);
//       }
//     }
//   )
// );

/// ---------------- APPLE ----------------
// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKeyString: process.env.APPLE_PRIVATE_KEY,
//       callbackURL: "/auth/apple/callback",
//     },
//     async (accessToken, refreshToken, idToken, profile, cb) => {
//       try {
//         const user = await findOrCreateUser({
//           provider: "apple",
//           providerId: profile.id,
//           profile: {
//             displayName: profile.name?.firstName || "Apple User",
//             emails: profile.email ? [{ value: profile.email }] : [],
//             photos: [],
//           },
//         });
//         return cb(null, user);
//       } catch (err) {
//         return cb(err, null);
//       }
//     }
//   )
// );
