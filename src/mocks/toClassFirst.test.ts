import { toClassFirst } from "./toClassFirst";
import { cohortTotals } from "../utils/summary";
import { t2dFemaleSummary, t2dSummary } from "./SYNTHETIC.cohortSummary";
import {
  legacyT2dFemaleSummary,
  legacyT2dSummary,
} from "./SYNTHETIC.legacyCohortSummary";

/** Fails the test with a clear message instead of a later "cannot read properties of undefined". */
const required = <T>(value: T | undefined, what: string): T => {
  if (value === undefined) throw new Error(`toClassFirst dropped ${what}`);
  return value;
};

// Take thresholds from the class-first fixtures so the adapter can't drift from them.
const t2d = () => toClassFirst(legacyT2dSummary, t2dSummary.min_count);
const t2dFemale = () =>
  toClassFirst(legacyT2dFemaleSummary, t2dFemaleSummary.min_count);

const demographicsOf = (summary: ReturnType<typeof toClassFirst>) =>
  required(summary.summary.demographics, "demographics");

// TODO: delete with toClassFirst once the endpoint returns the class-first shape.
describe("toClassFirst", () => {
  it("keeps each study's total", () => {
    expect(t2d().studies).toEqual([
      expect.objectContaining({
        research_study: "palette:study_one",
        participant_count: 480,
      }),
      expect.objectContaining({
        research_study: "palette:study_two",
        participant_count: 460,
      }),
    ]);
  });

  it("uses the given min_count rather than inventing one", () => {
    expect(t2d().min_count).toBe(t2dSummary.min_count);
    expect(toClassFirst(legacyT2dSummary, 25).min_count).toBe(25);
  });

  it("groups per-study demographics into one entry per slot", () => {
    const sex = demographicsOf(t2d()).find((d) => d.summarized_slot === "sex");

    expect(sex?.studies).toEqual([
      { research_study: "palette:study_one", participant_count: 480 },
      { research_study: "palette:study_two", participant_count: 460 },
    ]);
    expect(sex?.values).toContainEqual({
      id: "palette:demography/sex/FEMALE",
      summarized_slot: "sex",
      sex: "FEMALE",
      studies: [
        { research_study: "palette:study_one", participant_count: 230 },
        { research_study: "palette:study_two", participant_count: 250 },
      ],
    });
  });

  it("keeps a value reported by only one study", () => {
    const race = demographicsOf(t2d()).find(
      (d) => d.summarized_slot === "race",
    );

    expect(race?.values).toContainEqual({
      id: "palette:demography/race/ASIAN",
      summarized_slot: "race",
      race: ["ASIAN"],
      studies: [{ research_study: "palette:study_one", participant_count: 47 }],
    });
  });

  it("omits a slot that no study reports", () => {
    const slots = demographicsOf(t2dFemale()).map((d) => d.summarized_slot);

    expect(slots).toEqual(["sex", "race"]);
  });

  it("gives the same totals as the class-first fixtures", () => {
    expect(cohortTotals(t2d())).toEqual(cohortTotals(t2dSummary));
    expect(cohortTotals(t2dFemale())).toEqual(cohortTotals(t2dFemaleSummary));
  });
});
