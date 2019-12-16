module.exports = {
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(__tests__/.*|[\\./](test|spec))\\.(t|j)sx?$",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    roots: ["<rootDir>"],
    collectCoverage: true,
    coverageReporters: ['html'],
};