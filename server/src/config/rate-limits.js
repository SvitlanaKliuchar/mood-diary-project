import rateLimit from "express-rate-limit";
import rateLimit from "express-rate-limit";


const RATE_LIMITS = {
    GENERAL: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100,
        message: "Too many requests from this IP, please try again later.",
        retryAfter: "15 minutes"
    },
    AUTH: {
        windowMs: 15 * 60 * 1000, // 15 minutes  
        max: 5,
        message: "Too many authentication attempts from this IP, please try again later.",
        retryAfter: "15 minutes"
    },
    PASSWORD_RESET: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3,
        message: "Too many password reset attempts from this IP, please try again later.",
        retryAfter: "1 hour"
    },
    UPLOAD: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20,
        message: "Too many file uploads from this IP, please try again later.",
        retryAfter: "15 minutes"
    }
};

// helper function to create rate limiter with consistent config
const createRateLimiter = (config, options = {}) => {
    return rateLimit({
        windowMs: config.windowMs,
        max: config.max,
        message: {
            error: config.message,
            retryAfter: config.retryAfter
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                error: config.message,
                retryAfter: config.retryAfter
            });
        },
        ...options // allow overrides for specific use cases
    });
};

// export configured rate limiters
export const generalLimiter = createRateLimiter(RATE_LIMITS.GENERAL);

export const authLimiter = createRateLimiter(RATE_LIMITS.AUTH, {
    skipSuccessfulRequests: true // don't count successful logins against limit
});

export const passwordResetLimiter = createRateLimiter(RATE_LIMITS.PASSWORD_RESET);

export const uploadLimiter = createRateLimiter(RATE_LIMITS.UPLOAD);

// export configuration for testing/monitoring
export const rateLimitConfig = RATE_LIMITS;

// create environment-specific overrides
const getEnvironmentLimits = () => {
    if (process.env.NODE_ENV === 'development') {
        return {
            GENERAL: { ...RATE_LIMITS.GENERAL, max: 1000 }, // more lenient in dev
            AUTH: { ...RATE_LIMITS.AUTH, max: 50 },
            PASSWORD_RESET: { ...RATE_LIMITS.PASSWORD_RESET, max: 10 },
            UPLOAD: { ...RATE_LIMITS.UPLOAD, max: 100 }
        };
    }
    
    if (process.env.NODE_ENV === 'test') {
        return {
            GENERAL: { ...RATE_LIMITS.GENERAL, max: 10000 }, // very lenient for tests
            AUTH: { ...RATE_LIMITS.AUTH, max: 1000 },
            PASSWORD_RESET: { ...RATE_LIMITS.PASSWORD_RESET, max: 100 },
            UPLOAD: { ...RATE_LIMITS.UPLOAD, max: 1000 }
        };
    }
    
    return RATE_LIMITS; // production limits
};

// export environment-aware limiters
const envLimits = getEnvironmentLimits();

export const envGeneralLimiter = createRateLimiter(envLimits.GENERAL);
export const envAuthLimiter = createRateLimiter(envLimits.AUTH, {
    skipSuccessfulRequests: true
});
export const envPasswordResetLimiter = createRateLimiter(envLimits.PASSWORD_RESET);
export const envUploadLimiter = createRateLimiter(envLimits.UPLOAD);