import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Rocket, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, name);
      toast.success("¡Cuenta creada exitosamente!");
      navigate("/");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Error al registrarse"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-glow pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <Rocket className="w-10 h-10 text-space-400 animate-float" />
            <span className="text-3xl font-bold text-gradient">
              CosmicVault
            </span>
          </Link>
          <p className="text-space-400 mt-2">
            Creá tu cuenta y empezá a explorar
          </p>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-space-400" />
            Crear cuenta
          </h1>

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
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-space-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-space-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-space-400 hover:text-space-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-space-300 mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Repetí la contraseña"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                "Creando cuenta..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-space-700 text-center">
            <p className="text-space-400 text-sm">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="text-space-300 hover:text-space-100 underline"
              >
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
