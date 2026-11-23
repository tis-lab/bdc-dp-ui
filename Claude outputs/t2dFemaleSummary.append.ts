// Append to the end of src/mocks/SYNTHETIC.cohortSummary.ts (after t2dSummary).

/**
 * Class-first copy of the earlier trimmed t2d-female fixture (from
 * schema/examples/SYNTHETIC.SummaryResponse-t2d-female.yaml). Ethnicity is
 * omitted on purpose: no study reports it.
 */
export const t2dFemaleSummary: SummaryResponse = {
  release: "example-release",
  focus: ["MONDO:0005148"],
  min_count: 10,
  terms: {},
  research_studies: t2dSummary.research_studies,
  studies: [
    {
      research_study: "palette:study_one",
      participant_count: 230,
      name: "Example Study One",
    },
    {
      research_study: "palette:study_two",
      participant_count: 250,
      name: "Example Study Two",
    },
  ],
  summary: {
    participants: [],
    demographics: [
      {
        id: "palette:demography/sex",
        summarized_slot: "sex",
        studies: [
          { research_study: "palette:study_one", participant_count: 230 },
          { research_study: "palette:study_two", participant_count: 250 },
        ],
        values: [
          {
            id: "palette:demography/sex/FEMALE",
            summarized_slot: "sex",
            sex: "FEMALE",
            studies: [
              { research_study: "palette:study_one", participant_count: 230 },
              { research_study: "palette:study_two", participant_count: 250 },
            ],
          },
        ],
      },
      {
        id: "palette:demography/race",
        summarized_slot: "race",
        studies: [
          { research_study: "palette:study_one", participant_count: 227 },
          { research_study: "palette:study_two", participant_count: 246 },
        ],
        values: [
          {
            id: "palette:demography/race/WHITE",
            summarized_slot: "race",
            race: ["WHITE"],
            studies: [
              { research_study: "palette:study_one", participant_count: 115 },
              { research_study: "palette:study_two", participant_count: 150 },
            ],
          },
          {
            id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
            summarized_slot: "race",
            race: ["BLACK_OR_AFRICAN_AMERICAN"],
            studies: [
              { research_study: "palette:study_one", participant_count: 70 },
              { research_study: "palette:study_two", participant_count: 50 },
            ],
          },
          {
            id: "palette:demography/race/ASIAN",
            summarized_slot: "race",
            race: ["ASIAN"],
            studies: [
              { research_study: "palette:study_one", participant_count: 22 },
            ],
          },
          {
            id: "palette:demography/race/AMERICAN_INDIAN_OR_ALASKA_NATIVE",
            summarized_slot: "race",
            race: ["AMERICAN_INDIAN_OR_ALASKA_NATIVE"],
            studies: [
              { research_study: "palette:study_one", participant_count: 20 },
            ],
          },
          {
            id: "palette:demography/race/MIDDLE_EASTERN_OR_NORTH_AFRICAN",
            summarized_slot: "race",
            race: ["MIDDLE_EASTERN_OR_NORTH_AFRICAN"],
            studies: [
              { research_study: "palette:study_two", participant_count: 22 },
            ],
          },
          {
            id: "palette:demography/race/NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER",
            summarized_slot: "race",
            race: ["NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER"],
            studies: [
              { research_study: "palette:study_two", participant_count: 24 },
            ],
          },
        ],
      },
    ],
  },
};
