import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import routes from "../src/routes/index";
import { initDb, closeDb, execute, queryOne } from "../src/models/database";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", routes);

let token: string;

beforeAll(async () => {
  await initDb();

  const existing = queryOne("SELECT id FROM users WHERE email = ?", [
    "test@test.com",
  ]);

  if (!existing) {
    const hashed = bcrypt.hashSync("test123", 10);
    execute("INSERT INTO users (email, password, name) VALUES (?, ?, ?)", [
      "test@test.com",
      hashed,
      "Test User",
    ]);
  }

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@test.com", password: "test123" });

  token = loginRes.body.token;
});

afterAll(() => {
  closeDb();
});

describe("Collections API", () => {
  it("debería rechazar peticiones sin token", async () => {
    const res = await request(app).get("/api/collections");
    expect(res.status).toBe(401);
  });

  it("debería crear una colección", async () => {
    const res = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Mis Favoritas",
        description: "Imágenes que más me gustan",
      });

    expect(res.status).toBe(201);
    expect(res.body.collection).toBeDefined();
    expect(res.body.collection.name).toBe("Mis Favoritas");
  });

  it("debería listar colecciones del usuario", async () => {
    const res = await request(app)
      .get("/api/collections")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.collections).toBeInstanceOf(Array);
  });

  it("debería agregar una imagen a una colección", async () => {
    const createRes = await request(app)
      .post("/api/collections")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Collection" });

    const collectionId = createRes.body.collection.id;

    const res = await request(app)
      .post(`/api/collections/${collectionId}/images`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nasa_id: "test-123",
        title: "Test Image",
        description: "A test image",
        image_url: "https://example.com/image.jpg",
        thumbnail_url: "https://example.com/thumb.jpg",
      });

    expect(res.status).toBe(201);
    expect(res.body.image).toBeDefined();
    expect(res.body.image.nasa_id).toBe("test-123");
  });
});
