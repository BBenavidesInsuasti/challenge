import { useState, useEffect } from "react";
import { X, Plus, FolderOpen } from "lucide-react";
import { useCollectionStore } from "../store/collectionStore";
import toast from "react-hot-toast";
import type { NASAImage } from "../types";
import CollectionModal from "./CollectionModal";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: NASAImage | null;
}

export default function AddToCollectionModal({
  isOpen,
  onClose,
  image,
}: AddToCollectionModalProps) {
  const { collections, fetchCollections, addImage } = useCollectionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  if (!isOpen || !image) return null;

  const handleAdd = async (collectionId: number) => {
    setLoading(collectionId.toString());
    try {
      await addImage(collectionId, {
        nasa_id: image.nasaId,
        title: image.title,
        description: image.description,
        image_url: image.imageUrl,
        thumbnail_url: image.thumbnail,
        date_created: image.dateCreated,
      });
      toast.success("Imagen agregada a la colección");
      onClose();
    } catch {
      toast.error("Error al agregar la imagen");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative bg-space-900 border border-space-700 rounded-xl w-full max-w-md p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-space-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-space-800">
              <img
                src={image.thumbnail}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {image.title}
              </h2>
              <p className="text-xs text-space-400">Guardar en colección</p>
            </div>
          </div>

          <div className="space-y-2">
            {collections.length === 0 ? (
              <div className="text-center py-8 text-space-400">
                <FolderOpen className="w-10 h-10 mx-auto mb-3" />
                <p>No tenés colecciones aún</p>
              </div>
            ) : (
              collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleAdd(col.id)}
                  disabled={loading === col.id.toString()}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-space-800/50 hover:bg-space-800 border border-space-700/50 hover:border-space-500/50 transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-space-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-space-100 truncate">
                      {col.name}
                    </p>
                    <p className="text-xs text-space-400">
                      {col.image_count || 0} imágenes
                    </p>
                  </div>
                  {loading === col.id.toString() ? (
                    <span className="text-space-400 text-sm">Guardando...</span>
                  ) : (
                    <Plus className="w-5 h-5 text-space-400" />
                  )}
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full mt-4 btn-secondary flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nueva colección
          </button>
        </div>
      </div>

      <CollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
}
