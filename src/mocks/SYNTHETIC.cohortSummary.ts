// SYNTHETIC: illustrative counts for two fictional studies, not derived from
// participant data. Trimmed copies of schema/examples/SYNTHETIC.SummaryResponse-*.yaml,
// used only as fixed responses in tests; the app reads the summary API.
import type { SummaryResponse } from "../api/graphql/queries/cohortSummary";


/** Trimmed from schema/examples/SYNTHETIC.SummaryResponse-t2d.yaml. */
export const t2dSummary: SummaryResponse = {
  studies: [
    {
      research_study: "palette:study_one",
      participant_count: 480,
      demographics: [
        {
          id: "palette:demography/sex",
          summarized_slot: "sex",
          participant_count: 480,
          values: [
            {
              id: "palette:demography/sex/FEMALE",
              sex: "FEMALE",
              participant_count: 230
            },
            {
              id: "palette:demography/sex/MALE",
              sex: "MALE",
              participant_count: 245
            }
          ]
        },
        {
          id: "palette:demography/race",
          summarized_slot: "race",
          participant_count: 470,
          values: [
            {
              id: "palette:demography/race/WHITE",
              race: [
                "WHITE"
              ],
              participant_count: 235
            },
            {
              id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
              race: [
                "BLACK_OR_AFRICAN_AMERICAN"
              ],
              participant_count: 141
            },
            {
              id: "palette:demography/race/ASIAN",
              race: [
                "ASIAN"
              ],
              participant_count: 47
            },
            {
              id: "palette:demography/race/AMERICAN_INDIAN_OR_ALASKA_NATIVE",
              race: [
                "AMERICAN_INDIAN_OR_ALASKA_NATIVE"
              ],
              participant_count: 47
            }
          ]
        },
        {
          id: "palette:demography/ethnicity",
          summarized_slot: "ethnicity",
          participant_count: 480,
          values: [
            {
              id: "palette:demography/ethnicity/HISPANIC_OR_LATINO",
              ethnicity: "HISPANIC_OR_LATINO",
              participant_count: 70
            },
            {
              id: "palette:demography/ethnicity/NOT_HISPANIC_OR_LATINO",
              ethnicity: "NOT_HISPANIC_OR_LATINO",
              participant_count: 410
            }
          ]
        }
      ]
    },
    {
      research_study: "palette:study_two",
      participant_count: 460,
      demographics: [
        {
          id: "palette:demography/sex",
          summarized_slot: "sex",
          participant_count: 460,
          values: [
            {
              id: "palette:demography/sex/FEMALE",
              sex: "FEMALE",
              participant_count: 250
            },
            {
              id: "palette:demography/sex/MALE",
              sex: "MALE",
              participant_count: 205
            }
          ]
        },
        {
          id: "palette:demography/race",
          summarized_slot: "race",
          participant_count: 455,
          values: [
            {
              id: "palette:demography/race/WHITE",
              race: [
                "WHITE"
              ],
              participant_count: 275
            },
            {
              id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
              race: [
                "BLACK_OR_AFRICAN_AMERICAN"
              ],
              participant_count: 90
            },
            {
              id: "palette:demography/race/MIDDLE_EASTERN_OR_NORTH_AFRICAN",
              race: [
                "MIDDLE_EASTERN_OR_NORTH_AFRICAN"
              ],
              participant_count: 45
            },
            {
              id: "palette:demography/race/NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER",
              race: [
                "NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER"
              ],
              participant_count: 45
            }
          ]
        },
        {
          id: "palette:demography/ethnicity",
          summarized_slot: "ethnicity",
          participant_count: 460,
          values: [
            {
              id: "palette:demography/ethnicity/HISPANIC_OR_LATINO",
              ethnicity: "HISPANIC_OR_LATINO",
              participant_count: 70
            },
            {
              id: "palette:demography/ethnicity/NOT_HISPANIC_OR_LATINO",
              ethnicity: "NOT_HISPANIC_OR_LATINO",
              participant_count: 390
            }
          ]
        }
      ]
    }
  ]
};

/** Trimmed from schema/examples/SYNTHETIC.SummaryResponse-t2d-female.yaml. */
export const t2dFemaleSummary: SummaryResponse = {
  studies: [
    {
      research_study: "palette:study_one",
      participant_count: 230,
      demographics: [
        {
          id: "palette:demography/sex",
          summarized_slot: "sex",
          participant_count: 230,
          values: [
            {
              id: "palette:demography/sex/FEMALE",
              sex: "FEMALE",
              participant_count: 230
            }
          ]
        },
        {
          id: "palette:demography/race",
          summarized_slot: "race",
          participant_count: 227,
          values: [
            {
              id: "palette:demography/race/WHITE",
              race: [
                "WHITE"
              ],
              participant_count: 115
            },
            {
              id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
              race: [
                "BLACK_OR_AFRICAN_AMERICAN"
              ],
              participant_count: 70
            },
            {
              id: "palette:demography/race/ASIAN",
              race: [
                "ASIAN"
              ],
              participant_count: 22
            },
            {
              id: "palette:demography/race/AMERICAN_INDIAN_OR_ALASKA_NATIVE",
              race: [
                "AMERICAN_INDIAN_OR_ALASKA_NATIVE"
              ],
              participant_count: 20
            }
          ]
        }
      ]
    },
    {
      research_study: "palette:study_two",
      participant_count: 250,
      demographics: [
        {
          id: "palette:demography/sex",
          summarized_slot: "sex",
          participant_count: 250,
          values: [
            {
              id: "palette:demography/sex/FEMALE",
              sex: "FEMALE",
              participant_count: 250
            }
          ]
        },
        {
          id: "palette:demography/race",
          summarized_slot: "race",
          participant_count: 246,
          values: [
            {
              id: "palette:demography/race/WHITE",
              race: [
                "WHITE"
              ],
              participant_count: 150
            },
            {
              id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
              race: [
                "BLACK_OR_AFRICAN_AMERICAN"
              ],
              participant_count: 50
            },
            {
              id: "palette:demography/race/MIDDLE_EASTERN_OR_NORTH_AFRICAN",
              race: [
                "MIDDLE_EASTERN_OR_NORTH_AFRICAN"
              ],
              participant_count: 22
            },
            {
              id: "palette:demography/race/NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER",
              race: [
                "NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER"
              ],
              participant_count: 24
            }
          ]
        }
      ]
    }
  ]
};
