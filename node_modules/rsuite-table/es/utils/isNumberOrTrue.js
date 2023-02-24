export default function isNumberOrTrue(value) {
  if (typeof value === 'undefined') {
    return false;
  }

  return !!value || value === 0;
}