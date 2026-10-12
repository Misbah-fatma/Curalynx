/** Allowed medicine categories for the pharmacy catalog */
export const ALLOWED_MEDICINE_TYPES = [
  "Painkiller",
  "Anxiety-and-Antidepressant",
  "SleepDisorder",
  "Hypertension",
  "ErectionDyfunction",
  "WeightManagement",
];

export const REMOVED_MEDICINE_TYPES = ["DiabetesCare", "AllergyRelief"];

export const isAllowedMedicineType = (type) =>
  ALLOWED_MEDICINE_TYPES.includes(type);
