// Test JavaScript file to verify pre-commit hook
const testFunction = () => {
  console.log('This is a test JS file');
  return 'Should be blocked by pre-commit hook';
};

module.exports = testFunction;
