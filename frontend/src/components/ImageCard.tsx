import {
  Star,
  Sparkles,
  CheckCircle2,
  ImageOff,
  Calendar,
} from "lucide-react";
import type { NASAImage, RoverPhoto } from "../types";

interface ImageCardProps {
  image: NASAImage | RoverPhoto;
  onSelect?: () => void;
  onEnrich?: () => void;
  onAddToCollection?: () => void;
  onToggleCompare?: () => void;
  isSelected?: boolean;
  isCompareMode?: boolean;
  inCompareList?: boolean;
  type?: "nasa" | "rover";
}

export default function ImageCard({
  image,
  onSelect,
  onEnrich,
  onAddToCollection,
  onToggleCompare,
  isSelected,
  isCompareMode,
  inCompareList,
  type = "nasa",
}: ImageCardProps) {
  const isNASA = type === "nasa";
  const nasaImg = image as NASAImage;
  const roverImg = image as RoverPhoto;

  const title = isNASA ? nasaImg.title : `Photo #${roverImg.id}`;
  const thumbnail = isNASA
    ? nasaImg.thumbnail
    : roverImg.imgSrc;
  const date = isNASA
    ? nasaImg.dateCreated
    : roverImg.earthDate;
  const description = isNASA
    ? nasaImg.description
    : `${roverImg.roverName} - ${roverImg.cameraName} (Sol ${roverImg.sol})`;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "";
    e.currentTarget.classList.add("hidden");
    const parent = e.currentTarget.parentElement;
    if (parent) {
      const fallback = parent.querySelector(".image-fallback");
      if (fallback) {
        fallback.classList.remove("hidden");
      }
    }
  };

  return (
    <div
      className={`card-hover group cursor-pointer ${
        isSelected ? "ring-2 ring-space-400" : ""
      } ${inCompareList ? "ring-2 ring-cosmic-500" : ""}`}
      onClick={onSelect}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-space-800">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="image-fallback hidden absolute inset-0 flex items-center justify-center bg-space-800">
          <div className="text-center text-space-500">
            <ImageOff className="w-10 h-10 mx-auto mb-2" />
            <span className="text-xs">Sin vista previa</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-space-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {onAddToCollection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCollection();
                }}
                className="flex-1 bg-space-900/80 hover:bg-space-800 text-space-200 text-xs py-1.5 px-3 rounded-lg backdrop-blur-sm transition-colors flex items-center justify-center gap-1"
              >
                <Star className="w-3 h-3" />
                Guardar
              </button>
            )}
            {onEnrich && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEnrich();
                }}
                className="flex-1 bg-cosmic-900/80 hover:bg-cosmic-800 text-cosmic-200 text-xs py-1.5 px-3 rounded-lg backdrop-blur-sm transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                IA
              </button>
            )}
          </div>
        </div>

        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare();
            }}
            className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-sm transition-colors ${
              inCompareList
                ? "bg-cosmic-500 text-white"
                : "bg-space-900/60 text-space-400 hover:text-white"
            }`}
            title="Comparar"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-space-100 truncate mb-1">
          {title}
        </h3>
        <p className="text-xs text-space-400 line-clamp-2 mb-2">
          {description}
        </p>
        {date && (
          <div className="flex items-center gap-1 text-xs text-space-500">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
        {!isNASA && (
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="text-[10px] bg-space-800 text-space-400 px-1.5 py-0.5 rounded">
              {(image as RoverPhoto).roverName}
            </span>
            <span className="text-[10px] bg-space-800 text-space-400 px-1.5 py-0.5 rounded">
              {(image as RoverPhoto).cameraName}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
