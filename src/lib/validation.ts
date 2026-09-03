export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const normalizePhone = (phone: string) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) return '+91' + cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return '+' + cleaned;
  return phone;
};

export const isValidPhone = (phone: string) => {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  if (!normalized) return false;
  return /^\+91[6-9]\d{9}$/.test(normalized);
};
