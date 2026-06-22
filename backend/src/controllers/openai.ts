import { Request, Response } from "express";
import { z } from "zod";
import { enrichImage } from "../services/openai";

const enrichSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional().default(""),
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
