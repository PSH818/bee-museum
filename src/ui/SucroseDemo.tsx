import { useState } from "react";

// 分子视角小窗(蜂蜜工坊·转化站,2026-09-11 方案:2D SVG 示意动画,只做水解一幕):
// 蔗糖(六角葡萄糖环 + 五角果糖环相连)被转化酶扣住 → 连接断开 → 两个单糖分开。
// 图形是示意(环形只示意吡喃/呋喃环之别,非真实比例);文字只用已过审正文词汇。
// motion=0 或用户系统减弱动态时呈现静态终态(断开后),不播动画——基线与无障碍两全。

export function SucroseDemo({ motion, defaultCollapsed }: { motion: boolean; defaultCollapsed: boolean }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  if (collapsed) {
    return (
      <button className="hw-mol-pill" aria-expanded="false" onClick={() => setCollapsed(false)}>
        ⌬ 分子视角
      </button>
    );
  }
  return (
    <figure className={`hw-mol${motion ? " playing" : ""}`} aria-label="分子视角示意:蔗糖在转化酶作用下水解为葡萄糖和果糖">
      <figcaption className="hw-mol-head">
        <b>分子视角 · 蔗糖 → 葡萄糖 + 果糖</b>
        <button aria-expanded="true" aria-label="收起分子视角" onClick={() => setCollapsed(true)}>
          −
        </button>
      </figcaption>
      {/* 结构按 Haworth 投影简化重绘(参照 en:Sucrose):葡萄糖吡喃六元环(环内 O)
          经 C1—O—C2 糖苷氧桥连果糖呋喃五元环;CH₂OH 支链保留,羟基从略;前缘加粗示透视 */}
      <svg viewBox="0 0 240 150" role="img" aria-hidden="true">
        {/* 转化酶:锁钥轮廓,从上方扣向氧桥 */}
        <g className="mol-enzyme">
          <path
            d="M62 8 h70 a8 8 0 0 1 8 8 v18 l-22 12 h-42 l-22 -12 v-18 a8 8 0 0 1 8 -8 z"
            fill="rgba(122, 84, 34, .18)"
            stroke="#7a5422"
            strokeWidth="1.6"
          />
          <text x="97" y="28" textAnchor="middle" className="mol-text">转化酶</text>
        </g>
        {/* 糖苷氧桥 C1—O—C2(水解在此断开) */}
        <g className="mol-bond">
          <line x1="92" y1="88" x2="101" y2="88" stroke="#9a6410" strokeWidth="1.8" />
          <text x="105" y="91" textAnchor="middle" className="mol-atom">O</text>
          <line x1="109" y1="88" x2="122" y2="88" stroke="#9a6410" strokeWidth="1.8" />
        </g>
        {/* 葡萄糖:吡喃六元环(Haworth,环内 O 右上,C6-CH₂OH 朝上,底缘加粗) */}
        <g className="mol-glu">
          <path
            d="M11 -11 L22 0 L11 11 M-11 11 L-22 0 L-11 -11 L11 -11"
            fill="none" stroke="#c9861f" strokeWidth="1.7"
          />
          <path d="M11 11 L-11 11" fill="none" stroke="#c9861f" strokeWidth="3.4" strokeLinecap="round" />
          <polygon
            points="11,-11 22,0 11,11 -11,11 -22,0 -11,-11"
            fill="rgba(233, 189, 37, .18)" stroke="none"
          />
          <circle cx="11" cy="-11" r="5.5" fill="#fffdf8" />
          <text x="11" y="-8" textAnchor="middle" className="mol-atom">O</text>
          <line x1="-11" y1="-11" x2="-11" y2="-23" stroke="#c9861f" strokeWidth="1.4" />
          <text x="-11" y="-27" textAnchor="middle" className="mol-atom">CH₂OH</text>
          <text y="30" textAnchor="middle" className="mol-text mol-lab">葡萄糖</text>
        </g>
        {/* 果糖:呋喃五元环(Haworth,环内 O 在上,C1/C6 两个 CH₂OH,底缘加粗) */}
        <g className="mol-fru">
          <path
            d="M-9 13 L-15 -3 L0 -13 L15 -3 L9 13"
            fill="none" stroke="#d0642f" strokeWidth="1.7"
          />
          <path d="M-9 13 L9 13" fill="none" stroke="#d0642f" strokeWidth="3.4" strokeLinecap="round" />
          <polygon
            points="0,-13 15,-3 9,13 -9,13 -15,-3"
            fill="rgba(208, 100, 47, .14)" stroke="none"
          />
          <circle cx="0" cy="-13" r="5.5" fill="#fffdf8" />
          <text x="0" y="-10" textAnchor="middle" className="mol-atom">O</text>
          <line x1="-15" y1="-3" x2="-20" y2="-16" stroke="#d0642f" strokeWidth="1.4" />
          <text x="-21" y="-20" textAnchor="middle" className="mol-atom">CH₂OH</text>
          <line x1="15" y1="-3" x2="22" y2="6" stroke="#d0642f" strokeWidth="1.4" />
          <text x="24" y="12" textAnchor="start" className="mol-atom">CH₂OH</text>
          <text y="30" textAnchor="middle" className="mol-text mol-lab">果糖</text>
        </g>
        <text x="99" y="124" textAnchor="middle" className="mol-text mol-lab-suc">蔗糖</text>
        <text x="234" y="146" textAnchor="end" className="mol-note">结构式简化重绘 · 羟基从略</text>
      </svg>
    </figure>
  );
}
