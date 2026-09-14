export type HoneyProfile = {
  id: string;
  name: string;
  plant: string;
  latin: string;
  season: string;
  tone: string;
  summary: string;
  aroma: string;
  crystallization: string;
  caveat: string;
};

export const honeyProfiles: HoneyProfile[] = [
  {
    id: "rapeseed",
    name: "油菜花蜜",
    plant: "油菜",
    latin: "Brassica napus",
    season: "春季代表蜜源",
    tone: "#d8a928",
    summary: "从大片油菜花田开始，认识作物、访花昆虫与蜂巢之间的联系。",
    aroma: "常被描述为具有较鲜明的植物与花香特征。",
    crystallization: "通常较容易出现结晶；具体状态会随批次与保存条件变化。",
    caveat: "颜色、香气与结晶表现不能单独作为蜂蜜真伪判断依据。",
  },
  {
    id: "acacia",
    name: "槐花蜜",
    plant: "槐／刺槐",
    latin: "植物名称待内容审核",
    season: "初夏代表蜜源",
    tone: "#8ca173",
    summary: "沿林缘寻找垂落花序，观察短花期如何影响一次集中采集。",
    aroma: "常被描述为香气清雅；不同产地、年份与批次存在差异。",
    crystallization: "常见描述为较不易结晶，但不应视为绝对规则。",
    caveat: "正式发布前需要确认商品名、中文植物名与具体学名的对应关系。",
  },
];

export const journeySteps = [
  { id: "flower", eyebrow: "01 · 发现", title: "先找到一朵花" },
  { id: "nectar", eyebrow: "02 · 采集", title: "收集花蜜，也带走花粉" },
  { id: "return", eyebrow: "03 · 返巢", title: "记住回家的方向" },
  { id: "relay", eyebrow: "04 · 接力", title: "蜂巢里的同伴接过花蜜" },
  { id: "mature", eyebrow: "05 · 成熟", title: "等待水分减少与蜂房封盖" },
  { id: "result", eyebrow: "06 · 认识", title: "这滴蜜从哪里来" },
] as const;
