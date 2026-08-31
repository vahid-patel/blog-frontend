export const POST_CATEGORIES = [
  { value: "GENERAL", label: "General" },
  { value: "EDUCATION", label: "Education" },
  { value: "BUSINESS", label: "Business" },
  { value: "CASE_STUDIES", label: "Case Studies" },
  { value: "SPORTS", label: "Sports" },
  { value: "GEOPOLITICS", label: "Geopolitics" },
  { value: "FINANCE", label: "Finance" },
  {
    value: "ARTIFICIAL_INTELLIGENCE",
    label: "Artificial Intelligence",
  },
  { value: "MUSIC", label: "Music" },
  { value: "PARENTING", label: "Parenting" },
  { value: "DIY_AND_CRAFT", label: "DIY & Craft" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "PERSONAL_FINANCE", label: "Personal Finance" },
  { value: "BEAUTY", label: "Beauty" },
  { value: "FASHION", label: "Fashion" },
  { value: "LIFESTYLE", label: "Lifestyle" },
  {
    value: "HEALTH_AND_FITNESS",
    label: "Health & Fitness",
  },
  { value: "TRAVEL", label: "Travel" },
  { value: "FOOD", label: "Food" },
] as const;

export type PostCategory =
  (typeof POST_CATEGORIES)[number]["value"];