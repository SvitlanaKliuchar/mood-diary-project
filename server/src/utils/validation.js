//input validation utilities
export const validateUserId = (userId) => {
  if (!userId) {
    throw new Error("UserId is required");
  }

  if (typeof userId !== "number") {
    throw new Error("UserId must be a number");
  }

  if (!Number.isInteger(userId)) {
    throw new Error("UserId must be an integer");
  }

  if (userId <= 0) {
    throw new Error("UserId must be positive");
  }

  return userId;
};

export const validatePositiveInteger = (value, fieldName = "value") => {
  if (
    !value ||
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new Error(`Invalid ${fieldName}: must be a positive integer`);
  }
  return value;
};
