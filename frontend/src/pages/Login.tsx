import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Rocket, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("demo@demo.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("¡Bienvenido!");
      navigate("/");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Error al iniciar sesión"
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
            <span className="text-3xl font-bold text-gradient">CosmicVault</span>
          </Link>
          <p className="text-space-400 mt-2">Explora el universo desde tu navegador</p>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
            <LogIn className="w-6 h-6 text-space-400" />
            Iniciar sesión
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Tu contraseña"
                  required
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

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                "Ingresando..."
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-space-700 text-center">
            <p className="text-space-400 text-sm">
              ¿No tenés cuenta?{" "}
              <Link
                to="/register"
                className="text-space-300 hover:text-space-100 underline"
              >
                Registrate
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-space-800/50 border border-space-700/50">
            <p className="text-xs text-space-400 text-center">
              Demo: <strong className="text-space-300">demo@demo.com</strong> /{" "}
              <strong className="text-space-300">password123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
