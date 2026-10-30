import { describe, it, expect } from "vitest";
import parseCurie from "./parseCurie";

// ----------------------------------------------------------------------

describe("parseCurie", () => {
  describe("splitting", () => {
    it("splits a CURIE into source and id", () => {
      expect(parseCurie("biolink:Disease")).toEqual({
        raw: "biolink:Disease",
        source: "biolink",
        id: "Disease",
        label: "Disease",
      });
    });

    it("treats a value without a prefix as an id with no source", () => {
      expect(parseCurie("Disease or Syndrome")).toEqual({
        raw: "Disease or Syndrome",
        source: "",
        id: "Disease or Syndrome",
        label: "Disease or Syndrome",
      });
    });

    it("splits only at the first colon", () => {
      expect(parseCurie("obo:GO:0008150")).toMatchObject({
        source: "obo",
        id: "GO:0008150",
        label: "GO:0008150",
      });
    });

    it("always preserves the raw input", () => {
      expect(parseCurie("biolink:RNAProduct").raw).toBe("biolink:RNAProduct");
    });
  });

  describe("label", () => {
    it.each([
      // [input, expected label]
      ["biolink:Disease", "Disease"],
      ["biolink:NamedThing", "Named Thing"],
      ["biolink:GeneOrGeneProduct", "Gene Or Gene Product"],
      // Acronym followed by a word
      ["biolink:RNAProduct", "RNA Product"],
      ["biolink:RNAProductIsoform", "RNA Product Isoform"],
      // Word followed by an acronym
      ["biolink:MicroRNA", "Micro RNA"],
      // All caps stays together
      ["biolink:SNP", "SNP"],
      // Humanizes prefix-less values too
      ["NamedThing", "Named Thing"],
    ])("humanizes %j as %j", (input, label) => {
      expect(parseCurie(input).label).toBe(label);
    });

    it("leaves already spaced text unchanged", () => {
      expect(parseCurie("Disease or Syndrome").label).toBe(
        "Disease or Syndrome",
      );
    });
  });

  describe("edge cases", () => {
    it("handles an empty string", () => {
      expect(parseCurie("")).toEqual({
        raw: "",
        source: "",
        id: "",
        label: "",
      });
    });

    it("handles a prefix with no id", () => {
      expect(parseCurie("biolink:")).toMatchObject({
        source: "biolink",
        id: "",
        label: "",
      });
    });

    it("handles an id with an empty prefix", () => {
      expect(parseCurie(":Disease")).toMatchObject({
        source: "",
        id: "Disease",
        label: "Disease",
      });
    });

    it("ignores surrounding whitespace", () => {
      expect(parseCurie("  biolink:Disease  ")).toEqual({
        raw: "biolink:Disease",
        source: "biolink",
        id: "Disease",
        label: "Disease",
      });
    });
  });
});
