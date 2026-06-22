import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { authLimiter, externalApiLimiter } from "../middleware/rateLimit";
import * as authController from "../controllers/auth";
import * as imagesController from "../controllers/images";
import * as collectionsController from "../controllers/collections";
import * as openaiController from "../controllers/openai";

const router = Router();

router.post("/auth/register", authLimiter, authController.register);
router.post("/auth/login", authLimiter, authController.login);
router.get("/auth/me", authenticate, authController.me);

router.get(
  "/images/search",
  authenticate,
  externalApiLimiter,
  imagesController.search
);
router.get(
  "/images/:nasaId",
  authenticate,
  externalApiLimiter,
  imagesController.getById
);
router.get(
  "/images/rovers/:rover",
  authenticate,
  externalApiLimiter,
  imagesController.getRoverPhotosHandler
);

router.get("/collections", authenticate, collectionsController.list);
router.post("/collections", authenticate, collectionsController.create);
router.get("/collections/:id", authenticate, collectionsController.getById);
router.put("/collections/:id", authenticate, collectionsController.update);
router.delete("/collections/:id", authenticate, collectionsController.deleteCollection);
router.post("/collections/:id/images", authenticate, collectionsController.addImage);
router.delete(
  "/collections/:id/images/:imageId",
  authenticate,
  collectionsController.removeImage
);

router.post("/enrich", authenticate, externalApiLimiter, openaiController.enrich);

export default router;
