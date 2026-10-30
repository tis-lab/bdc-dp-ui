import { illustrateSummary, illustrativeParticipants } from "./placeholders";
import { t2dSummary } from "./mocks/SYNTHETIC.cohortSummary";
import type { SearchItem } from "./api/graphql/queries/resolveTerms";

describe("illustrativeParticipants", () => {
  it("widens with each include under OR", () => {
    expect(illustrativeParticipants(940, 1, 0, "any")).toBe(990);
    expect(illustrativeParticipants(940, 2, 0, "any")).toBe(1040);
  });

  it("narrows with each include after the first under AND", () => {
    expect(illustrativeParticipants(940, 1, 0, "all")).toBe(990);
    expect(illustrativeParticipants(940, 2, 0, "all")).toBe(940);
    expect(illustrativeParticipants(940, 3, 0, "all")).toBe(890);
  });

  it("takes 70 per exclude", () => {
    expect(illustrativeParticipants(940, 2, 1, "any")).toBe(970);
  });

  it("never goes below zero", () => {
    expect(illustrativeParticipants(100, 0, 5, "all")).toBe(0);
  });
});

describe("illustrateSummary", () => {
  const concept = { __typename: "Term", id: "MONDO:0005148" } as SearchItem;

  it("keeps the response's structure, spreading the new total across studies", () => {
    const summary = illustrateSummary(t2dSummary, {
      include: [concept],
      exclude: [],
      match: "all",
    });

    expect(summary.studies.map((s) => s.participant_count)).toEqual([506, 484]);
    expect({ ...summary, studies: [] }).toEqual({ ...t2dSummary, studies: [] });
    expect(summary.studies[1].demographics).toEqual(
      t2dSummary.studies[1].demographics,
    );
  });
});
