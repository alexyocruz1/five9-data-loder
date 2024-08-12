# Stage all changes
git add .

# Run lint-staged
npx lint-staged

# Check if lint-staged passed
if [ $? -ne 0 ]; then
  echo "Lint-staged failed. Aborting commit."
  exit 1
fi

# Run tests
npm test

# Check if tests passed
if [ $? -ne 0 ]; then
  echo "Tests failed. Aborting commit."
  exit 1
fi