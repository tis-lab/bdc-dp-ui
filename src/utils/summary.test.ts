import { describe, it, expect } from "vitest";
import {
  cohortParticipants,
  demographicBreakdown,
  humanize,
  percentOf,
} from "./summary";
import { t2dFemaleSummary, t2dSummary } from "../mocks/SYNTHETIC.cohortSummary";

describe("humanize", () => {
  it.each([
    ["FEMALE", "Female"],
    ["BLACK_OR_AFRICAN_AMERICAN", "Black or African American"],
    ["NOT_HISPANIC_OR_LATINO", "Not Hispanic or Latino"],
  ])("%s → %s", (code, label) => {
    expect(humanize(code)).toBe(label);
  });
});

describe("cohortParticipants", () => {
  it("sums participants across studies", () => {
    expect(cohortParticipants(t2dSummary)).toBe(940);
    expect(cohortParticipants(t2dFemaleSummary)).toBe(480);
  });
});

describe("percentOf", () => {
  it("rounds to a whole percentage", () => {
    expect(percentOf(480, 940)).toBe(51);
  });

  it("is 0 for an empty cohort, not NaN", () => {
    expect(percentOf(0, 0)).toBe(0);
  });
});

describe("demographicBreakdown", () => {
  it("sums sex across studies, with the remainder as not reported", () => {
    expect(demographicBreakdown(t2dSummary, "sex")).toEqual([
      { label: "Female", count: 480 },
      { label: "Male", count: 450 },
      { label: "Not reported", count: 10 },
    ]);
  });

  it("orders race categories largest first, not reported last", () => {
    expect(demographicBreakdown(t2dSummary, "race")).toEqual([
      { label: "White", count: 510 },
      { label: "Black or African American", count: 231 },
      { label: "Asian", count: 47 },
      { label: "American Indian or Alaska Native", count: 47 },
      { label: "Middle Eastern or North African", count: 45 },
      { label: "Native Hawaiian or Other Pacific Islander", count: 45 },
      { label: "Not reported", count: 15 },
    ]);
  });

  it("omits not reported when every participant is accounted for", () => {
    expect(demographicBreakdown(t2dSummary, "ethnicity")).toEqual([
      { label: "Not Hispanic or Latino", count: 800 },
      { label: "Hispanic or Latino", count: 140 },
    ]);
  });

  it("is empty when no study reports the slot", () => {
    expect(demographicBreakdown(t2dFemaleSummary, "ethnicity")).toEqual([]);
  });
});
