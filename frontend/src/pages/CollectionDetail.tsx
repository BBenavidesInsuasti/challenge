import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Edit3,
  ImageOff,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { useCollectionStore } from "../store/collectionStore";
import toast from "react-hot-toast";

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentCollection,
    currentImages,
    loading,
    fetchCollection,
    updateCollection,
    removeImage,
    deleteCollection,
  } = useCollectionStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (id) {
      fetchCollection(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (currentCollection) {
      setName(currentCollection.name);
      setDescription(currentCollection.description || "");
    }
  }, [currentCollection]);

  const handleSave = async () => {
    if (!id || !name.trim()) return;
    try {
      await updateCollection(parseInt(id), {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Colección actualizada");
      setEditing(false);
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("¿Eliminar esta colección? Las imágenes se perderán.")) {
      try {
        await deleteCollection(parseInt(id));
        toast.success("Colección eliminada");
        navigate("/collections");
      } catch {
        toast.error("Error al eliminar");
      }
    }
  };

  const handleRemoveImage = async (imageId: number) => {
    if (!id) return;
    try {
      await removeImage(parseInt(id), imageId);
      toast.success("Imagen eliminada");
    } catch {
      toast.error("Error al eliminar imagen");
    }
  };

  if (loading && !currentCollection) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-space-400 animate-spin" />
      </div>
    );
  }

  if (!currentCollection) {
    return (
      <div className="text-center py-20">
        <p className="text-space-400">Colección no encontrada</p>
        <button
          onClick={() => navigate("/collections")}
          className="btn-secondary mt-4"
        >
          Volver a colecciones
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/collections")}
        className="flex items-center gap-1.5 text-space-400 hover:text-space-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a colecciones
      </button>

      <div className="card p-6 mb-6">
        {editing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-lg font-semibold"
              placeholder="Nombre de la colección"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-20"
              placeholder="Descripción"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="btn-primary text-sm">
                Guardar
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {currentCollection.name}
              </h1>
              {currentCollection.description && (
                <p className="text-space-400">
                  {currentCollection.description}
                </p>
              )}
              <p className="text-sm text-space-500 mt-2">
                {currentImages.length} imágenes
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center gap-1.5 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {currentImages.length === 0 ? (
        <div className="text-center py-16">
          <ImageOff className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-space-400 mb-2">
            Esta colección está vacía
          </h3>
          <p className="text-space-500">
            Buscá imágenes y guardalas en esta colección
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentImages.map((img) => (
            <div key={img.id} className="card group">
              <div className="relative aspect-[4/3] overflow-hidden bg-space-800">
                <img
                  src={img.image_url || img.thumbnail_url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <button
                  onClick={() => handleRemoveImage(img.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-900/80 rounded-lg text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-space-100 truncate mb-1">
                  {img.title || "Untitled"}
                </h3>
                {img.description && (
                  <p className="text-xs text-space-400 line-clamp-2 mb-2">
                    {img.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  {img.date_created && (
                    <span className="text-xs text-space-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(img.date_created).toLocaleDateString("es-ES")}
                    </span>
                  )}
                  {img.image_url && (
                    <a
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-space-400 hover:text-space-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
