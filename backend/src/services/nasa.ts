import axios from "axios";
import { env } from "../utils/env";

export interface NASAImage {
  nasaId: string;
  title: string;
  description: string;
  thumbnail: string;
  imageUrl: string;
  dateCreated: string;
  photographer?: string;
  location?: string;
}

export interface RoverPhoto {
  id: number;
  imgSrc: string;
  roverName: string;
  cameraName: string;
  sol: number;
  earthDate: string;
}

interface SearchFilters {
  year?: string;
  rover?: string;
  page?: number;
}

export async function searchImages(
  query: string,
  filters?: SearchFilters
): Promise<{ results: NASAImage[]; total: number }> {
  try {
    const params: Record<string, string> = {
      q: query || "space",
      media_type: "image",
    };

    if (filters?.year) {
      params.year_start = filters.year;
    }

    if (filters?.page) {
      params.page = filters.page.toString();
    }

    const response = await axios.get(
      "https://images-api.nasa.gov/search",
      { params, timeout: 10000 }
    );

    const items = response.data?.collection?.items || [];
    const total = response.data?.collection?.metadata?.total_hits || items.length;

    const results: NASAImage[] = items
      .filter((item: any) => item.data && item.data.length > 0)
      .map((item: any) => {
        const data = item.data[0];
        const links = item.links || [];

        return {
          nasaId: data.nasa_id || "",
          title: data.title || "Untitled",
          description: data.description || "",
          thumbnail: links[0]?.href || "",
          imageUrl: links[0]?.href || "",
          dateCreated: data.date_created || "",
          photographer: data.photographer || undefined,
          location: data.location || undefined,
        };
      });

    return { results, total };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error al consultar NASA API: ${error.response?.status || error.message}`
      );
    }
    throw error;
  }
}

export async function getImageById(
  nasaId: string
): Promise<NASAImage | null> {
  try {
    const response = await axios.get(
      `https://images-api.nasa.gov/search`,
      {
        params: { nasa_id: nasaId },
        timeout: 10000,
      }
    );

    const items = response.data?.collection?.items;
    if (!items || items.length === 0) return null;

    const item = items[0];
    const data = item.data[0];
    const links = item.links || [];

    return {
      nasaId: data.nasa_id || nasaId,
      title: data.title || "Untitled",
      description: data.description || "",
      thumbnail: links[0]?.href || "",
      imageUrl: links[0]?.href || "",
      dateCreated: data.date_created || "",
      photographer: data.photographer || undefined,
      location: data.location || undefined,
    };
  } catch {
    return null;
  }
}

export async function getRoverPhotos(
  rover: string,
  sol?: number,
  camera?: string
): Promise<RoverPhoto[]> {
  try {
    const params: Record<string, string | number> = {
      api_key: env.NASA_API_KEY,
    };

    if (sol !== undefined) {
      params.sol = sol;
    } else {
      params.sol = 1000;
    }

    if (camera) {
      params.camera = camera;
    }

    const response = await axios.get(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
      { params, timeout: 10000 }
    );

    const photos = response.data?.photos || [];

    return photos.map((photo: any) => ({
      id: photo.id,
      imgSrc: photo.img_src,
      roverName: photo.rover?.name || rover,
      cameraName: photo.camera?.full_name || (camera || "unknown"),
      sol: photo.sol,
      earthDate: photo.earth_date,
    }));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Error al consultar fotos del rover: ${error.response?.status || error.message}`
      );
    }
    throw error;
  }
}

export const ROVERS = ["Curiosity", "Opportunity", "Spirit", "Perseverance"];
export const CAMERAS: Record<string, string[]> = {
  Curiosity: ["FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", "MARDI", "NAVCAM"],
  Opportunity: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"],
  Spirit: ["FHAZ", "RHAZ", "NAVCAM", "PANCAM", "MINITES"],
  Perseverance: [
    "EDL_RUCAM",
    "EDL_DDCAM",
    "EDL_PUCAM1",
    "EDL_PUCAM2",
    "NAVCAM_LEFT",
    "NAVCAM_RIGHT",
    "MCZ_RIGHT",
    "MCZ_LEFT",
    "FRONT_HAZCAM_LEFT_A",
    "FRONT_HAZCAM_RIGHT_A",
    "REAR_HAZCAM_LEFT",
    "REAR_HAZCAM_RIGHT",
    "SKYCAM",
    "SHERLOC_WATSON",
  ],
};
