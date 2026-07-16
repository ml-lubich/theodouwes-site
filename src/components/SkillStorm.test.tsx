import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { SkillStorm } from "./SkillStorm";

afterEach(() => cleanup());

describe("SkillStorm", () => {
  test("renders storm group and skill pills", () => {
    render(<SkillStorm skills={["Python", "Bayesian inference", "SQL"]} />);
    expect(
      screen.getByRole("group", {
        name: /Interactive storm of skills/i,
      }),
    ).toBeTruthy();
    expect(screen.getByText("Python")).toBeTruthy();
    expect(screen.getByText("Bayesian inference")).toBeTruthy();
  });
});
