import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { queryOne, execute } from "../models/database";
import { generateToken } from "../services/jwt";

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export function register(req: Request, res: Response): void {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const { email, password, name } = result.data;

  const existing = queryOne("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) {
    res.status(409).json({ message: "El email ya está registrado" });
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const info = execute(
    "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
    [email, hashedPassword, name]
  );

  const token = generateToken(info.lastInsertRowid, email);

  res.status(201).json({
    token,
    user: { id: info.lastInsertRowid, email, name },
  });
}

export function login(req: Request, res: Response): void {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: "Datos inválidos",
      errors: result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  const { email, password } = result.data;

  const user = queryOne(
    "SELECT id, email, password, name FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "Credenciales inválidas" });
    return;
  }

  const token = generateToken(user.id, user.email);

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export function me(req: Request, res: Response): void {
  const user = queryOne(
    "SELECT id, email, name, created_at FROM users WHERE id = ?",
    [req.userId]
  );

  if (!user) {
    res.status(404).json({ message: "Usuario no encontrado" });
    return;
  }

  res.json({ user });
}
