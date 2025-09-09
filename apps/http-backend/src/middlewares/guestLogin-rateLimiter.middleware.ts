import rateLimit from "express-rate-limit";

// limiting guest login to 7 requests in 12hrs per IP
export const guestLoginLimiter = rateLimit({
  windowMs: 12 * 60 * 60 * 1000, // 12 hours
  max: 7,             // limit each IP to 7 requests per windowMs
  message: {
    success: false,
    message: "Too many guest login attempts. You have reached the limit of 7 free guest sessions in the last 12 hours. Please log in with an account to continue."
  },
  standardHeaders: true, // send rate limit info in `RateLimit-*` headers -> rate limit info like what is the max limit and how many remaining requests etc 
  legacyHeaders: false,  // disable the `X-RateLimit-*` headers -> previous headers info regarding ratelimiting that might have saved dont consider that only new rate limiting info only
});
