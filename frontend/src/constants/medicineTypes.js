export const MEDICINE_TYPES = [
  {
    value: "Painkiller",
    label: "Painkiller",
    icon: "ti-pulse",
  },
  {
    value: "Anxiety-and-Antidepressant",
    label: "Anxiety & Antidepressant",
    icon: "ti-heart",
  },
  {
    value: "SleepDisorder",
    label: "Sleep Disorder",
    icon: "ti-time",
  },
  {
    value: "Hypertension",
    label: "Hypertension",
    icon: "ti-bar-chart",
  },
  {
    value: "ErectionDyfunction",
    label: "Erection Dysfunction",
    icon: "ti-lock",
  },
  {
    value: "WeightManagement",
    label: "Weight Management",
    icon: "ti-dashboard",
  },
];

export const CATEGORY_ORDER = MEDICINE_TYPES.map((t) => t.value);

export const CATEGORY_LABELS = MEDICINE_TYPES.reduce((acc, t) => {
  acc[t.value] = t.label;
  return acc;
}, {});

export const CATEGORY_ICONS = MEDICINE_TYPES.reduce((acc, t) => {
  acc[t.value] = t.icon;
  return acc;
}, {});
