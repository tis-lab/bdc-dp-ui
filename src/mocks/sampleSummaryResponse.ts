// Class-first SummaryResponse, inferred from schema/examples/SYNTHETIC.SummaryResponse-overview.yaml
// and SYNTHETIC.SummaryResponse-t2d.yaml. Enum members list only the values seen in
// those examples; widen them to match the schema before relying on exhaustiveness.

/** Compact URI, e.g. "palette:study_one" or "MONDO:0005148". */
export type Curie = string;

// ---------- Enums (observed values only) ----------

export type Sex = "FEMALE" | "MALE" | "UNKNOWN";

export type Race =
  | "WHITE"
  | "BLACK_OR_AFRICAN_AMERICAN"
  | "ASIAN"
  | "AMERICAN_INDIAN_OR_ALASKA_NATIVE"
  | "MIDDLE_EASTERN_OR_NORTH_AFRICAN"
  | "NATIVE_HAWAIIAN_OR_OTHER_PACIFIC_ISLANDER";

export type Ethnicity = "HISPANIC_OR_LATINO" | "NOT_HISPANIC_OR_LATINO";

export type ConditionStatus = "PRESENT" | "HISTORICAL" | "ABSENT" | "UNKNOWN";

export type ConditionProvenance = "PATIENT_SELF_REPORT";

export type RelationshipToParticipant = "ONESELF";

export type ResearchProjectType = "STUDY";

export type RelationSource = "CURATED";

// ---------- Shared building blocks ----------

/** Count for one study. A study is omitted when its count is suppressed (< min_count) or absent. */
export interface StudyCount {
  research_study: Curie;
  participant_count: number;
}

/**
 * A numeric bin. Open-ended bins omit one bound:
 * "-70mg_dL" has no bin_low, "126-mg_dL" has no bin_high.
 */
export interface Bin {
  bin_low?: number;
  bin_high?: number;
  /** UCUM unit, e.g. "a" (years) or "mg/dL". */
  bin_unit: string;
}

/** One summarized class (a slot, condition or measurement) and its values. */
export interface ClassSummary<V> {
  id: Curie;
  studies: StudyCount[];
  values: V[];
}

// ---------- Request: cohort expression ----------

export type CriterionType =
  | "CONDITION"
  | "OBSERVATION"
  | "DRUG_EXPOSURE"
  | "PROCEDURE"
  | "EXPOSURE";

/** Status applies to conditions only. */
export interface ConditionCriterion {
  criterionType: "CONDITION";
  concept: Curie;
  status: ConditionStatus[];
}

export interface ConceptCriterion {
  criterionType: Exclude<CriterionType, "CONDITION">;
  concept: Curie;
}

export type Criterion = ConditionCriterion | ConceptCriterion;

export type CriteriaNode = { criterion: Criterion } | { group: CriteriaGroup };

export interface CriteriaGroup {
  all?: CriteriaNode[];
  any?: CriteriaNode[];
  none?: CriteriaNode[];
}

export interface CohortExpression {
  release: string;
  criteria?: { group: CriteriaGroup };
}

export interface CohortSummaryVariables {
  expression: CohortExpression;
}

// ---------- Study metadata ----------

export interface ResearchStudy {
  id: Curie;
  name: string;
  research_project_type: ResearchProjectType;
  program: string;
  principal_investigator: string[];
}

export interface StudyTotal extends StudyCount {
  name: string;
}

// ---------- Vocabulary ----------

export interface Term {
  label: string;
  vocabulary: string;
  parents?: Curie[];
}

export interface Relation {
  subject: Curie;
  predicate: Curie;
  object: Curie;
  relation_source: RelationSource;
}

// ---------- Example records ----------

export interface RecordCondition {
  id: Curie;
  associated_participant: Curie;
  condition_concept: Curie;
  condition_provenance: ConditionProvenance;
  condition_status: ConditionStatus;
  relationship_to_participant: RelationshipToParticipant;
}

export interface RecordDemographic {
  id: Curie;
  associated_participant: Curie;
  sex: Sex;
  race: Race[];
  ethnicity: Ethnicity;
}

export interface RecordMeasurement {
  id: Curie;
  associated_participant: Curie;
  observation_type: string;
  /** Age in days. */
  age_at_observation: number;
}

export interface Records {
  record_conditions?: RecordCondition[];
  record_demographics?: RecordDemographic[];
  record_measurements?: RecordMeasurement[];
}

// ---------- Summary: participants ----------

export interface ParticipantValue extends Bin {
  id: Curie;
  summarized_slot: "age_at_index";
  studies: StudyCount[];
}

export interface ParticipantSummary extends ClassSummary<ParticipantValue> {
  summarized_slot: "age_at_index";
}

// ---------- Summary: demographics (discriminated on summarized_slot) ----------

interface DemographicValueBase {
  id: Curie;
  studies: StudyCount[];
}

export interface SexValue extends DemographicValueBase {
  summarized_slot: "sex";
  sex: Sex;
}

export interface RaceValue extends DemographicValueBase {
  summarized_slot: "race";
  race: Race[];
}

export interface EthnicityValue extends DemographicValueBase {
  summarized_slot: "ethnicity";
  ethnicity: Ethnicity;
}

export interface SexSummary extends ClassSummary<SexValue> {
  summarized_slot: "sex";
}

export interface RaceSummary extends ClassSummary<RaceValue> {
  summarized_slot: "race";
}

export interface EthnicitySummary extends ClassSummary<EthnicityValue> {
  summarized_slot: "ethnicity";
}

export type DemographicSummary = SexSummary | RaceSummary | EthnicitySummary;

// ---------- Summary: conditions ----------

export interface ConditionValue {
  id: Curie;
  condition_concept: Curie;
  condition_status: ConditionStatus;
  studies: StudyCount[];
}

export interface ConditionSummary extends ClassSummary<ConditionValue> {
  condition_concept: Curie;
}

// ---------- Summary: measurements ----------

export interface MeasurementValue extends Bin {
  id: Curie;
  observation_type: string;
  studies: StudyCount[];
}

export interface MeasurementSummary extends ClassSummary<MeasurementValue> {
  observation_type: string;
}

// ---------- Response ----------

export interface Summary {
  participants: ParticipantSummary[];
  demographics: DemographicSummary[];
  conditions?: ConditionSummary[];
  measurements?: MeasurementSummary[];
}

export interface SummaryResponse {
  release: string;
  /** Concepts the query is about, e.g. ["MONDO:0005148"]. */
  focus?: Curie[];
  /** Summary ids the cohort is filtered on, e.g. ["palette:measurement/FAST_GLUC_BLD"]. */
  filter?: Curie[];
  /** Counts below this are suppressed. */
  min_count: number;
  /** Labels for every CURIE in the response, keyed by CURIE. */
  terms: Record<Curie, Term>;
  relations?: Relation[];
  research_studies: ResearchStudy[];
  studies: StudyTotal[];
  records?: Records;
  summary: Summary;
}

/** One demographic value of any slot: SexValue | RaceValue | EthnicityValue. */
export type DemographicValue = DemographicSummary["values"][number];

// query for cohort summary
export const NESTED_SUMMARY_QUERY = `
  query NestedSummary($expression: CohortExpressionInput!) {
    summary(expression: $expression) {
      release
      focus
      filter
      min_count
      terms
      studies { research_study name participant_count }
      summary {
        demographics {
          id summarized_slot
          studies { research_study participant_count }
          values {
            id summarized_slot sex race ethnicity
            studies { research_study participant_count }
          }
        }
        conditions {
          id condition_concept
          studies { research_study participant_count }
          values {
            id condition_concept condition_status
            studies { research_study participant_count }
          }
        }
      }
    }
  }
`;

export interface CohortSummaryData {
  summary: SummaryResponse | null;
}

// query for available participants at landing
export const AVAILABLE_PARTICIPANTS_QUERY = `
  query AvailableParticipants($expression: CohortExpressionInput!) {
    summary(expression: $expression) {
      studies { research_study participant_count }
    }
  }
`;

export interface AvailableParticipantsData {
  summary: {
    studies: Pick<StudyTotal, "research_study" | "participant_count">[];
  } | null;
}

export const RELEASE = "2026.10";
