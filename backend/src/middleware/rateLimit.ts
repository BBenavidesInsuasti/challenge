import rateLimit from "express-rate-limit";

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { message: "Demasiadas solicitudes. Intenta de nuevo más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    message:
      "Demasiados intentos de autenticación. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const externalApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    message:
      "Límite de consultas a APIs externas alcanzado. Intenta de nuevo en un minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
