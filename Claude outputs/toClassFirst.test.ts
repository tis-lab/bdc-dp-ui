import { toClassFirst } from "./toClassFirst";
import { cohortTotals } from "../utils/summary";
import { t2dFemaleSummary, t2dSummary } from "./SYNTHETIC.cohortSummary";
import {
  legacyT2dFemaleSummary,
  legacyT2dSummary,
} from "./SYNTHETIC.legacyCohortSummary";

// TODO: delete with toClassFirst once the endpoint returns the class-first shape.
describe("toClassFirst", () => {
  it("keeps each study's total", () => {
    expect(toClassFirst(legacyT2dSummary).studies).toEqual([
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

  it("groups per-study demographics into one entry per slot", () => {
    const sex = toClassFirst(legacyT2dSummary).summary.demographics.find(
      (d) => d.summarized_slot === "sex",
    );

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
    const race = toClassFirst(legacyT2dSummary).summary.demographics.find(
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
    const slots = toClassFirst(
      legacyT2dFemaleSummary,
    ).summary.demographics.map((d) => d.summarized_slot);

    expect(slots).toEqual(["sex", "race"]);
  });

  it("gives the same totals as the class-first fixtures", () => {
    expect(cohortTotals(toClassFirst(legacyT2dSummary))).toEqual(
      cohortTotals(t2dSummary),
    );
    expect(cohortTotals(toClassFirst(legacyT2dFemaleSummary))).toEqual(
      cohortTotals(t2dFemaleSummary),
    );
  });
});
