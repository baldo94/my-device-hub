import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Index } from "@/routes/index";

afterEach(cleanup);

const wheel = () => screen.getByRole("slider", { name: "Círculo de color" });

function openTube(number: string) {
  fireEvent.click(screen.getByRole("button", { name: "Cerrar controles" }));
  fireEvent.click(screen.getByRole("tab", { name: /Mis dispositivos/ }));
  fireEvent.click(screen.getByRole("button", { name: `Abrir controles de Tubo LED ${number}` }));
}

describe("HSI color wheel", () => {
  it("appears only in HSI mode and its arrows drive tone and saturation", () => {
    render(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir controles de Tubo LED 01" }));
    expect(wheel()).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    fireEvent.keyDown(wheel(), { key: "ArrowRight" });
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("151");
    expect(wheel()).toHaveAttribute("aria-valuenow", "151");
    fireEvent.keyDown(wheel(), { key: "ArrowUp", shiftKey: true });
    expect(screen.getByRole("slider", { name: "Saturación" })).toHaveValue("80");
    expect(wheel()).toHaveAttribute("aria-valuetext", "Tono 151 grados, saturación 80%");
  });

  it("keeps the chosen color when a memory is saved and recalled", () => {
    render(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir controles de Tubo LED 01" }));
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    fireEvent.keyDown(wheel(), { key: "ArrowRight" });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    fireEvent.keyDown(wheel(), { key: "ArrowLeft" });
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("150");
    fireEvent.click(screen.getByRole("button", { name: "Memoria 1" }));
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("151");
  });

  it("applies a wheel change from the group to every member", () => {
    render(<Index />);
    fireEvent.click(screen.getByRole("tab", { name: /Grupos/ }));
    fireEvent.click(screen.getByRole("button", { name: "Abrir controles del grupo Estudio" }));
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    fireEvent.keyDown(wheel(), { key: "ArrowRight" });
    openTube("01");
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("151");
    openTube("02");
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("151");
    openTube("03");
    fireEvent.click(screen.getByRole("tab", { name: "HSI" }));
    expect(screen.getByRole("slider", { name: "Tono" })).toHaveValue("150");
  });
});
