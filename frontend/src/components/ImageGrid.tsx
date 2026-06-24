import { Loader2, SearchX } from "lucide-react";
import type { NASAImage, RoverPhoto } from "../types";
import ImageCard from "./ImageCard";

interface ImageGridProps {
  images: NASAImage[];
  roverPhotos?: RoverPhoto[];
  loading: boolean;
  type?: "nasa" | "rover";
  onSelectImage?: (image: NASAImage) => void;
  onEnrich?: (image: NASAImage) => void;
  onAddToCollection?: (image: NASAImage) => void;
  onToggleCompare?: (image: NASAImage) => void;
  compareList?: string[];
}

export default function ImageGrid({
  images,
  roverPhotos,
  loading,
  type = "nasa",
  onSelectImage,
  onEnrich,
  onAddToCollection,
  onToggleCompare,
  compareList,
}: ImageGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-space-400 animate-spin mx-auto mb-4" />
          <p className="text-space-400">Explorando el cosmos...</p>
        </div>
      </div>
    );
  }

  const displayImages =
    type === "nasa" ? images : roverPhotos || [];

  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <SearchX className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-space-400 mb-2">
            Sin resultados
          </h3>
          <p className="text-space-500">
            No encontramos imágenes con esos criterios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {displayImages.map((img) => {
        const nasaImg = img as NASAImage;
        const nasaId =
          type === "nasa"
            ? nasaImg.nasaId
            : `rover-${(img as RoverPhoto).id}`;

        return (
          <ImageCard
            key={nasaId}
            image={img}
            type={type}
            onSelect={() => onSelectImage?.(nasaImg)}
            onEnrich={() => onEnrich?.(nasaImg)}
            onAddToCollection={() => onAddToCollection?.(nasaImg)}
            onToggleCompare={
              onToggleCompare
                ? () => onToggleCompare(nasaImg)
                : undefined
            }
            inCompareList={compareList?.includes(nasaId)}
          />
        );
      })}
    </div>
  );
}
