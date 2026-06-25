import { useState, useEffect, useCallback } from "react";
import { Search as SearchIcon, Sparkles, Filter, X, RotateCcw, GitCompare } from "lucide-react";
import { useImageStore } from "../store/imageStore";
import ImageGrid from "../components/ImageGrid";
import AddToCollectionModal from "../components/AddToCollectionModal";
import type { NASAImage } from "../types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function SearchPage() {
  const navigate = useNavigate();
  const {
    images,
    roverPhotos,
    loading,
    enriching,
    selectedImage,
    aiEnrichment,
    totalResults,
    searchMode,
    search,
    fetchRoverPhotos,
    selectImage,
    enrichImage,
    setSearchMode,
  } = useImageStore();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [query, setQuery] = useState("");
  const [year, setYear] = useState("");
  const [rover, setRover] = useState("Curiosity");
  const [camera, setCamera] = useState("");
  const [sol, setSol] = useState("1000");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [addToCollectionImage, setAddToCollectionImage] =
    useState<NASAImage | null>(null);
  const [compareList, setCompareList] = useState<NASAImage[]>([]);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      setPage(1);
      if (searchMode === "nasa") {
        search(query || "space", { year: year || undefined, page: 1 });
      } else {
        fetchRoverPhotos(rover, parseInt(sol) || 1000, camera || undefined);
      }
    },
    [query, year, searchMode, rover, sol, camera, search, fetchRoverPhotos]
  );

  useEffect(() => {
    search("space", { page: 1 });
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    search(query || "space", { year: year || undefined, page: nextPage }, true);
  };

  const hasMore = images.length < totalResults;

  const handleSelectImage = (image: NASAImage) => {
    selectImage(image);
    if (aiEnrichment) {
      enrichImage(image.title, image.description);
    }
  };

  const handleEnrich = (image: NASAImage) => {
    if (!isAuthenticated()) {
      toast.error("Iniciá sesión para usar IA");
      return;
    }
    selectImage(image);
    enrichImage(image.title, image.description);
  };

  const handleAddToCollection = (image: NASAImage) => {
    if (!isAuthenticated()) {
      toast.error("Iniciá sesión para guardar imágenes");
      return;
    }
    setAddToCollectionImage(image);
  };

  const handleToggleCompare = (image: NASAImage) => {
    if (compareList.find((i) => i.nasaId === image.nasaId)) {
      setCompareList((prev) => prev.filter((i) => i.nasaId !== image.nasaId));
    } else {
      if (compareList.length >= 6) {
        toast.error("Máximo 6 imágenes para comparar");
        return;
      }
      setCompareList((prev) => [...prev, image]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          Explorador Espacial
        </h1>
        <p className="text-space-400 mb-6">
          Buscá imágenes de la NASA y de los rovers en Marte
        </p>

        {/* Mode Tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-space-800/50 rounded-lg w-fit">
          <button
            onClick={() => setSearchMode("nasa")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              searchMode === "nasa"
                ? "bg-space-700 text-white shadow"
                : "text-space-400 hover:text-space-200"
            }`}
          >
            NASA Library
          </button>
          <button
            onClick={() => setSearchMode("rovers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              searchMode === "rovers"
                ? "bg-space-700 text-white shadow"
                : "text-space-400 hover:text-space-200"
            }`}
          >
            Mars Rovers
          </button>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-space-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  searchMode === "nasa"
                    ? "Buscá imágenes del espacio..."
                    : "Buscá fotos de Marte..."
                }
                className="input-field pl-10 pr-4"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors ${
                showFilters
                  ? "bg-space-700 text-space-200"
                  : "text-space-400 hover:text-space-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {(year || (searchMode === "rovers" && (camera || sol !== "1000"))) && (
                <span className="w-2 h-2 bg-space-400 rounded-full" />
              )}
            </button>

            {searchMode === "nasa" && (
              <div className="flex-1" />
            )}

            {compareList.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    navigate("/compare", {
                      state: { preselected: compareList },
                    })
                  }
                  className="flex items-center gap-1.5 text-sm bg-space-700 hover:bg-space-600 text-space-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  Comparar ({compareList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCompareList([])}
                  className="flex items-center gap-1.5 text-sm text-space-400 hover:text-space-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpiar
                </button>
              </>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-space-800/30 rounded-lg border border-space-700/50">
              {searchMode === "nasa" ? (
                <>
                  <div>
                    <label className="block text-xs text-space-400 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="Ej: 2020"
                      className="input-field text-sm"
                      min={1958}
                      max={2026}
                    />
                  </div>
                  <div className="sm:col-span-2" />
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs text-space-400 mb-1">
                      Rover
                    </label>
                    <select
                      value={rover}
                      onChange={(e) => setRover(e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="Curiosity">Curiosity</option>
                      <option value="Opportunity">Opportunity</option>
                      <option value="Spirit">Spirit</option>
                      <option value="Perseverance">Perseverance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-space-400 mb-1">
                      Cámara
                    </label>
                    <select
                      value={camera}
                      onChange={(e) => setCamera(e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">Todas</option>
                      <option value="FHAZ">Front Hazard</option>
                      <option value="RHAZ">Rear Hazard</option>
                      <option value="NAVCAM">Navigation</option>
                      <option value="PANCAM">Panoramic</option>
                      <option value="MAST">Mast</option>
                      <option value="CHEMCAM">ChemCam</option>
                      <option value="MAHLI">MAHLI</option>
                      <option value="MARDI">MARDI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-space-400 mb-1">
                      Sol (día marciano)
                    </label>
                    <input
                      type="number"
                      value={sol}
                      onChange={(e) => setSol(e.target.value)}
                      placeholder="1000"
                      className="input-field text-sm"
                      min={0}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <ImageGrid
        images={images}
        roverPhotos={roverPhotos}
        loading={loading}
        type={searchMode === "rovers" ? "rover" : "nasa"}
        onSelectImage={handleSelectImage}
        onEnrich={handleEnrich}
        onAddToCollection={handleAddToCollection}
        onToggleCompare={handleToggleCompare}
        compareList={compareList.map((i) => i.nasaId)}
      />

      {/* Load More */}
      {searchMode === "nasa" && !loading && hasMore && (
        <div className="flex justify-center pt-2 pb-4">
          <button
            onClick={handleLoadMore}
            className="btn-secondary flex items-center gap-2 px-8"
          >
            Cargar más imágenes ({images.length}/{totalResults})
          </button>
        </div>
      )}

      {/* Image Detail Panel */}
      {selectedImage && (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            <div className="relative bg-space-900">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-full object-cover max-h-[500px]"
              />
              <button
                onClick={() => selectImage(null)}
                className="absolute top-3 right-3 p-1.5 bg-space-900/80 rounded-lg text-space-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {selectedImage.title}
                </h2>
                {selectedImage.dateCreated && (
                  <p className="text-sm text-space-400">
                    {new Date(
                      selectedImage.dateCreated
                    ).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>

              <p className="text-space-300 text-sm leading-relaxed">
                {selectedImage.description || "Sin descripción disponible."}
              </p>

              {selectedImage.photographer && (
                <p className="text-sm text-space-400">
                  Fotógrafo: {selectedImage.photographer}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {isAuthenticated() && (
                  <>
                    <button
                      onClick={() =>
                        enrichImage(
                          selectedImage.title,
                          selectedImage.description
                        )
                      }
                      disabled={enriching}
                      className="btn-primary flex items-center gap-1.5 text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      {enriching ? "Analizando..." : "Enriquecer con IA"}
                    </button>
                    <button
                      onClick={() =>
                        setAddToCollectionImage(selectedImage)
                      }
                      className="btn-secondary flex items-center gap-1.5 text-sm"
                    >
                      Guardar en colección
                    </button>
                  </>
                )}
              </div>

              {/* AI Enrichment */}
              {aiEnrichment && (
                <div className="space-y-3 pt-4 border-t border-space-700">
                  <h3 className="text-sm font-semibold text-space-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cosmic-400" />
                    Enriquecimiento IA
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 rounded-lg bg-space-800/50 border border-space-700/50">
                      <p className="text-space-400 text-xs mb-1">
                        Dato curioso
                      </p>
                      <p className="text-space-200">
                        {aiEnrichment.funFact}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-space-800/50 border border-space-700/50">
                      <p className="text-space-400 text-xs mb-1">
                        Contexto histórico
                      </p>
                      <p className="text-space-200">
                        {aiEnrichment.historicalContext}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiEnrichment.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-space-800 text-space-300 px-2 py-0.5 rounded-full border border-space-700"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AddToCollectionModal
        isOpen={!!addToCollectionImage}
        onClose={() => setAddToCollectionImage(null)}
        image={addToCollectionImage}
      />
    </div>
  );
}
