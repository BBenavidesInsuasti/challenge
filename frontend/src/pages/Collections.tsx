import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, Plus, FolderOpen, Loader2, Trash2 } from "lucide-react";
import { useCollectionStore } from "../store/collectionStore";
import CollectionModal from "../components/CollectionModal";
import toast from "react-hot-toast";

export default function Collections() {
  const { collections, loading, fetchCollections, deleteCollection } =
    useCollectionStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleDelete = async (
    e: React.MouseEvent,
    id: number,
    name: string
  ) => {
    e.stopPropagation();
    if (confirm(`¿Eliminar "${name}"?`)) {
      try {
        await deleteCollection(id);
        toast.success("Colección eliminada");
      } catch {
        toast.error("Error al eliminar");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-space-400" />
            Mis Colecciones
          </h1>
          <p className="text-space-400 text-sm mt-1">
            Organizá tus imágenes espaciales favoritas
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva colección
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-space-400 animate-spin" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-space-400 mb-2">
            No tenés colecciones
          </h3>
          <p className="text-space-500 mb-6">
            Creá tu primera colección para guardar imágenes
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Crear colección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigate(`/collections/${col.id}`)}
              className="card-hover p-5 cursor-pointer group relative"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-space-600 to-cosmic-700 flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-space-200" />
                </div>
                <button
                  onClick={(e) => handleDelete(e, col.id, col.name)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-space-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                {col.name}
              </h3>
              {col.description && (
                <p className="text-sm text-space-400 line-clamp-2 mb-3">
                  {col.description}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-space-500">
                <span>{col.image_count || 0} imágenes</span>
                <span>·</span>
                <span>
                  {col.created_at
                    ? new Date(col.created_at).toLocaleDateString("es-ES")
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <CollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
