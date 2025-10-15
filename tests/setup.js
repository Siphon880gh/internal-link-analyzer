// Jest setup file for global test configuration

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock fs-extra to avoid file system operations in tests
jest.mock('fs-extra', () => ({
  ...jest.requireActual('fs-extra'),
  pathExists: jest.fn(),
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
  readdir: jest.fn(),
  statSync: jest.fn(),
}));

// Mock inquirer for UI tests
jest.mock('inquirer', () => ({
  prompt: jest.fn(),
}));

// Mock cli-progress
jest.mock('cli-progress', () => ({
  SingleBar: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    update: jest.fn(),
    stop: jest.fn(),
  })),
}));

// Mock chalk to avoid color output in tests
jest.mock('chalk', () => {
  const mockChalk = (text) => text;
  mockChalk.blue = mockChalk;
  mockChalk.green = mockChalk;
  mockChalk.red = mockChalk;
  mockChalk.yellow = mockChalk;
  mockChalk.cyan = mockChalk;
  mockChalk.gray = mockChalk;
  mockChalk.white = mockChalk;
  mockChalk.bold = mockChalk;
  
  // Nested properties
  mockChalk.blue.bold = mockChalk;
  mockChalk.green.bold = mockChalk;
  mockChalk.red.bold = mockChalk;
  mockChalk.yellow.bold = mockChalk;
  mockChalk.cyan.bold = mockChalk;
  
  return mockChalk;
});
