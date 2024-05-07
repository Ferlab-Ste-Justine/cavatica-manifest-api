module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
            },
        ],
    },
    testMatch: ['**/src/**/*.test.(ts|js)'],
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: ['src/index.ts', 'src/config/keycloak.ts'],
    coverageDirectory: '<rootDir>/coverage/',
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 75,
            lines: 75,
            statements: 75,
        },
    },
};
