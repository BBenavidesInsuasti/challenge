import { Request, Response } from "express";
import { z } from "zod";
import { queryAll, queryOne, execute } from "../models/database";

const createCollectionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  description: z.string().max(500).optional().default(""),
});

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

const addImageSchema = z.object({
  nasa_id: z.string().min(1),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
  image_url: z.string().optional().default(""),
  thumbnail_url: z.string().optional().default(""),
  date_created: z.string().optional().default(""),
  metadata: z.any().optional(),
});

export function list(req: Request, res: Response): void {
  const collections = queryAll(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM collection_images WHERE collection_id = c.id) as image_count
     FROM collections c 
     WHERE c.user_id = ? 
     ORDER BY c.created_at DESC`,
    [req.userId]
  );

  res.json({ collections });
}

export function create(req: Request, res: Response): void {
  const result = createCollectionSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const { name, description } = result.data;
  const info = execute(
    "INSERT INTO collections (user_id, name, description) VALUES (?, ?, ?)",
    [req.userId, name, description]
  );

  const collection = queryOne("SELECT * FROM collections WHERE id = ?", [
    info.lastInsertRowid,
  ]);

  res.status(201).json({ collection });
}

export function getById(req: Request, res: Response): void {
  const { id } = req.params;

  const collection = queryOne(
    `SELECT c.*, 
      (SELECT COUNT(*) FROM collection_images WHERE collection_id = c.id) as image_count
     FROM collections c WHERE c.id = ? AND c.user_id = ?`,
    [id, req.userId]
  );

  if (!collection) {
    res.status(404).json({ message: "Colección no encontrada" });
    return;
  }

  const images = queryAll(
    "SELECT * FROM collection_images WHERE collection_id = ? ORDER BY added_at DESC",
    [id]
  );

  res.json({ collection, images });
}

export function update(req: Request, res: Response): void {
  const { id } = req.params;
  const result = updateCollectionSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const existing = queryOne(
    "SELECT id FROM collections WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );

  if (!existing) {
    res.status(404).json({ message: "Colección no encontrada" });
    return;
  }

  const updates: string[] = [];
  const values: any[] = [];

  if (result.data.name !== undefined) {
    updates.push("name = ?");
    values.push(result.data.name);
  }
  if (result.data.description !== undefined) {
    updates.push("description = ?");
    values.push(result.data.description);
  }

  if (updates.length > 0) {
    values.push(id);
    execute(
      `UPDATE collections SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
  }

  const collection = queryOne("SELECT * FROM collections WHERE id = ?", [id]);
  res.json({ collection });
}

export function deleteCollection(req: Request, res: Response): void {
  const { id } = req.params;

  const existing = queryOne(
    "SELECT id FROM collections WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );

  if (!existing) {
    res.status(404).json({ message: "Colección no encontrada" });
    return;
  }

  execute("DELETE FROM collections WHERE id = ?", [id]);
  res.json({ message: "Colección eliminada" });
}

export function addImage(req: Request, res: Response): void {
  const { id } = req.params;
  const result = addImageSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const collection = queryOne(
    "SELECT id FROM collections WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );

  if (!collection) {
    res.status(404).json({ message: "Colección no encontrada" });
    return;
  }

  const {
    nasa_id,
    title,
    description,
    image_url,
    thumbnail_url,
    date_created,
    metadata,
  } = result.data;

  const info = execute(
    `INSERT INTO collection_images 
     (collection_id, nasa_id, title, description, image_url, thumbnail_url, date_created, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      nasa_id,
      title,
      description,
      image_url,
      thumbnail_url,
      date_created,
      JSON.stringify(metadata || {}),
    ]
  );

  const image = queryOne("SELECT * FROM collection_images WHERE id = ?", [
    info.lastInsertRowid,
  ]);

  res.status(201).json({ image });
}

export function removeImage(req: Request, res: Response): void {
  const { id, imageId } = req.params;

  const collection = queryOne(
    "SELECT id FROM collections WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );

  if (!collection) {
    res.status(404).json({ message: "Colección no encontrada" });
    return;
  }

  const image = queryOne(
    "SELECT id FROM collection_images WHERE id = ? AND collection_id = ?",
    [imageId, id]
  );

  if (!image) {
    res.status(404).json({ message: "Imagen no encontrada en la colección" });
    return;
  }

  execute("DELETE FROM collection_images WHERE id = ?", [imageId]);
  res.json({ message: "Imagen eliminada de la colección" });
}
