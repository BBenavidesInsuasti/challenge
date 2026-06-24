import { useState } from "react";
import { X } from "lucide-react";
import { useCollectionStore } from "../store/collectionStore";
import toast from "react-hot-toast";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CollectionModal({
  isOpen,
  onClose,
}: CollectionModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const createCollection = useCollectionStore((s) => s.createCollection);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setLoading(true);
    try {
      await createCollection(name.trim(), description.trim());
      toast.success("Colección creada");
      setName("");
      setDescription("");
      onClose();
    } catch {
      toast.error("Error al crear la colección");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-space-900 border border-space-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-space-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">
          Nueva Colección
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-space-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Ej: Marte, Nebulosas, Favoritas..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-space-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none h-24"
              placeholder="Describe tu colección..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex-1"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
