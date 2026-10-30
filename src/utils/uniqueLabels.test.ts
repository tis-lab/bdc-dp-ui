import { describe, it, expect } from "vitest";
import { uniqueLabels } from "./uniqueLabels";

describe("uniqueLabels", () => {
  it("keeps distinct labels in their original order", () => {
    expect(uniqueLabels(["asthma", "hypertension", "diabetes"], 10)).toEqual([
      "asthma",
      "hypertension",
      "diabetes",
    ]);
  });

  it("drops exact duplicates, keeping the first", () => {
    expect(
      uniqueLabels(["hypertension", "asthma", "hypertension"], 10),
    ).toEqual(["hypertension", "asthma"]);
  });

  it("treats labels that differ only in case as duplicates", () => {
    expect(
      uniqueLabels(["Hypertension", "hypertension", "HYPERTENSION"], 10),
    ).toEqual(["Hypertension"]);
  });

  it("treats labels that differ only in surrounding spaces as duplicates", () => {
    expect(uniqueLabels(["hypertension", " hypertension "], 10)).toEqual([
      "hypertension",
    ]);
  });

  it("keeps labels that differ by more than case or spacing", () => {
    expect(
      uniqueLabels(["hypertension", "pulmonary hypertension"], 10),
    ).toEqual(["hypertension", "pulmonary hypertension"]);
  });

  it("returns the first label as written, trimmed", () => {
    expect(uniqueLabels(["  Hypertension  ", "hypertension"], 10)).toEqual([
      "Hypertension",
    ]);
  });

  it("drops blank labels", () => {
    expect(uniqueLabels(["", "   ", "asthma"], 10)).toEqual(["asthma"]);
  });

  it("returns at most `max` labels, counting only unique ones", () => {
    const labels = ["a", "a", "b", "b", "c", "d"];
    expect(uniqueLabels(labels, 3)).toEqual(["a", "b", "c"]);
  });

  it("returns fewer than `max` when there aren't enough unique labels", () => {
    expect(uniqueLabels(["a", "a", "A"], 10)).toEqual(["a"]);
  });

  it("returns an empty list for no labels", () => {
    expect(uniqueLabels([], 10)).toEqual([]);
  });

  it("does not modify the input", () => {
    const labels = ["b", "a", "b"];
    uniqueLabels(labels, 10);
    expect(labels).toEqual(["b", "a", "b"]);
  });
});
