// 展厅目录(产品方案 §4 信息架构、§11 里程碑)
// 序厅与各展厅的入口在这里统一登记;新增展厅只需加一行。
export type HallStatus = "open" | "planned";

export interface Hall {
  id: string;
  /** 路由路径(可带默认查询参数) */
  path: string;
  name: string;
  /** 英文小标 */
  kicker: string;
  blurb: string;
  status: HallStatus;
  /** 未开放展厅对应的里程碑 */
  milestone?: string;
}

export const halls: Hall[] = [
  {
    id: "world-bees",
    path: "/museum/world-bees",
    name: "世界蜜蜂馆",
    kicker: "HALL 01 · WORLD BEES",
    blurb:
      "6 种蜂、8 件数字标本:西方蜜蜂与东方蜜蜂各三职型,以及欧洲熊蜂、角额壁蜂、苜蓿切叶蜂、紫木蜂。可旋转、可靠近、可比较。",
    status: "open",
  },
  {
    id: "anatomy",
    path: "/museum/bees/apis-mellifera?focus=head",
    name: "身体与职型馆",
    kicker: "HALL 02 · ANATOMY",
    blurb:
      "点开标本上的圆点,逐个器官看:复眼、触角、口器、花粉筐、螫针……再把工蜂、蜂王、雄蜂放到同一比例尺下比较。",
    status: "open",
  },
  {
    id: "flowers",
    path: "/museum/flowers",
    name: "花朵与四季馆",
    kicker: "HALL 03 · FLOWERS",
    blurb: "7 种蜜源花的结构、3 个地域的春夏花期;哪种蜂访哪种花、凭什么记载,还有访花演示。",
    status: "open",
  },
  {
    id: "life-cycle",
    path: "/museum/life-cycle",
    name: "生命历程馆",
    kicker: "HALL 04 · LIFE CYCLE",
    blurb: "从卵到成虫的可拖动时间轴:一只西方蜜蜂工蜂的一生,和一根壁蜂巢管里的一年。",
    status: "open",
  },
  {
    id: "honey-workshop",
    path: "/museum/honey-workshop",
    name: "蜂蜜工坊",
    kicker: "HALL 05 · HONEY",
    blurb: "一滴花蜜怎样变成蜂蜜;蜂王浆是什么,又不是什么。",
    status: "open",
  },
  {
    id: "sources",
    path: "/sources",
    name: "来源与审校",
    kicker: "ARCHIVE · SOURCES",
    blurb: "每一句话来自哪里、经过了什么审查、还有哪些没做到——全部公开。",
    status: "open",
  },
];

export const hallById = new Map(halls.map((hall) => [hall.id, hall]));

/** 按路径前缀找展厅(筹备页用) */
export function findHallByPath(pathname: string): Hall | undefined {
  return halls.find((hall) => hall.path.split("?")[0] === pathname);
}
