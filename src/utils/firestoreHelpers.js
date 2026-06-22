/** Remove undefined values — Firestore rejects undefined fields. */
export function sanitizeForFirestore(value) {
  return JSON.parse(JSON.stringify(value));
}
