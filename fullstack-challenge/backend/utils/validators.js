// Shared validation helpers used across routes.

const NAME_MIN = 20;
const NAME_MAX = 60;
const ADDRESS_MAX = 400;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']).{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(name) {
  if (typeof name !== 'string') return 'Name is required.';
  const len = name.trim().length;
  if (len < NAME_MIN || len > NAME_MAX) {
    return `Name must be between ${NAME_MIN} and ${NAME_MAX} characters.`;
  }
  return null;
}

function validateAddress(address) {
  if (typeof address !== 'string' || address.trim().length === 0) {
    return 'Address is required.';
  }
  if (address.length > ADDRESS_MAX) {
    return `Address must be at most ${ADDRESS_MAX} characters.`;
  }
  return null;
}

function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return 'A valid email is required.';
  }
  return null;
}

function validatePassword(password) {
  if (typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    return 'Password must be 8-16 characters and include at least one uppercase letter and one special character.';
  }
  return null;
}

function validateRating(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

module.exports = {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
  validateRating,
};
