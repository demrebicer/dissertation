import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import FullPageLoader from "../components/FullPageLoader";

describe("FullPageLoader", () => {
  it("renders FullPageLoader component", () => {
    render(<FullPageLoader />);

    const loaderElement = screen.getByLabelText("three-dots-loading");
    expect(loaderElement).toBeInTheDocument();
  });
});
