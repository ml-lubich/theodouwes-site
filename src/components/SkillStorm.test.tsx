import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { getSkillStormLayout, SkillStorm } from "./SkillStorm";

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

  test("samples a readable cross-section instead of rendering the full catalog", () => {
    const skills = Array.from({ length: 120 }, (_, index) => `Skill ${index % 115}`);
    const layout = getSkillStormLayout(skills);
    expect(layout).toHaveLength(12);
    expect(layout.at(-1)?.name).toBe("Skill 114");
    expect(Math.max(...layout.map((pill) => pill.ring.rx))).toBeLessThanOrEqual(620);
  });

  test("selects on click, pauses on hover, and supports pointer dragging", async () => {
    const onSelect = mock(() => {});
    render(<SkillStorm skills={["Python", "SQL"]} onSelect={onSelect} />);
    const storm = screen.getByRole("group", { name: /Interactive storm/i });
    const python = screen.getByText("Python");

    await new Promise((resolve) => setTimeout(resolve, 5));
    fireEvent.pointerEnter(python);
    fireEvent.pointerLeave(python);
    fireEvent.click(python);
    expect(onSelect).toHaveBeenCalledWith("Python");

    Object.assign(storm, {
      hasPointerCapture: () => false,
      setPointerCapture: mock(() => {}),
      releasePointerCapture: mock(() => {}),
    });
    fireEvent.pointerDown(storm, { clientX: 100, pointerId: 1 });
    fireEvent.pointerMove(storm, { clientX: 80, pointerId: 1 });
    fireEvent.pointerUp(storm, { pointerId: 1 });
    fireEvent.click(python);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
