import { Request, Response } from "express";
import {
  searchImages,
  getImageById,
  getRoverPhotos,
} from "../services/nasa";

export async function search(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const query = (req.query.q as string) || "space";
    const year = req.query.year as string | undefined;
    const rover = req.query.rover as string | undefined;
    const page = parseInt(req.query.page as string) || 1;

    const result = await searchImages(query, { year, rover, page });

    res.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al buscar imágenes";
    res.status(502).json({ message });
  }
}

export async function getById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { nasaId } = req.params;
    const image = await getImageById(nasaId);

    if (!image) {
      res.status(404).json({ message: "Imagen no encontrada" });
      return;
    }

    res.json(image);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener imagen";
    res.status(502).json({ message });
  }
}

export async function getRoverPhotosHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { rover } = req.params;
    const sol = req.query.sol ? parseInt(req.query.sol as string) : undefined;
    const camera = req.query.camera as string | undefined;

    const validRovers = [
      "Curiosity",
      "Opportunity",
      "Spirit",
      "Perseverance",
    ];
    if (
      !validRovers.includes(
        rover.charAt(0).toUpperCase() + rover.slice(1).toLowerCase()
      )
    ) {
      res.status(400).json({
        message: `Rover inválido. Opciones: ${validRovers.join(", ")}`,
      });
      return;
    }

    const photos = await getRoverPhotos(rover, sol, camera);
    res.json({ photos });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener fotos del rover";
    res.status(502).json({ message });
  }
}
