import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ImageCard from "../src/components/ImageCard";
import type { NASAImage } from "../src/types";

const mockImage: NASAImage = {
  nasaId: "test-123",
  title: "Nebulosa de Orion",
  description: "Una hermosa nebulosa en el espacio profundo",
  thumbnail: "https://example.com/thumb.jpg",
  imageUrl: "https://example.com/full.jpg",
  dateCreated: "2024-01-15T00:00:00Z",
};

describe("ImageCard", () => {
  it("debería renderizar el título de la imagen", () => {
    render(<ImageCard image={mockImage} />);
    expect(screen.getByText("Nebulosa de Orion")).toBeDefined();
  });

  it("debería mostrar el botón Agregar a colección cuando se proporciona el handler", () => {
    render(
      <ImageCard image={mockImage} onAddToCollection={() => {}} />
    );
    expect(screen.getByText("Guardar")).toBeDefined();
  });

  it("debería mostrar el botón de IA cuando se proporciona el handler", () => {
    render(<ImageCard image={mockImage} onEnrich={() => {}} />);
    expect(screen.getByText("IA")).toBeDefined();
  });
});
