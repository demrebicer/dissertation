import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RouterHandler from "../router";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../pages/Simulation", () => ({
  default: () => <div>Simulation Page</div>,
}));

describe("RouterHandler", () => {
  it("renders Simulation component for the root route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <RouterHandler />
      </MemoryRouter>,
    );

    expect(screen.getByText("Simulation Page")).toBeInTheDocument();
  });
});
