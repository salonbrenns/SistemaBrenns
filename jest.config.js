const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
  'src/lib/**/*.ts',
  'src/components/**/*.tsx',
  '!src/**/*.d.ts',
  '!src/**/index.ts',
  ],
}

module.exports = createJestConfig(config)