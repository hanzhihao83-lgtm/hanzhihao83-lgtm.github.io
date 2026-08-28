export const profile = {
  name: "{{YOUR_NAME}}",
  initials: "{{INITIALS}}",
  role: "{{ROLE}}",
  tagline: "{{TAGLINE}}",
  email: "{{EMAIL}}",
  contact: "{{CONTACT}}",
  year: "{{YEAR}}",
  portrait: "/media/avatar-placeholder.svg",
} as const;

export const profileFallbacks = {
  name: "你的名字",
  initials: "ID",
  role: "创意工作者 / 数字体验设计",
  taglineLead: "把复杂问题，",
  taglineMuted: "变成清晰而有感的作品。",
  email: "email@example.com",
  contact: "联系方式待补充",
  year: "2026",
} as const;

export function resolveProfileValue(
  value: string,
  fallback: string,
) {
  return value.startsWith("{{") ? fallback : value;
}
