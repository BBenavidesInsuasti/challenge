import { Request, Response } from "express";
import { z } from "zod";
import { enrichImage, compareImages } from "../services/openai";

const enrichSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional().default(""),
});

const compareSchema = z.object({
  title1: z.string().min(1, "Título 1 requerido"),
  description1: z.string().optional().default(""),
  title2: z.string().min(1, "Título 2 requerido"),
  description2: z.string().optional().default(""),
});

export async function enrich(
  req: Request,
  res: Response
): Promise<void> {
  const result = enrichSchema.safeParse(req.body);

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

  try {
    const enrichment = await enrichImage(result.data);
    res.json(enrichment);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al enriquecer imagen";
    res.status(502).json({ message });
  }
}

export async function compare(
  req: Request,
  res: Response
): Promise<void> {
  const result = compareSchema.safeParse(req.body);

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

  try {
    const comparison = await compareImages(result.data);
    res.json(comparison);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al comparar imágenes";
    res.status(502).json({ message });
  }
}
