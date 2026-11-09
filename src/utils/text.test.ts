import { enumToLabel } from "./text";

describe("enumToLabel", () => {
  it.each([
    ["FEMALE", "Female"],
    ["BLACK_OR_AFRICAN_AMERICAN", "Black or African American"],
    ["NOT_HISPANIC_OR_LATINO", "Not Hispanic or Latino"],
  ])("%s → %s", (code, label) => {
    expect(enumToLabel(code)).toBe(label);
  });
});
