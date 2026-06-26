import { useState } from "react";
import { useLocation } from "react-router-dom";
import { GitCompare, Sparkles, X, Search, Loader2 } from "lucide-react";
import { imagesApi, aiApi } from "../services/api";
import toast from "react-hot-toast";
import type { NASAImage, AIComparison } from "../types";

interface CompareSlot {
  image: NASAImage | null;
  query: string;
  searching: boolean;
  results: NASAImage[];
}

export default function ImageComparator() {
  const location = useLocation();
  const preselected = (location.state as { preselected?: NASAImage[] })
    ?.preselected;

  const [slots, setSlots] = useState<CompareSlot[]>(() => {
    const initial: CompareSlot[] = [
      { image: null, query: "", searching: false, results: [] },
      { image: null, query: "", searching: false, results: [] },
    ];
    if (preselected) {
      preselected.slice(0, 2).forEach((img, i) => {
        if (i < 2) initial[i] = { ...initial[i], image: img };
      });
    }
    return initial;
  });

  const [comparing, setComparing] = useState(false);
  const [comparisonData, setComparisonData] = useState<AIComparison | null>(null);

  const handleSearch = async (index: number, q: string) => {
    if (!q.trim()) return;

    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], searching: true, query: q };
      return next;
    });

    try {
      const { results } = await imagesApi.search(q);
      setSlots((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], searching: false, results };
        return next;
      });
    } catch {
      setSlots((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], searching: false };
        return next;
      });
      toast.error("Error al buscar imágenes");
    }
  };

  const selectImage = (index: number, image: NASAImage) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        image,
        query: "",
        results: [],
      };
      return next;
    });
    setComparisonData(null);
  };

  const removeImage = (index: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], image: null };
      return next;
    });
    setComparisonData(null);
  };

  const handleCompare = async () => {
    if (!slots[0].image || !slots[1].image) {
      toast.error("Seleccioná dos imágenes para comparar");
      return;
    }

    setComparing(true);
    try {
      const data = await aiApi.compare({
        title1: slots[0].image.title,
        description1: slots[0].image.description,
        title2: slots[1].image.title,
        description2: slots[1].image.description,
      });

      setComparisonData(data);
      toast.success("Comparación generada");
    } catch {
      toast.error("Error al generar comparación");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-space-400" />
            Comparador de Imágenes
          </h1>
          <p className="text-space-400 text-sm mt-1">
            Seleccioná dos imágenes y comparalas con IA
          </p>
        </div>
        <button
          onClick={handleCompare}
          disabled={!slots[0].image || !slots[1].image || comparing}
          className="btn-primary flex items-center gap-2"
        >
          {comparing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Comparar con IA
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {slots.map((slot, index) => (
          <div key={index} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-space-200">
                Imagen {index + 1}
              </h2>
              {slot.image && (
                <button
                  onClick={() => removeImage(index)}
                  className="text-space-400 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {slot.image ? (
              <div className="space-y-2">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-space-800">
                  <img
                    src={slot.image.imageUrl}
                    alt={slot.image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-space-100 font-medium truncate">
                  {slot.image.title}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
                    <input
                      type="text"
                      value={slot.query}
                      onChange={(e) => {
                        const next = [...slots];
                        next[index].query = e.target.value;
                        setSlots(next);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(index, slot.query);
                      }}
                      placeholder="Buscá una imagen..."
                      className="input-field pl-9 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch(index, slot.query)}
                    disabled={slot.searching}
                    className="btn-primary text-sm px-4"
                  >
                    {slot.searching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </button>
                </div>

                {slot.searching && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-space-400 animate-spin" />
                  </div>
                )}

                {slot.results.length > 0 && !slot.searching && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {slot.results.slice(0, 8).map((img) => (
                      <button
                        key={img.nasaId}
                        onClick={() => selectImage(index, img)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg bg-space-800/50 hover:bg-space-800 border border-space-700/50 transition-all text-left"
                      >
                        <div className="w-12 h-12 rounded flex-shrink-0 overflow-hidden bg-space-700">
                          <img
                            src={img.thumbnail}
                            alt={img.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-space-100 truncate">
                            {img.title}
                          </p>
                          <p className="text-[10px] text-space-400 truncate">
                            {img.dateCreated
                              ? new Date(
                                  img.dateCreated
                                ).toLocaleDateString()
                              : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {slot.results.length === 0 &&
                  !slot.searching &&
                  slot.query && (
                    <p className="text-sm text-space-500 text-center py-4">
                      Sin resultados
                    </p>
                  )}

                {!slot.query && (
                  <div className="text-center py-8 text-space-500">
                    <GitCompare className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">
                      Buscá una imagen espacial
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {comparisonData && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-cosmic-400" />
            Análisis Comparativo
          </h3>
          <div className="prose prose-invert max-w-none text-space-200 text-sm leading-relaxed whitespace-pre-line mb-6">
            {comparisonData.comparison}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg bg-space-800/50 border border-space-700/50">
              <h4 className="text-sm font-semibold text-space-200 mb-2 flex items-center gap-1.5">
                <X className="w-4 h-4 text-red-400" />
                Diferencias clave
              </h4>
              <ul className="space-y-1.5">
                {comparisonData.keyDifferences.map((d, i) => (
                  <li key={i} className="text-xs text-space-300 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-space-800/50 border border-space-700/50">
              <h4 className="text-sm font-semibold text-space-200 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-green-400" />
                En común
              </h4>
              <ul className="space-y-1.5">
                {comparisonData.commonElements.map((c, i) => (
                  <li key={i} className="text-xs text-space-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {comparisonData.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-space-800 text-space-300 px-2 py-0.5 rounded-full border border-space-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
