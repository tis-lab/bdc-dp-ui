// SYNTHETIC: illustrative counts for two fictional studies, not derived from
// participant data. Class-first copies of schema/examples/SYNTHETIC.SummaryResponse-*.yaml,
// used only as fixed responses in tests; the app reads the summary API.
import type { SummaryResponse } from "./sampleSummaryResponse";

/** Converted in full from schema/examples/SYNTHETIC.SummaryResponse-overview.yaml. */
export const overviewSummary: SummaryResponse = {
  release: "example-release",
  min_count: 10,
  research_studies: [
    {
      id: "palette:study_one",
      name: "Example Study One",
      research_project_type: "STUDY",
      program: "Example Program",
      principal_investigator: ["Example Investigator"],
    },
    {
      id: "palette:study_two",
      name: "Example Study Two",
      research_project_type: "STUDY",
      program: "Example Program",
      principal_investigator: ["Example Investigator"],
    },
  ],
  studies: [
    {
      research_study: "palette:study_one",
      participant_count: 1200,
      name: "Example Study One",
    },
    {
      research_study: "palette:study_two",
      participant_count: 1050,
      name: "Example Study Two",
    },
  ],
  summary: {
    participants: [
      {
        id: "palette:participant/age_at_index",
        summarized_slot: "age_at_index",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 1200,
          },
          {
            research_study: "palette:study_two",
            participant_count: 1050,
          },
        ],
        values: [
          {
            id: "palette:participant/age_at_index/45-55a",
            summarized_slot: "age_at_index",
            bin_low: 45,
            bin_high: 55,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 360,
              },
              {
                research_study: "palette:study_two",
                participant_count: 300,
              },
            ],
          },
          {
            id: "palette:participant/age_at_index/55-65a",
            summarized_slot: "age_at_index",
            bin_low: 55,
            bin_high: 65,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 420,
              },
              {
                research_study: "palette:study_two",
                participant_count: 380,
              },
            ],
          },
          {
            id: "palette:participant/age_at_index/65-80a",
            summarized_slot: "age_at_index",
            bin_low: 65,
            bin_high: 80,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 420,
              },
              {
                research_study: "palette:study_two",
                participant_count: 370,
              },
            ],
          },
        ],
      },
    ],
    demographics: [
      {
        id: "palette:demography/sex",
        summarized_slot: "sex",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 1200,
          },
          {
            research_study: "palette:study_two",
            participant_count: 1050,
          },
        ],
        values: [
          {
            id: "palette:demography/sex/FEMALE",
            summarized_slot: "sex",
            sex: "FEMALE",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 610,
              },
              {
                research_study: "palette:study_two",
                participant_count: 560,
              },
            ],
          },
          {
            id: "palette:demography/sex/MALE",
            summarized_slot: "sex",
            sex: "MALE",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 580,
              },
              {
                research_study: "palette:study_two",
                participant_count: 490,
              },
            ],
          },
          {
            id: "palette:demography/sex/UNKNOWN",
            summarized_slot: "sex",
            sex: "UNKNOWN",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 10,
              },
            ],
          },
        ],
      },
      {
        id: "palette:demography/race",
        summarized_slot: "race",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 1185,
          },
          {
            research_study: "palette:study_two",
            participant_count: 1040,
          },
        ],
        values: [
          {
            id: "palette:demography/race/WHITE",
            summarized_slot: "race",
            race: ["WHITE"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 590,
              },
              {
                research_study: "palette:study_two",
                participant_count: 620,
              },
            ],
          },
          {
            id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
            summarized_slot: "race",
            race: ["BLACK_OR_AFRICAN_AMERICAN"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 350,
              },
              {
                research_study: "palette:study_two",
                participant_count: 220,
              },
            ],
          },
          {
            id: "palette:demography/race/ASIAN",
            summarized_slot: "race",
            race: ["ASIAN"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 125,
              },
            ],
          },
          {
            id: "palette:demography/race/AMERICAN_INDIAN_OR_ALASKA_NATIVE",
            summarized_slot: "race",
            race: ["AMERICAN_INDIAN_OR_ALASKA_NATIVE"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 120,
              },
            ],
          },
          {
            id: "palette:demography/race/MIDDLE_EASTERN_OR_NORTH_AFRICAN",
            summarized_slot: "race",
            race: ["MIDDLE_EASTERN_OR_NORTH_AFRICAN"],
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 100,
              },
            ],
          },
          {
            id: "palette:demography/race/NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER",
            summarized_slot: "race",
            race: ["NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER"],
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 100,
              },
            ],
          },
        ],
      },
      {
        id: "palette:demography/ethnicity",
        summarized_slot: "ethnicity",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 1200,
          },
          {
            research_study: "palette:study_two",
            participant_count: 1050,
          },
        ],
        values: [
          {
            id: "palette:demography/ethnicity/HISPANIC_OR_LATINO",
            summarized_slot: "ethnicity",
            ethnicity: "HISPANIC_OR_LATINO",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 180,
              },
              {
                research_study: "palette:study_two",
                participant_count: 160,
              },
            ],
          },
          {
            id: "palette:demography/ethnicity/NOT_HISPANIC_OR_LATINO",
            summarized_slot: "ethnicity",
            ethnicity: "NOT_HISPANIC_OR_LATINO",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 1020,
              },
              {
                research_study: "palette:study_two",
                participant_count: 890,
              },
            ],
          },
        ],
      },
    ],
  },
  terms: {},
};

/** Converted in full from schema/examples/SYNTHETIC.SummaryResponse-t2d.yaml. */
export const t2dSummary: SummaryResponse = {
  release: "example-release",
  focus: ["MONDO:0005148"],
  filter: ["palette:measurement/FAST_GLUC_BLD"],
  min_count: 10,
  terms: {
    "MONDO:0005148": {
      label: "type 2 diabetes mellitus",
      vocabulary: "MONDO",
      parents: ["MONDO:0005015"],
    },
    "MONDO:0005015": {
      label: "diabetes mellitus",
      vocabulary: "MONDO",
    },
    "MONDO:0005267": {
      label: "heart disorder",
      vocabulary: "MONDO",
    },
    "MONDO:0024643": {
      label: "myocardial disorder",
      vocabulary: "MONDO",
      parents: ["MONDO:0005267"],
    },
    "MONDO:0005068": {
      label: "myocardial infarction",
      vocabulary: "MONDO",
      parents: ["MONDO:0024643"],
    },
    "MONDO:0005252": {
      label: "heart failure",
      vocabulary: "MONDO",
      parents: ["MONDO:0005267"],
    },
    "OMOP:4156660": {
      label: "Fasting blood glucose measurement",
      vocabulary: "SNOMED",
    },
  },
  relations: [
    {
      subject: "MONDO:0005015",
      predicate: "biolink:has_biomarker",
      object: "OMOP:4156660",
      relation_source: "CURATED",
    },
  ],
  research_studies: [
    {
      id: "palette:study_one",
      name: "Example Study One",
      research_project_type: "STUDY",
      program: "Example Program",
      principal_investigator: ["Example Investigator"],
    },
    {
      id: "palette:study_two",
      name: "Example Study Two",
      research_project_type: "STUDY",
      program: "Example Program",
      principal_investigator: ["Example Investigator"],
    },
  ],
  studies: [
    {
      research_study: "palette:study_one",
      participant_count: 480,
      name: "Example Study One",
    },
    {
      research_study: "palette:study_two",
      participant_count: 460,
      name: "Example Study Two",
    },
  ],
  records: {
    record_conditions: [
      {
        id: "palette:example/condition-1",
        associated_participant: "palette:example/participant-1",
        condition_concept: "MONDO:0005148",
        condition_provenance: "PATIENT_SELF_REPORT",
        condition_status: "PRESENT",
        relationship_to_participant: "ONESELF",
      },
    ],
    record_demographics: [
      {
        id: "palette:example/demography-1",
        associated_participant: "palette:example/participant-1",
        sex: "FEMALE",
        race: ["WHITE"],
        ethnicity: "NOT_HISPANIC_OR_LATINO",
      },
    ],
    record_measurements: [
      {
        id: "palette:example/glucose-1",
        associated_participant: "palette:example/participant-1",
        observation_type: "FAST_GLUC_BLD",
        age_at_observation: 22280,
      },
    ],
  },
  summary: {
    participants: [
      {
        id: "palette:participant/age_at_index",
        summarized_slot: "age_at_index",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:participant/age_at_index/45-55a",
            summarized_slot: "age_at_index",
            bin_low: 45,
            bin_high: 55,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 130,
              },
              {
                research_study: "palette:study_two",
                participant_count: 130,
              },
            ],
          },
          {
            id: "palette:participant/age_at_index/55-65a",
            summarized_slot: "age_at_index",
            bin_low: 55,
            bin_high: 65,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 165,
              },
              {
                research_study: "palette:study_two",
                participant_count: 165,
              },
            ],
          },
          {
            id: "palette:participant/age_at_index/65-80a",
            summarized_slot: "age_at_index",
            bin_low: 65,
            bin_high: 80,
            bin_unit: "a",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 185,
              },
              {
                research_study: "palette:study_two",
                participant_count: 165,
              },
            ],
          },
        ],
      },
    ],
    demographics: [
      {
        id: "palette:demography/sex",
        summarized_slot: "sex",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:demography/sex/FEMALE",
            summarized_slot: "sex",
            sex: "FEMALE",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 230,
              },
              {
                research_study: "palette:study_two",
                participant_count: 250,
              },
            ],
          },
          {
            id: "palette:demography/sex/MALE",
            summarized_slot: "sex",
            sex: "MALE",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 245,
              },
              {
                research_study: "palette:study_two",
                participant_count: 205,
              },
            ],
          },
        ],
      },
      {
        id: "palette:demography/race",
        summarized_slot: "race",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 470,
          },
          {
            research_study: "palette:study_two",
            participant_count: 455,
          },
        ],
        values: [
          {
            id: "palette:demography/race/WHITE",
            summarized_slot: "race",
            race: ["WHITE"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 235,
              },
              {
                research_study: "palette:study_two",
                participant_count: 275,
              },
            ],
          },
          {
            id: "palette:demography/race/BLACK_OR_AFRICAN_AMERICAN",
            summarized_slot: "race",
            race: ["BLACK_OR_AFRICAN_AMERICAN"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 141,
              },
              {
                research_study: "palette:study_two",
                participant_count: 90,
              },
            ],
          },
          {
            id: "palette:demography/race/ASIAN",
            summarized_slot: "race",
            race: ["ASIAN"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 47,
              },
            ],
          },
          {
            id: "palette:demography/race/AMERICAN_INDIAN_OR_ALASKA_NATIVE",
            summarized_slot: "race",
            race: ["AMERICAN_INDIAN_OR_ALASKA_NATIVE"],
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 47,
              },
            ],
          },
          {
            id: "palette:demography/race/MIDDLE_EASTERN_OR_NORTH_AFRICAN",
            summarized_slot: "race",
            race: ["MIDDLE_EASTERN_OR_NORTH_AFRICAN"],
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 45,
              },
            ],
          },
          {
            id: "palette:demography/race/NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER",
            summarized_slot: "race",
            race: ["NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER"],
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 45,
              },
            ],
          },
        ],
      },
      {
        id: "palette:demography/ethnicity",
        summarized_slot: "ethnicity",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:demography/ethnicity/HISPANIC_OR_LATINO",
            summarized_slot: "ethnicity",
            ethnicity: "HISPANIC_OR_LATINO",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 70,
              },
              {
                research_study: "palette:study_two",
                participant_count: 70,
              },
            ],
          },
          {
            id: "palette:demography/ethnicity/NOT_HISPANIC_OR_LATINO",
            summarized_slot: "ethnicity",
            ethnicity: "NOT_HISPANIC_OR_LATINO",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 410,
              },
              {
                research_study: "palette:study_two",
                participant_count: 390,
              },
            ],
          },
        ],
      },
    ],
    conditions: [
      {
        id: "palette:condition/MONDO_0005148",
        condition_concept: "MONDO:0005148",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 470,
          },
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:condition/MONDO_0005148/PRESENT",
            condition_concept: "MONDO:0005148",
            condition_status: "PRESENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 90,
              },
              {
                research_study: "palette:study_two",
                participant_count: 80,
              },
            ],
          },
          {
            id: "palette:condition/MONDO_0005148/ABSENT",
            condition_concept: "MONDO:0005148",
            condition_status: "ABSENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 380,
              },
              {
                research_study: "palette:study_two",
                participant_count: 365,
              },
            ],
          },
          {
            id: "palette:condition/MONDO_0005148/UNKNOWN",
            condition_concept: "MONDO:0005148",
            condition_status: "UNKNOWN",
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 15,
              },
            ],
          },
        ],
      },
      {
        id: "palette:condition/MONDO_0005068",
        condition_concept: "MONDO:0005068",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
        ],
        values: [
          {
            id: "palette:condition/MONDO_0005068/PRESENT",
            condition_concept: "MONDO:0005068",
            condition_status: "PRESENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 40,
              },
            ],
          },
          {
            id: "palette:condition/MONDO_0005068/ABSENT",
            condition_concept: "MONDO:0005068",
            condition_status: "ABSENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 440,
              },
            ],
          },
        ],
      },
      {
        id: "palette:condition/MONDO_0005252",
        condition_concept: "MONDO:0005252",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
        ],
        values: [
          {
            id: "palette:condition/MONDO_0005252/PRESENT",
            condition_concept: "MONDO:0005252",
            condition_status: "PRESENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 35,
              },
            ],
          },
          {
            id: "palette:condition/MONDO_0005252/ABSENT",
            condition_concept: "MONDO:0005252",
            condition_status: "ABSENT",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 445,
              },
            ],
          },
        ],
      },
      {
        id: "palette:condition/MONDO_0005267",
        condition_concept: "MONDO:0005267",
        studies: [
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:condition/MONDO_0005267/PRESENT",
            condition_concept: "MONDO:0005267",
            condition_status: "PRESENT",
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 95,
              },
            ],
          },
          {
            id: "palette:condition/MONDO_0005267/ABSENT",
            condition_concept: "MONDO:0005267",
            condition_status: "ABSENT",
            studies: [
              {
                research_study: "palette:study_two",
                participant_count: 365,
              },
            ],
          },
        ],
      },
    ],
    measurements: [
      {
        id: "palette:measurement/FAST_GLUC_BLD",
        observation_type: "FAST_GLUC_BLD",
        studies: [
          {
            research_study: "palette:study_one",
            participant_count: 480,
          },
          {
            research_study: "palette:study_two",
            participant_count: 460,
          },
        ],
        values: [
          {
            id: "palette:measurement/FAST_GLUC_BLD/-70mg_dL",
            observation_type: "FAST_GLUC_BLD",
            bin_high: 70,
            bin_unit: "mg/dL",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 18,
              },
              {
                research_study: "palette:study_two",
                participant_count: 17,
              },
            ],
          },
          {
            id: "palette:measurement/FAST_GLUC_BLD/70-100mg_dL",
            observation_type: "FAST_GLUC_BLD",
            bin_low: 70,
            bin_high: 100,
            bin_unit: "mg/dL",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 240,
              },
              {
                research_study: "palette:study_two",
                participant_count: 230,
              },
            ],
          },
          {
            id: "palette:measurement/FAST_GLUC_BLD/100-126mg_dL",
            observation_type: "FAST_GLUC_BLD",
            bin_low: 100,
            bin_high: 126,
            bin_unit: "mg/dL",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 112,
              },
              {
                research_study: "palette:study_two",
                participant_count: 93,
              },
            ],
          },
          {
            id: "palette:measurement/FAST_GLUC_BLD/126-mg_dL",
            observation_type: "FAST_GLUC_BLD",
            bin_low: 126,
            bin_unit: "mg/dL",
            studies: [
              {
                research_study: "palette:study_one",
                participant_count: 110,
              },
              {
                research_study: "palette:study_two",
                participant_count: 120,
              },
            ],
          },
        ],
      },
    ],
  },
};
