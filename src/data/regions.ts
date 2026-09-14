import type { Region } from "./schemas/content";

// 首期三个地域切片(产品方案 §5.3):中国东部温带 · 中欧 · 北美温带;春、夏两季。
// 季节口径统一采用北半球气象学四季:春 3–5 月、夏 6–8 月(Season 词条)。
export const regions: Record<string, Region> = {
  "region-china-east": {
    id: "region-china-east",
    reviewStatus: "ai-reviewed",
    name: "中国东部温带",
    englishName: "Eastern China (temperate)",
    summary:
      "从华北到长江中下游一带:季风主导,夏季暖湿多雨,冬季寒冷干燥;华北属湿润大陆性气候,长江下游已属湿润亚热带。本馆把这一带作为一个切片,季节按气象学四季:春 3–5 月,夏 6–8 月。",
    seasons: { spring: { from: 3, to: 5 }, summer: { from: 6, to: 8 } },
    sourceIds: ["src-wikipedia-climate-of-china", "src-wikipedia-geography-of-beijing", "src-wikipedia-shanghai", "src-wikipedia-season"],
  },
  "region-central-europe": {
    id: "region-central-europe",
    reviewStatus: "ai-reviewed",
    name: "中欧",
    englishName: "Central Europe",
    summary:
      "德国、奥地利、波兰、捷克等地:西部(德国大部)受大西洋暖流调节,属海洋性温带气候;越往东大陆性越强,波兰、捷克等地渐变为暖夏型湿润大陆性气候,四季分明。季节口径同为春 3–5 月、夏 6–8 月。",
    seasons: { spring: { from: 3, to: 5 }, summer: { from: 6, to: 8 } },
    sourceIds: ["src-wikipedia-europe", "src-wikipedia-humid-continental", "src-wikipedia-geography-of-germany", "src-wikipedia-season"],
  },
  "region-north-america-east": {
    id: "region-north-america-east",
    reviewStatus: "ai-reviewed",
    name: "北美温带",
    englishName: "Northeastern & Midwestern North America",
    summary:
      "五大湖、新英格兰与中西部一带:湿润大陆性气候,夏季暖到热、冬季寒冷多雪,四季分明。季节口径春 3–5 月、夏 6–8 月。",
    seasons: { spring: { from: 3, to: 5 }, summer: { from: 6, to: 8 } },
    sourceIds: ["src-wikipedia-climate-of-us", "src-wikipedia-humid-continental", "src-wikipedia-temperate-climate", "src-wikipedia-season"],
  },
};
export const REGION_IDS = Object.keys(regions);
