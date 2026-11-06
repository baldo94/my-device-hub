import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Index } from "@/routes/index";

afterEach(cleanup);

const track = (channel: "red" | "green" | "blue") =>
  screen.getByRole("tabpanel").style.getPropertyValue(`--control-rgb-${channel}-track`);

function openRGB() {
  render(<Index />);
  fireEvent.click(screen.getByRole("button", { name: "Abrir controles de Tubo LED 01" }));
  fireEvent.click(screen.getByRole("tab", { name: "RGB" }));
}

describe("RGB color sliders", () => {
  it("runs each channel from off to full at the other channels' current levels", () => {
    openRGB();
    expect(track("red")).toContain("rgb(0 255 180)");
    expect(track("red")).toContain("rgb(255 255 180)");
    expect(track("green")).toContain("rgb(120 0 180)");
    expect(track("green")).toContain("rgb(120 255 180)");
    expect(track("blue")).toContain("rgb(120 255 0)");
    expect(track("blue")).toContain("rgb(120 255 255)");
  });

  it("redraws the other channels' gradients when one channel changes", () => {
    openRGB();
    fireEvent.click(screen.getByRole("button", { name: "Disminuir Verde" }));
    expect(track("red")).toContain("rgb(0 254 180)");
    expect(track("red")).toContain("rgb(255 254 180)");
    expect(track("blue")).toContain("rgb(120 254 0)");
    expect(track("blue")).toContain("rgb(120 254 255)");
  });
});
