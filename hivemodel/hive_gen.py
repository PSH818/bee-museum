# 蜂巢巢脾参数化生成(M5 第 2 步)。
# 约定与蜂/花一致:导出后 1 单位 = 1 cm(工蜂体长 1.17 单位;格心距 0.63 ≈ 真实工蜂巢房)。
# 巢脾竖立:格阵列在 Blender XZ 平面,格口朝 -Y(glTF Y-up 转换后朝 three +Z,面向观众)。
# 三种格态分区(锯齿过渡 + 少量跳区):左 空巢房 / 中 盛蜜(琥珀液面,含少数"刚摊入"的深位薄蜜)/ 右 封盖。
# 简化说明:真实巢房轴上倾约 10°、两面有格,本模型为单面直轴——查看器侧 modelNote 注明。
# 运行: blender --background --python hivemodel/run_export.py -- comb
import bpy
import bmesh
import math
import random
from mathutils import Vector

import os as _os
BASE_DIR = (_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
            if "__file__" in globals() else _os.getcwd()).replace("\\", "/")
COLL = "Hive"

CELL_PITCH = 0.63      # 格心距(内切径 0.54 + 壁 0.09)
CELL_R_IN = 0.27       # 内六角内切半径
CELL_DEPTH = 1.15      # hero 格深
COLS = 17
ROWS = 13


def _reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    coll = bpy.data.collections.new(COLL)
    bpy.context.scene.collection.children.link(coll)


def _link(obj):
    bpy.data.collections[COLL].objects.link(obj)
    return obj


def _mat(name, rgb, rough=0.5, metallic=0.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metallic
    return m


def MATS():
    return {
        "wall": _mat("hive_wall", (0.70, 0.44, 0.11), rough=0.62),
        "deep": _mat("hive_deep", (0.40, 0.20, 0.04), rough=0.75),
        "honey": _mat("hive_honey", (0.43, 0.115, 0.008), rough=0.07),
        "capping": _mat("hive_capping", (0.67, 0.50, 0.26), rough=0.72),
        "board": _mat("hive_board", (0.50, 0.29, 0.06), rough=0.7),
    }


def _obj_from_bm(bm, name, mat, smooth=False):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
    return _link(obj)


def _hex_ring(cx, cz, r, y):
    """六角环顶点(flat-top 朝上下:蜂巢格口尖角朝上,顶点从 30° 起)。"""
    return [Vector((cx + r * math.cos(math.radians(60 * i + 30)),
                    y,
                    cz + r * math.sin(math.radians(60 * i + 30)))) for i in range(6)]


def _cells_layout():
    """全部格的 (cx, cz, zone, honey_depth)。zone: 0 空 / 1 蜜 / 2 封盖。"""
    random.seed(7)
    rows_h = CELL_PITCH * math.sqrt(3) / 2
    cells = []
    for r in range(ROWS):
        for c in range(COLS):
            cx = (c - (COLS - 1) / 2) * CELL_PITCH + (CELL_PITCH / 2 if r % 2 else 0)
            cz = (r - (ROWS - 1) / 2) * rows_h
            # 三区 + 锯齿过渡 + 5% 跳区
            edge = cx + random.uniform(-0.45, 0.45)
            zone = 0 if edge < -1.9 else (2 if edge > 1.9 else 1)
            if random.random() < 0.05:
                zone = random.choice((0, 1, 2))
            honey_depth = None
            if zone == 1:
                honey_depth = 0.13 + random.uniform(-0.02, 0.03)  # 满格,液面近口
            elif zone == 0 and random.random() < 0.18:
                honey_depth = 0.72 + random.uniform(-0.05, 0.05)  # 刚摊入的薄蜜,深位
            cells.append((cx, cz, zone, honey_depth))
    return cells


def build_comb(lod="hero"):
    _reset()
    mats = MATS()
    depth = CELL_DEPTH if lod == "hero" else 0.4
    r_out = CELL_PITCH / math.sqrt(3)  # 外六角外接半径(相邻格无缝)
    cells = _cells_layout()

    # ---- 格壁(口框 + 内壁):一个 bmesh 批量
    bm_wall = bmesh.new()
    bm_deep = bmesh.new()
    for cx, cz, zone, _hd in cells:
        outer = [bm_wall.verts.new(v) for v in _hex_ring(cx, cz, r_out, 0)]
        inner = [bm_wall.verts.new(v) for v in _hex_ring(cx, cz, CELL_R_IN / math.cos(math.radians(30)) * math.cos(0), 0)]
        for i in range(6):
            bm_wall.faces.new((outer[i], outer[(i + 1) % 6], inner[(i + 1) % 6], inner[i]))
        if lod == "hero" or zone != 2:
            bot = [bm_wall.verts.new(v + Vector((0, depth, 0)))
                   for v in _hex_ring(cx, cz, CELL_R_IN / math.cos(math.radians(30)), 0)]
            for i in range(6):
                bm_wall.faces.new((inner[i], inner[(i + 1) % 6], bot[(i + 1) % 6], bot[i]))
            # 格底(深色假 AO)
            db = [bm_deep.verts.new(v + Vector((0, depth - 0.01, 0)))
                  for v in _hex_ring(cx, cz, CELL_R_IN / math.cos(math.radians(30)) - 0.005, 0)]
            center = bm_deep.verts.new(Vector((cx, depth + 0.02, cz)))
            for i in range(6):
                bm_deep.faces.new((db[i], db[(i + 1) % 6], center))
    _obj_from_bm(bm_wall, "hero_cells", mats["wall"])
    _obj_from_bm(bm_deep, "cell_bottoms", mats["deep"])

    # ---- 蜜液面(平面,靠低粗糙度出光泽)
    bm_honey = bmesh.new()
    for cx, cz, zone, hd in cells:
        if hd is None or hd >= depth:
            continue
        ring = [bm_honey.verts.new(v + Vector((0, hd, 0)))
                for v in _hex_ring(cx, cz, CELL_R_IN / math.cos(math.radians(30)) - 0.006, 0)]
        bm_honey.faces.new(ring)
    _obj_from_bm(bm_honey, "hero_honey", mats["honey"])

    # ---- 蜡封盖(两环圆顶:口环 → 中环 → 顶点,鼓起朝观众)
    bm_cap = bmesh.new()
    for cx, cz, zone, _hd in cells:
        if zone != 2:
            continue
        r_cap = CELL_R_IN / math.cos(math.radians(30)) + 0.02
        bulge = random.uniform(0.10, 0.15)
        ring = [bm_cap.verts.new(v + Vector((0, 0.01, 0))) for v in _hex_ring(cx, cz, r_cap, 0)]
        mid = [bm_cap.verts.new(v + Vector((0, -bulge * 0.75, 0)))
               for v in _hex_ring(cx, cz, r_cap * 0.55, 0)]
        center = bm_cap.verts.new(Vector((cx, -bulge, cz)))
        for i in range(6):
            bm_cap.faces.new((ring[i], ring[(i + 1) % 6], mid[(i + 1) % 6], mid[i]))
            bm_cap.faces.new((mid[i], mid[(i + 1) % 6], center))
    _obj_from_bm(bm_cap, "hero_caps", mats["capping"], smooth=True)

    # ---- 背板
    rows_h = CELL_PITCH * math.sqrt(3) / 2
    w = COLS * CELL_PITCH + 0.8
    h = ROWS * rows_h + 0.8
    bm_b = bmesh.new()
    bmesh.ops.create_cube(bm_b, size=1)
    for v in bm_b.verts:
        v.co.x *= w
        v.co.z *= h
        v.co.y = v.co.y * 0.35 + depth + 0.18
    _obj_from_bm(bm_b, "board", mats["board"])

    # ---- 根与锚点
    root = bpy.data.objects.new("hive_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is not root and o.parent is None:
            o.parent = root

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.3
        _link(a)
        a.parent = root
        a.location = pos
        return a

    def zone_center(zone):
        zs = [(cx, cz) for cx, cz, z, _ in cells if z == zone]
        zs.sort(key=lambda p: abs(p[1]) * 3 + abs(p[0]))
        # 取最靠该区中部、居中行的格
        xs = sorted(p[0] for p in zs)
        mid_x = xs[len(xs) // 2]
        zs.sort(key=lambda p: abs(p[0] - mid_x) + abs(p[1]))
        return Vector((zs[0][0], 0, zs[0][1]))

    p_open = zone_center(0)
    p_honey = zone_center(1)
    p_capped = zone_center(2)
    anchor("anchor_combFace", Vector((0, -0.4, 0)))
    anchor("anchor_cellOpen", p_open)
    anchor("anchor_cellHoney", p_honey)
    anchor("anchor_cellCapped", p_capped)
    # 蜂落点:蜜区中心格口;落点法线沿巢脾面外(-Y),BeeVisit 同款约定
    anchor("anchor_landing", p_honey)
    anchor("anchor_landingNormal", p_honey + Vector((0, -1.0, 0)))
    anchor("anchor_combBase", Vector((0, 0, -h / 2)))
    return root


def _select_tree(obj):
    obj.select_set(True)
    for c in obj.children:
        _select_tree(c)


BUILDERS = {"comb": build_comb}


def export_hive(name):
    for lod, suffix in (("hero", ""), ("low", "-low")):
        root = BUILDERS[name](lod)
        bpy.ops.object.select_all(action="DESELECT")
        _select_tree(root)
        bpy.ops.export_scene.gltf(
            filepath=BASE_DIR + "/hivemodel/hive-%s%s.glb" % (name, suffix),
            use_selection=True, export_animations=False)
        print("exported hive:", name, lod)


print("hive_gen loaded; builders:", list(BUILDERS))
