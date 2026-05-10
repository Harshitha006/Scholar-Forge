export const SECTION_TAG_COLORS = {
  neutral: { fill: "#1F1F1F", text: "#EDEDED" },
  blue: { fill: "#10233D", text: "#52A8FF" }, // data/methods
  purple: { fill: "#2E1938", text: "#BF7AF0" }, // AI
  orange: { fill: "#331B00", text: "#FF990A" }, // review needed
  red: { fill: "#3C1618", text: "#FF6166" }, // error
  pink: { fill: "#3A1726", text: "#F75F8F" }, // draft
  green: { fill: "#0F2E18", text: "#62C073" }, // ready
  teal: { fill: "#062822", text: "#0AC7B4" }, // literature
} as const;

export type SectionTagColor = keyof typeof SECTION_TAG_COLORS;
