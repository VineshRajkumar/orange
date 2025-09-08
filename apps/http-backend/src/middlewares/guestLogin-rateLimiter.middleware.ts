import rateLimit from "express-rate-limit";

// limiting guest login to 5 requests per minute per IP
export const guestLoginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,             // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many guest login attempts. Please try again later."
  },
  standardHeaders: true, // send rate limit info in `RateLimit-*` headers -> rate limit info like what is the max limit and how many remaining requests etc 
  legacyHeaders: false,  // disable the `X-RateLimit-*` headers -> previous headers info regarding ratelimiting that might have saved dont consider that only new rate limiting info only
});
