export default {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  testResultsProcessor: "jest-sonar-reporter",
  coverageDirectory: "testResults/coverage",
  coverageReporters: ["json", "lcov", "cobertura", "html", "text"],
};
