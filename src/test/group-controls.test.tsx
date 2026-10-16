import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Index } from "@/routes/index";

afterEach(cleanup);

function openGroup() {
  fireEvent.click(screen.getByRole("tab", { name: /Grupos/ }));
  fireEvent.click(screen.getByRole("button", { name: "Abrir controles del grupo Estudio" }));
}

function openTube(number: string) {
  fireEvent.click(screen.getByRole("button", { name: "Cerrar controles" }));
  fireEvent.click(screen.getByRole("tab", { name: /Mis dispositivos/ }));
  fireEvent.click(screen.getByRole("button", { name: `Abrir controles de Tubo LED ${number}` }));
}

describe("Group lighting controls", () => {
  it("applies group effects to both members without changing another group", () => {
    render(<Index />);
    openGroup();
    fireEvent.click(screen.getByRole("button", { name: "Paparazzi" }));
    openTube("01");
    expect(screen.getByRole("button", { name: "Paparazzi" })).toHaveAttribute("aria-pressed", "true");
    openTube("02");
    expect(screen.getByRole("button", { name: "Paparazzi" })).toHaveAttribute("aria-pressed", "true");
    openTube("03");
    expect(screen.getByRole("button", { name: "Paparazzi" })).toHaveAttribute("aria-pressed", "false");
  });

  it("recalls a group memory across members and keeps individual memories separate", () => {
    render(<Index />);
    openGroup();
    fireEvent.change(screen.getByRole("slider", { name: "Brillo" }), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("button", { name: "Vela" }));
    fireEvent.click(screen.getByRole("button", { name: "Memoria 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    fireEvent.change(screen.getByRole("slider", { name: "Brillo" }), { target: { value: "90" } });
    fireEvent.click(screen.getByRole("button", { name: "Paparazzi" }));
    fireEvent.click(screen.getByRole("button", { name: "Memoria 2" }));
    openTube("01");
    expect(screen.getByRole("slider", { name: "Brillo" })).toHaveValue("42");
    expect(screen.getByRole("button", { name: "Vela" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Memoria 2" })).toHaveAttribute("title", "Memoria 2 · vacía");
    openTube("02");
    expect(screen.getByRole("slider", { name: "Brillo" })).toHaveValue("42");
    expect(screen.getByRole("button", { name: "Vela" })).toHaveAttribute("aria-pressed", "true");
  });
});