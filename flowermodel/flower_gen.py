# 花朵参数化生成管线(M3 第 2 步)。
# 约定与蜂模型一致:导出后 1 单位 = 1 cm(蜂 GLB 工蜂体长 1.17 单位;花几何直接按 cm 建,根不再缩放);
# GLB 双 LOD(hero / low),锚点为 anchor_* 空物体,由查看器读取。
# 运行: blender --background --python flowermodel/run_export.py -- brassica
import bpy
import bmesh
import math
import random
from mathutils import Vector, Euler

import os as _os
BASE_DIR = (_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
            if "__file__" in globals() else _os.getcwd()).replace("\\", "/")
ROOT_SCALE = 1.0
COLL = "Flower"


# ---------------------------------------------------------------- 基础
def _reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    coll = bpy.data.collections.new(COLL)
    bpy.context.scene.collection.children.link(coll)


def _link(obj):
    bpy.data.collections[COLL].objects.link(obj)
    return obj


def _mat(name, rgb, rough=0.5, sss=0.0):
    m = bpy.data.materials.get(name)
    if m:
        return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*rgb, 1.0)
    bsdf.inputs["Roughness"].default_value = rough
    if sss > 0 and "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = sss
        bsdf.inputs["Subsurface Radius"].default_value = (0.2, 0.15, 0.05)
    return m


def MATS():
    return {
        "petal": _mat("flower_petal", (0.91, 0.64, 0.02), rough=0.38, sss=0.06),
        "sepal": _mat("flower_sepal", (0.24, 0.34, 0.055), rough=0.5),
        "stem": _mat("flower_stem", (0.13, 0.26, 0.06), rough=0.55),
        "filament": _mat("flower_filament", (0.85, 0.78, 0.38), rough=0.5),
        "anther": _mat("flower_anther", (0.86, 0.55, 0.015), rough=0.5),
        "pistil": _mat("flower_pistil", (0.35, 0.50, 0.13), rough=0.5),
        "stigma": _mat("flower_stigma", (0.72, 0.66, 0.18), rough=0.6),
        "nectary": _mat("flower_nectary", (0.30, 0.55, 0.12), rough=0.35),
        "bud": _mat("flower_bud", (0.35, 0.44, 0.09), rough=0.5),
        "pod": _mat("flower_pod", (0.20, 0.36, 0.09), rough=0.55),
    }


def _obj_from_bm(bm, name, mat):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    for p in mesh.polygons:
        p.use_smooth = True
    return _link(obj)


def _solidify(obj, t=0.02):
    mod = obj.modifiers.new("solid", "SOLIDIFY")
    mod.thickness = t
    mod.offset = 0.0


def _join(objs, name):
    if not objs:
        return None
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    joined = bpy.context.view_layer.objects.active
    joined.name = name
    joined.data.name = name
    return joined


def _apply_mods(objs):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.convert(target="MESH")


# ---------------------------------------------------------------- 器官几何
def _blade(name, mat, length, width, claw, claw_w, nx, ny,
           cup=0.22, lift=0.0, recurve=0.18, peak=1.35):
    """带爪的花瓣/萼片:x 沿长度,y 横向,z 上翘;根在原点,沿 +X 展开。"""
    bm = bmesh.new()
    grid = []
    for i in range(ny + 1):
        t = i / ny  # 0 根 → 1 尖
        x = t * (claw + length)
        if x < claw:  # 爪部:窄条
            w = claw_w * (0.65 + 0.35 * (x / max(claw, 1e-4)))
        else:  # 瓣片:倒卵形,最宽处约在 60% 长度
            u = min((x - claw) / length, 1.0)
            w = claw_w + (width - claw_w) * math.sin(math.pi * u ** peak) ** 0.8
        # 纵向轮廓:爪部平,瓣片先升后微反卷
        z = lift * t + (0.0 if x < claw else math.sin((x - claw) / length * math.pi) * recurve * 0.35)
        if x > claw + length * 0.75:
            z -= ((x - claw - length * 0.75) / (length * 0.25)) ** 2 * recurve * length * 0.55
        row = []
        for j in range(nx + 1):
            s = j / nx * 2 - 1  # -1..1 横向
            zz = z + (1 - s * s) * (-cup) * w  # 横向凹杯
            row.append(bm.verts.new((x, s * w, zz + cup * w)))
        grid.append(row)
    bm.verts.ensure_lookup_table()
    for i in range(ny):
        for j in range(nx):
            bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
    return _obj_from_bm(bm, name, mat)


def _capsule(name, mat, r, h, seg=8, ring=6, squash=1.0):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=ring, radius=r)
    for v in bm.verts:
        v.co.z *= (h / (2 * r))
        v.co.y *= squash
        v.co.z += h / 2
    return _obj_from_bm(bm, name, mat)


def _rod(name, mat, r0, r1, pts, seg=6):
    """沿点列扫掠的细杆(花丝/花柱/花柄/茎)。pts: [(Vector, t)] t∈0..1 决定半径插值。"""
    bm = bmesh.new()
    rings = []
    n = len(pts)
    for idx, p in enumerate(pts):
        t = idx / (n - 1)
        r = r0 + (r1 - r0) * t
        if idx < n - 1:
            d = (pts[idx + 1] - p).normalized()
        else:
            d = (p - pts[idx - 1]).normalized()
        up = Vector((0, 0, 1)) if abs(d.z) < 0.95 else Vector((1, 0, 0))
        u = d.cross(up).normalized()
        v = d.cross(u).normalized()
        ring = [bm.verts.new(p + (u * math.cos(a) + v * math.sin(a)) * r)
                for a in [k / seg * 2 * math.pi for k in range(seg)]]
        rings.append(ring)
    for i in range(n - 1):
        for k in range(seg):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % seg],
                          rings[i + 1][(k + 1) % seg], rings[i + 1][k]))
    # 封口
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    return _obj_from_bm(bm, name, mat)


def _bend_pts(base, tip_dir, length, bow, n=6):
    """从 base 沿 tip_dir 弯出的点列,bow 为侧向鼓出量(Vector)。"""
    pts = []
    for i in range(n):
        t = i / (n - 1)
        pts.append(base + tip_dir * (length * t) + bow * math.sin(t * math.pi))
    return pts


# ---------------------------------------------------------------- 油菜单花
def build_brassica_flower(mats, res=1.0, open_t=1.0, prefix="f"):
    """返回该花全部 object 列表;花以原点为花托、+Z 为花轴。open_t 1=盛开。"""
    objs = []
    nx = max(3, round(5 * res))
    ny = max(6, round(12 * res))
    # 花托
    rec = _capsule(prefix + "_receptacle", mats["sepal"], 0.085, 0.16, seg=8, ring=5)
    objs.append(rec)
    # 花瓣 ×4:方位 45/135/225/315,仰角随盛开度
    elev = math.radians(78 - 48 * open_t)  # 盛开时约 30°
    for k in range(4):
        p = _blade(prefix + "_petal%d" % k, mats["petal"],
                   length=0.62, width=0.34, claw=0.42, claw_w=0.055,
                   nx=nx, ny=ny, cup=0.09, recurve=0.22)
        _solidify(p, 0.015)
        p.rotation_euler = Euler((0, -elev, math.radians(45 + 90 * k)), "ZYX")
        p.location = (0, 0, 0.10)
        objs.append(p)
    # 花萼 ×4:方位 0/90/180/270,较直立
    for k in range(4):
        s = _blade(prefix + "_sepal%d" % k, mats["sepal"],
                   length=0.42, width=0.10, claw=0.10, claw_w=0.05,
                   nx=max(3, nx - 2), ny=max(4, ny - 5), cup=0.30, recurve=0.12)
        _solidify(s, 0.02)
        s.rotation_euler = Euler((0, math.radians(-62 - 12 * open_t), math.radians(90 * k)), "ZYX")
        s.location = (0, 0, 0.06)
        objs.append(s)
    # 雄蕊:4 长(方位 45/135/225/315 内圈)+ 2 短(0/180)
    def stamen(tag, az_deg, h, lean_deg, r_at_base):
        az = math.radians(az_deg)
        lean = math.radians(lean_deg)
        base = Vector((math.cos(az) * r_at_base, math.sin(az) * r_at_base, 0.10))
        out = Vector((math.cos(az), math.sin(az), 0))
        tip_dir = (out * math.sin(lean) + Vector((0, 0, math.cos(lean)))).normalized()
        fil = _rod(prefix + "_fil_" + tag, mats["filament"], 0.028, 0.02,
                   _bend_pts(base, tip_dir, h, out * 0.05), seg=6)
        anth = _capsule(prefix + "_anth_" + tag, mats["anther"], 0.052, 0.20, seg=8, ring=5, squash=0.6)
        tip = base + tip_dir * h
        anth.location = tip
        anth.rotation_euler = Euler((math.radians(14) * -math.sin(az), math.radians(14) * math.cos(az) * 0 + math.radians(10), az), "ZYX")
        return [fil, anth]
    for k in range(4):
        objs += stamen("l%d" % k, 45 + 90 * k, 0.62 * (0.5 + 0.5 * open_t), 10, 0.045)
    for k in range(2):
        objs += stamen("s%d" % k, 180 * k, 0.42 * (0.5 + 0.5 * open_t), 22, 0.055)
    # 雌蕊:子房柱 + 柱头
    pist = _rod(prefix + "_pistil", mats["pistil"], 0.045, 0.03,
                _bend_pts(Vector((0, 0, 0.10)), Vector((0, 0, 1)), 0.66 * (0.5 + 0.5 * open_t), Vector((0, 0, 0))), seg=8)
    stig = _capsule(prefix + "_stigma", mats["stigma"], 0.052, 0.09, seg=8, ring=4)
    stig.location = (0, 0, 0.10 + 0.66 * (0.5 + 0.5 * open_t))
    objs += [pist, stig]
    # 蜜腺 ×4(基部,盛开花才可见细节)
    if res >= 0.9:
        for k in range(4):
            az = math.radians(45 + 90 * k)
            n = _capsule(prefix + "_nectary%d" % k, mats["nectary"], 0.032, 0.05, seg=6, ring=4)
            n.location = (math.cos(az) * 0.075, math.sin(az) * 0.075, 0.075)
            objs.append(n)
    return objs


def _bud(mats, length, prefix):
    b = _capsule(prefix, mats["bud"], length * 0.20, length, seg=8, ring=6, squash=0.9)
    return b


def _place(objs, loc, rot_euler, scale=1.0):
    """把一组对象作为整体变换(通过临时父级再应用)。"""
    pivot = bpy.data.objects.new("tmp_pivot", None)
    _link(pivot)
    for o in objs:
        o.parent = pivot
    pivot.location = loc
    pivot.rotation_euler = rot_euler
    pivot.scale = (scale,) * 3
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)  # 保持父子即可
    return pivot


# ---------------------------------------------------------------- 油菜整株(总状花序段)
def build_brassica(lod="hero"):
    _reset()
    random.seed(7)
    mats = MATS()
    res = 1.0 if lod == "hero" else 0.55
    H = 13.0  # 茎段高(cm)
    # 主茎:略弯
    stem_pts = [Vector((math.sin(t * 2.0) * 0.28 * t, math.cos(t * 1.4) * 0.12 * t, t * H))
                for t in [i / 10 for i in range(11)]]
    stem = _rod("stem", mats["stem"], 0.16, 0.075, stem_pts, seg=10 if lod == "hero" else 7)

    def stem_at(z):
        t = min(max(z / H, 0), 1)
        i = min(int(t * 10), 9)
        f = t * 10 - i
        return stem_pts[i].lerp(stem_pts[i + 1], f)

    pivots = []
    anchors = {}

    # 下部:3 根嫩角果(向上斜伸的细长荚)
    for k, (z, az_deg, ln) in enumerate([(7.2, 20, 2.8), (8.1, 150, 3.2), (8.9, 265, 2.4)]):
        az = math.radians(az_deg)
        base = stem_at(z)
        out = Vector((math.cos(az), math.sin(az), 0))
        tip_dir = (out * 0.62 + Vector((0, 0, 0.79))).normalized()
        pod = _rod("pod%d" % k, mats["pod"], 0.055, 0.028,
                   _bend_pts(base, tip_dir, ln, out * 0.12, n=6), seg=6)
        tipball = _capsule("podtip%d" % k, mats["pod"], 0.03, 0.18, seg=6, ring=4)
        tipball.location = base + tip_dir * ln

    # 中部:6 朵开放花(螺旋排列)+ 1 朵主花
    flower_z = [9.6, 10.2, 10.8, 11.3, 11.8, 12.3]
    open_ts = [1.0, 1.0, 0.95, 0.9, 0.8, 0.65]
    flower_az = [40, 150, 205, 330, 100, 15]  # 避开主花的 -Y(270°)朝向
    ctx_objs = []
    for k, z in enumerate(flower_z):
        az = math.radians(flower_az[k])
        base = stem_at(z)
        out = Vector((math.cos(az), math.sin(az), 0))
        ped_dir = (out * 0.82 + Vector((0, 0, 0.57))).normalized()
        ped_len = 1.15 - k * 0.06
        ped = _rod("ped%d" % k, mats["stem"], 0.05, 0.038,
                   _bend_pts(base, ped_dir, ped_len, out * 0.06), seg=6)
        ctx_objs.append(ped)
        fobjs = build_brassica_flower(mats, res=0.55 if lod == "hero" else 0.4,
                                      open_t=open_ts[k], prefix="c%d" % k)
        tilt = (out * math.sin(math.radians(52)) + Vector((0, 0, math.cos(math.radians(52))))).normalized()
        rot = tilt.to_track_quat("Z", "Y").to_euler()
        pv = _place(fobjs, base + ped_dir * ped_len, rot, scale=0.92)
        pivots.append((pv, fobjs))
        ctx_objs += fobjs

    # 主花(hero):朝 -Y 偏上,位置醒目
    hero_z = 10.9
    base = stem_at(hero_z)
    out = Vector((0, -1, 0))
    ped_dir = (out * 0.8 + Vector((0, 0, 0.6))).normalized()
    ped_len = 1.5
    hero_ped = _rod("hero_pedicel", mats["stem"], 0.055, 0.04,
                    _bend_pts(base, ped_dir, ped_len, out * 0.08), seg=8)
    hero_objs = build_brassica_flower(mats, res=res, open_t=1.0, prefix="hero")
    hero_pos = base + ped_dir * ped_len
    tilt = (out * math.sin(math.radians(48)) + Vector((0, 0, math.cos(math.radians(48))))).normalized()
    rot = tilt.to_track_quat("Z", "Y").to_euler()
    hero_pv = _place(hero_objs, hero_pos, rot, scale=1.0)

    # 顶端:花蕾团(伞房状,中心最嫩)
    bud_objs = []
    n_buds = 9 if lod == "hero" else 6
    for k in range(n_buds):
        ring = 0 if k == 0 else (1 if k < 5 else 2)
        az = math.radians(k * 87 + 15)
        r = [0.0, 0.28, 0.5][ring]
        ln = [0.42, 0.5, 0.58][ring]
        top = stem_at(H - 0.1)
        pos = top + Vector((math.cos(az) * r, math.sin(az) * r, 0.34 - ring * 0.16))
        bud = _bud(mats, ln, "bud%d" % k)
        lean = ring * 0.35
        bud.rotation_euler = Euler((lean * -math.sin(az), lean * math.cos(az), 0), "XYZ")
        bud.location = pos
        bud_objs.append(bud)
        if ring > 0:
            bp = _rod("budped%d" % k, mats["stem"], 0.035, 0.03,
                      [top, pos + Vector((0, 0, 0.02))], seg=5)
            bud_objs.append(bp)

    # ---- 应用修改器,合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    # 合并策略:hero 花各部位独立(热点/图层用),其余按组合并
    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_petal"), "hero_petals")
    _join(fresh("hero_sepal"), "hero_sepals")
    _join(fresh("hero_fil_", "hero_anth_"), "hero_stamens")
    _join(fresh("hero_pistil", "hero_stigma"), "hero_pistil_full")
    _join(fresh("hero_nectary"), "hero_nectaries")
    _join(fresh("c", "ped"), "raceme_flowers")
    _join(fresh("bud"), "buds")
    _join(fresh("pod"), "pods")

    # ---- 根与锚点
    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    # 清掉临时父级
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.2
        _link(a)
        a.parent = root
        a.location = pos
        return a

    hero_axis = tilt
    anchor("anchor_flowerCenter", hero_pos + hero_axis * 0.35)
    anchor("anchor_petalFocus", hero_pos + hero_axis * 0.42 + Vector((0.55, -0.55, 0.1)))
    anchor("anchor_stamenFocus", hero_pos + hero_axis * 0.75)
    nectar_pos = hero_pos + hero_axis * 0.12 + Vector((0, -0.18, 0.05))
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + hero_axis * 1.0)
    anchor("anchor_stemBase", Vector((0, 0, 0.4)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS = {"brassica": build_brassica}

# ---------------------------------------------------------------- 向日葵
def MATS_H():
    m = MATS()
    m.update({
        "ray": _mat("sun_ray", (0.90, 0.45, 0.012), rough=0.42, sss=0.05),
        "disc_open": _mat("sun_disc_open", (0.50, 0.20, 0.02), rough=0.6),
        "disc_mid": _mat("sun_disc_mid", (0.28, 0.14, 0.03), rough=0.6),
        "disc_center": _mat("sun_disc_center", (0.13, 0.08, 0.028), rough=0.62),
        "floret_tip": _mat("sun_floret_tip", (0.85, 0.50, 0.03), rough=0.5),
        "head_back": _mat("sun_head_back", (0.20, 0.30, 0.07), rough=0.55),
        "leaf": _mat("sun_leaf", (0.13, 0.28, 0.06), rough=0.55),
    })
    return m


def _leaf(name, mat, length, width, nx, ny, droop=0.5, curl=0.28, fold=0.10):
    """心形大叶:最宽处近基部,中肋微折,边缘下垂带浅波浪,叶尖下垂。"""
    bm = bmesh.new()
    grid = []
    for i in range(ny + 1):
        u = i / ny
        x = u * length
        w = width * math.sin(math.pi * min(u * 0.92 + 0.06, 1.0) ** 0.6) ** 0.85
        z_mid = -droop * (u ** 1.7) * length * 0.45
        row = []
        for j in range(nx + 1):
            sgn = j / nx * 2 - 1
            zz = z_mid + abs(sgn) * fold * w - (abs(sgn) ** 1.6) * curl * w
            zz += math.sin(sgn * math.pi * 2.1 + u * 6.0) * 0.028 * w * (0.3 + u)
            row.append(bm.verts.new((x, sgn * w, zz)))
        grid.append(row)
    bm.verts.ensure_lookup_table()
    for i in range(ny):
        for j in range(nx):
            bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
    return _obj_from_bm(bm, name, mat)


def _floret_field(name, mat, items, seg=6):
    """一批小管状花合成一个网格:items = [(Matrix, r, h)]。"""
    bm = bmesh.new()
    for M, r, h in items:
        bmesh.ops.create_cone(bm, cap_ends=True, segments=seg,
                              radius1=r, radius2=r * 0.55, depth=h, matrix=M)
    return _obj_from_bm(bm, name, mat)


def build_helianthus(lod="hero"):
    from mathutils import Matrix
    _reset()
    random.seed(11)
    mats = MATS_H()
    res = 1.0 if lod == "hero" else 0.55
    H = 26.0
    R_DISC = 3.1
    GOLD = math.radians(137.508)

    # 茎:近直,顶端向 -Y 低头
    stem_pts = []
    for i in range(13):
        t = i / 12
        nod = (max(t - 0.82, 0.0) / 0.18) ** 2  # 顶端 18% 开始前倾
        stem_pts.append(Vector((math.sin(t * 1.3) * 0.35 * t, -nod * 1.6, t * H)))
    _rod("stem", mats["stem"], 0.55, 0.34, stem_pts, seg=12 if lod == "hero" else 8)

    def stem_at(z):
        t = min(max(z / H, 0), 1)
        i = min(int(t * 12), 11)
        f = t * 12 - i
        return stem_pts[i].lerp(stem_pts[i + 1], f)

    # 叶 ×2:大叶,叶柄斜上,叶尖下垂
    for k, (z, az_deg, ln) in enumerate([(9.0, 105, 7.2), (15.5, 255, 6.0)]):
        az = math.radians(az_deg)
        base = stem_at(z)
        out = Vector((math.cos(az), math.sin(az), 0))
        pet_dir = (out * 0.84 + Vector((0, 0, 0.54))).normalized()
        pet_len = 2.6
        _rod("leafstalk%d" % k, mats["leaf"], 0.16, 0.11,
             _bend_pts(base, pet_dir, pet_len, Vector((0, 0, -0.25))), seg=6)
        leaf = _leaf("leaf%d" % k, mats["leaf"],
                     length=ln * 0.9, width=ln * 0.42,
                     nx=max(6, round(10 * res)), ny=max(10, round(16 * res)),
                     droop=0.7, curl=0.3, fold=0.12)
        _solidify(leaf, 0.06)
        leaf.rotation_euler = Euler((0, math.radians(22), az), "ZYX")
        leaf.location = base + pet_dir * pet_len

    # 头状花序:局部坐标 +Z 为盘面法线,置于茎顶、前倾 35°
    top = stem_pts[-1]
    normal = Vector((0, -math.sin(math.radians(35)), math.cos(math.radians(35))))
    rot = normal.to_track_quat("Z", "Y").to_euler()
    Mrot = normal.to_track_quat("Z", "Y").to_matrix().to_4x4()

    head_objs = []
    # 花托盘(背面绿):扁球
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=18 if lod == "hero" else 12,
                              v_segments=10, radius=1.0)
    for v in bm.verts:
        v.co.x *= (R_DISC + 0.45)
        v.co.y *= (R_DISC + 0.45)
        v.co.z *= 0.95
    head_objs.append(_obj_from_bm(bm, "head_back", mats["head_back"]))

    # 管状花:黄金角螺旋;外圈盛开(橙褐 + 黄药点)、中圈半开、心部未开
    R_SPIRAL = R_DISC + 0.28
    N = int(620 * (1.0 if lod == "hero" else 0.4))
    def dome(rr):
        return 0.72 + 0.5 * (1 - (rr / (R_DISC + 0.3)) ** 2)
    fields = {"open": [], "mid": [], "center": [], "tip": []}
    for i in range(N):
        rr = R_SPIRAL * math.sqrt((i + 0.5) / N)
        th = i * GOLD
        x, y = math.cos(th) * rr, math.sin(th) * rr
        band = rr / R_SPIRAL
        tilt = Matrix.Rotation(math.radians(20) * band, 4, Vector((-math.sin(th), math.cos(th), 0)))
        if band > 0.66:
            h, r = 0.52, 0.14
            fields["open"].append((Matrix.Translation((x, y, dome(rr))) @ tilt @ Matrix.Translation((0, 0, h / 2)), r, h))
            fields["tip"].append((Matrix.Translation((x, y, dome(rr))) @ tilt @ Matrix.Translation((0, 0, h + 0.04)), 0.08, 0.10))
        elif band > 0.4:
            h, r = 0.34, 0.135
            fields["mid"].append((Matrix.Translation((x, y, dome(rr))) @ tilt @ Matrix.Translation((0, 0, h / 2)), r, h))
        else:
            h, r = 0.22, 0.13
            fields["center"].append((Matrix.Translation((x, y, dome(rr) + h / 2)), r, h))
    head_objs.append(_floret_field("disc_open", mats["disc_open"], fields["open"], seg=6))
    head_objs.append(_floret_field("disc_mid", mats["disc_mid"], fields["mid"], seg=6))
    head_objs.append(_floret_field("disc_center", mats["disc_center"], fields["center"], seg=5))
    if lod == "hero":
        head_objs.append(_floret_field("disc_tips", mats["floret_tip"], fields["tip"], seg=5))

    # 舌状花两排:根在盘缘,沿方位向外展开
    n_rays = 30 if lod == "hero" else 18
    for k in range(n_rays):
        row = k % 2
        az = k / n_rays * 2 * math.pi + row * 0.06
        ln = 4.3 + random.uniform(-0.4, 0.4) - row * 0.5
        ray = _blade("ray%d" % k, mats["ray"],
                     length=ln, width=0.95, claw=0.5, claw_w=0.34,
                     nx=max(3, round(5 * res)), ny=max(6, round(11 * res)),
                     cup=0.10, recurve=0.30 + row * 0.14, peak=0.95)
        _solidify(ray, 0.03)
        ray.rotation_euler = Euler((0, math.radians(-6 + row * 9), az), "ZYX")
        rr = R_DISC - 0.55 - row * 0.22
        ray.location = (math.cos(az) * rr, math.sin(az) * rr, 0.55 - row * 0.18)
        head_objs.append(ray)

    # 苞片两轮(盘背,向外后仰)
    for row, (n_p, ln, elev, zoff) in enumerate([(17, 2.3, -14, -0.35), (13, 1.8, -30, -0.62)]):
        if lod != "hero" and row == 1:
            break
        for k in range(n_p):
            az = k / n_p * 2 * math.pi + row * 0.19
            ph = _blade("phyl%d_%d" % (row, k), mats["head_back"],
                        length=ln, width=0.55, claw=0.15, claw_w=0.3,
                        nx=3, ny=6, cup=0.18, recurve=0.1)
            _solidify(ph, 0.04)
            ph.rotation_euler = Euler((0, math.radians(elev), az), "ZYX")
            ph.location = (math.cos(az) * (R_DISC - 0.3), math.sin(az) * (R_DISC - 0.3), zoff)
            head_objs.append(ph)

    _place(head_objs, top + normal * 0.3, rot, scale=1.0)

    # ---- 应用修改器与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("ray"), "hero_rays")
    _join(fresh("disc_open", "disc_tips"), "hero_disc_open")
    _join(fresh("disc_mid", "disc_center"), "hero_disc_center")
    _join(fresh("phyl", "head_back"), "head_back_full")
    _join(fresh("leaf"), "leaves")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.6
        _link(a)
        a.parent = root
        a.location = pos
        return a

    front = top + normal * (0.3 + 1.3)
    side = Mrot @ Vector((1, 0, 0))
    anchor("anchor_flowerCenter", top + normal * 2.2)
    anchor("anchor_petalFocus", front + side * (R_DISC + 2.2) + normal * 0.2)
    anchor("anchor_stamenFocus", front + (Mrot @ Vector((-0.78 * R_DISC, 0.3, 0))) + normal * 0.5)
    nectar_pos = front + (Mrot @ Vector((0.55 * R_DISC, -0.9, 0))) + normal * 0.25
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + normal * 1.0)
    anchor("anchor_stemBase", Vector((0, 0, 1.0)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["helianthus"] = build_helianthus

# ---------------------------------------------------------------- 刺槐(蝶形花模板)
def MATS_R():
    m = MATS()
    m.update({
        "petal_w": _mat("rob_petal", (0.90, 0.88, 0.82), rough=0.45, sss=0.10),
        "blotch": _mat("rob_blotch", (0.68, 0.60, 0.08), rough=0.5),
        "calyx": _mat("rob_calyx", (0.30, 0.24, 0.14), rough=0.55),
        "bark": _mat("rob_bark", (0.20, 0.145, 0.10), rough=0.8),
        "rachis": _mat("rob_rachis", (0.24, 0.30, 0.10), rough=0.6),
        "leaflet": _mat("rob_leaflet", (0.15, 0.30, 0.08), rough=0.55),
    })
    return m


def build_papilionaceous_flower(mats, prefix, res=1.0, open_t=1.0, scale=1.0):
    """蝶形花:局部 +Z 为花开方向,+Y 为旗瓣一侧(上)。返回对象列表。
    结构:萼筒、旗瓣(带基部黄斑)、翼瓣 ×2、龙骨瓣(闭合,雌雄蕊藏于其内)。"""
    objs = []
    nx = max(3, round(5 * res))
    ny = max(5, round(10 * res))
    S = scale
    # 萼筒:钟形杯
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=10,
                          radius1=0.14 * S, radius2=0.24 * S, depth=0.36 * S)
    for v in bm.verts:
        v.co.z += 0.21 * S
    calyx = _obj_from_bm(bm, prefix + "_calyx", mats["calyx"])
    calyx.rotation_euler = Euler((math.radians(90), 0, 0), "XYZ")
    calyx.rotation_euler = Euler((math.radians(-90), 0, 0), "XYZ")
    calyx.rotation_euler = Euler((0, 0, 0), "XYZ")
    # 沿 +Z 摆放:锥体本身沿 +Z 建 ✓
    objs.append(calyx)
    # 旗瓣:大而圆,立起并后仰
    std = _blade(prefix + "_standard", mats["petal_w"],
                 length=1.25 * S, width=1.30 * S, claw=0.40 * S, claw_w=0.20 * S,
                 nx=nx + 3, ny=ny + 2, cup=0.16, recurve=-0.12, peak=0.55)
    _solidify(std, 0.02)
    std.rotation_euler = Euler((0, math.radians(-(64 - 42 * open_t)), math.radians(90)), "ZYX")
    std.location = (0, 0.05 * S, 0.28 * S)
    objs.append(std)
    # 旗瓣基部黄斑:小片贴在旗瓣爪前
    blotch = _blade(prefix + "_blotch", mats["blotch"],
                    length=0.30 * S, width=0.15 * S, claw=0.04 * S, claw_w=0.08 * S,
                    nx=3, ny=4, cup=0.12, recurve=-0.10, peak=0.8)
    _solidify(blotch, 0.015)
    blotch.rotation_euler = Euler((0, math.radians(-(66 - 42 * open_t)), math.radians(90)), "ZYX")
    blotch.location = (0, 0.11 * S, 0.34 * S)
    objs.append(blotch)
    # 翼瓣 ×2:两侧长圆,略下垂,夹住龙骨瓣
    for k, sgn in enumerate((1, -1)):
        wing = _blade(prefix + "_wing%d" % k, mats["petal_w"],
                      length=1.10 * S, width=0.36 * S, claw=0.30 * S, claw_w=0.11 * S,
                      nx=nx, ny=ny, cup=0.20, recurve=0.06, peak=1.15)
        _solidify(wing, 0.02)
        wing_dir = Vector((0.40 * sgn, -0.22, 0.89)).normalized()
        wing.rotation_euler = wing_dir.to_track_quat("X", "Y").to_euler()
        wing.location = (0.08 * S * sgn, -0.02 * S, 0.32 * S)
        objs.append(wing)
    # 龙骨瓣:船形(闭合;雌雄蕊藏于其内,被蜂压开才露出)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=8, radius=1.0)
    for v in bm.verts:
        v.co.x *= 0.20 * S
        v.co.y *= 0.42 * S
        v.co.z *= 0.80 * S
        # 船头上翘
        v.co.y += (v.co.z / (0.80 * S)) ** 2 * 0.24 * S * (1 if v.co.z > 0 else 0)
    keel = _obj_from_bm(bm, prefix + "_keel", mats["petal_w"])
    keel.rotation_euler = Euler((math.radians(-18), 0, 0), "XYZ")
    keel.location = (0, -0.20 * S, 0.86 * S)
    objs.append(keel)
    return objs


def build_robinia(lod="hero"):
    _reset()
    random.seed(23)
    mats = MATS_R()
    res = 1.0 if lod == "hero" else 0.55

    # 枝条:斜上的一小段
    br_pts = [Vector((-6.5 + t * 13.0, 0, 13.2 + math.sin(t * 2.6) * 0.35 + t * 1.2))
              for t in [i / 8 for i in range(9)]]
    _rod("branch", mats["bark"], 0.42, 0.30, br_pts, seg=9)

    def branch_at(t):
        i = min(int(t * 8), 7)
        f = t * 8 - i
        return br_pts[i].lerp(br_pts[i + 1], f)

    # 羽状复叶:叶轴 + 9 枚椭圆小叶(枝条右段,向后上方伸)
    leaf_base = branch_at(0.78)
    lr_dir = Vector((0.35, 0.72, 0.35)).normalized()
    LR = 9.0
    lr_pts = _bend_pts(leaf_base, lr_dir, LR, Vector((0, 0, -1.4)), n=7)
    _rod("leafrachis", mats["rachis"], 0.09, 0.05, lr_pts, seg=5)
    n_lf = 9 if lod == "hero" else 5
    for k in range(n_lf):
        t = 0.22 + 0.78 * (k // 2 * 2 + 1) / n_lf if False else 0.2 + 0.8 * k / (n_lf - 1)
        i = min(int(t * 6), 5)
        f = t * 6 - i
        pos = lr_pts[i].lerp(lr_pts[i + 1], f)
        sgn = 1 if k % 2 == 0 else -1
        if k == n_lf - 1:
            sgn = 0  # 顶小叶
        lf = _blade("leaflet%d" % k, mats["leaflet"],
                    length=2.3 - 0.35 * abs(t - 0.5), width=1.0, claw=0.25, claw_w=0.1,
                    nx=4, ny=7, cup=0.06, recurve=0.18, peak=1.0)
        _solidify(lf, 0.03)
        az = math.atan2(lr_dir.y, lr_dir.x) + sgn * math.radians(72)
        lf.rotation_euler = Euler((0, math.radians(14), az), "ZYX")
        lf.location = pos
    # 总状花序:从枝条中段垂下,轴略弯
    hang_base = branch_at(0.42)
    RL = 12.5
    rachis_pts = []
    for i in range(9):
        t = i / 8
        sway = math.sin(t * 2.2) * 0.5
        rachis_pts.append(hang_base + Vector((sway * 0.4, sway, -t * RL)))
    _rod("rachis", mats["rachis"], 0.14, 0.07, rachis_pts, seg=7)

    def rachis_at(t):
        i = min(int(t * 8), 7)
        f = t * 8 - i
        return rachis_pts[i].lerp(rachis_pts[i + 1], f)

    # 花:沿花序螺旋,花开方向朝外并微微下倾;末端(下)几枚小蕾
    n_fl = 13 if lod == "hero" else 9
    hero_t = 0.38
    hero_info = None
    for k in range(n_fl):
        t = 0.08 + 0.84 * k / (n_fl - 1)
        az_deg = (k * 137.5 + 80) % 360
        is_hero = abs(t - hero_t) < 0.04 and hero_info is None
        if is_hero:
            az_deg = 270  # 朝向 -Y(镜头一侧)
        az = math.radians(az_deg)
        base = rachis_at(t)
        out = Vector((math.cos(az), math.sin(az), 0))
        ped_dir = (out * 0.92 - Vector((0, 0, 0.39))).normalized()
        ped_len = 1.0
        prefix = "hero" if is_hero else "c%d" % k
        _rod(prefix + "_pedicel", mats["calyx"], 0.06, 0.05,
             _bend_pts(base, ped_dir, ped_len, Vector((0, 0, -0.06)), n=4), seg=5)
        fl_dir = (out * 0.94 - Vector((0, 0, 0.34))).normalized()
        rot = fl_dir.to_track_quat("Z", "Y").to_euler()
        open_t = 1.0 if t < 0.75 else max(0.0, (0.92 - t) / 0.17)
        if open_t < 0.35:
            bud = _capsule(prefix + "_bud", mats["petal_w"], 0.22, 0.75, seg=7, ring=5)
            bud.rotation_euler = rot
            bud.location = base + ped_dir * ped_len
            if is_hero:
                hero_info = (base + ped_dir * ped_len, fl_dir)
            continue
        fobjs = build_papilionaceous_flower(mats, prefix, res=res if is_hero else res * 0.65,
                                            open_t=open_t, scale=1.0 if is_hero else 0.82)
        _place(fobjs, base + ped_dir * ped_len, rot, scale=1.0)
        if is_hero:
            hero_info = (base + ped_dir * ped_len, fl_dir)
    hero_pos, hero_dir = hero_info

    # ---- 应用与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_standard", "hero_blotch"), "hero_petals")
    _join(fresh("hero_wing"), "hero_wings")
    _join(fresh("hero_keel"), "hero_keel_full")
    _join(fresh("hero_calyx", "hero_pedicel"), "hero_calyx_full")
    _join(fresh("c"), "raceme_flowers")
    _join(fresh("leaflet", "leafrachis"), "leaves")
    _join(fresh("rachis"), "raceme_axis")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.5
        _link(a)
        a.parent = root
        a.location = pos
        return a

    up_face = (hero_dir + Vector((0, 0, 0.55))).normalized()
    anchor("anchor_flowerCenter", hero_pos + hero_dir * 0.9)
    anchor("anchor_petalFocus", hero_pos + hero_dir * 0.5 + Vector((0, 0, 1.1)))
    anchor("anchor_stamenFocus", hero_pos + hero_dir * 1.15 + Vector((0, 0, -0.15)))
    nectar_pos = hero_pos + hero_dir * 0.55 + Vector((0, 0, 0.28))
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + up_face * 1.0)
    anchor("anchor_stemBase", br_pts[0] + Vector((0.5, 0, 0)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["robinia"] = build_robinia

# ---------------------------------------------------------------- 高丛蓝莓(坛形花冠模板)
def MATS_V():
    m = MATS()
    m.update({
        "urn": _mat("vac_urn", (0.90, 0.84, 0.82), rough=0.42, sss=0.12),
        "vcalyx": _mat("vac_calyx", (0.30, 0.36, 0.12), rough=0.55),
        "vped": _mat("vac_pedicel", (0.30, 0.09, 0.06), rough=0.55),
        "twig": _mat("vac_twig", (0.15, 0.075, 0.05), rough=0.75),
        "vleaf": _mat("vac_leaf", (0.13, 0.28, 0.08), rough=0.5),
        "style": _mat("vac_style", (0.75, 0.72, 0.55), rough=0.5),
    })
    return m


def _urn(name, mat, r_bulb, length, seg=14, rings=12, teeth=5):
    """坛形花冠:沿 -Z 放样(挂点在原点,口在下方),口缘 teeth 齿微外翻。"""
    bm = bmesh.new()
    ring_list = []
    for i in range(rings + 1):
        t = i / rings
        # 半径轮廓:挂点收窄 → 鼓腹 → 颈部收缩 → 口缘微张
        if t < 0.45:
            base = 0.52 + 0.48 * math.sin(t / 0.45 * math.pi / 2)
        elif t < 0.88:
            base = 1.0 - 0.52 * math.sin((t - 0.45) / 0.43 * math.pi / 2)
        else:
            base = 0.48 + 0.10 * ((t - 0.88) / 0.12) ** 1.5
        row = []
        for k in range(seg):
            th = k / seg * 2 * math.pi
            r = r_bulb * base
            if t > 0.92:
                r *= 1.0 + 0.055 * (0.5 + 0.5 * math.cos(teeth * th)) * ((t - 0.92) / 0.08)
            row.append(bm.verts.new((math.cos(th) * r, math.sin(th) * r, -t * length)))
        ring_list.append(row)
    for i in range(rings):
        for k in range(seg):
            bm.faces.new((ring_list[i][k], ring_list[i][(k + 1) % seg],
                          ring_list[i + 1][(k + 1) % seg], ring_list[i + 1][k]))
    bm.faces.new(list(reversed(ring_list[0])))  # 顶部封口
    return _obj_from_bm(bm, name, mat)


def build_vaccinium(lod="hero"):
    _reset()
    random.seed(31)
    mats = MATS_V()
    res = 1.0 if lod == "hero" else 0.55

    # 小枝:从左下往右上,红褐色嫩枝
    tw_pts = [Vector((-6.0 + t * 12.0, t * 1.6 - 0.8, 10.5 + t * 4.6 + math.sin(t * 3.0) * 0.4))
              for t in [i / 8 for i in range(9)]]
    _rod("twig", mats["twig"], 0.30, 0.16, tw_pts, seg=8)

    def twig_at(t):
        i = min(int(t * 8), 7)
        f = t * 8 - i
        return tw_pts[i].lerp(tw_pts[i + 1], f)

    # 叶:椭圆全缘,近枝端
    for k, (t, az_deg, ln) in enumerate([(0.68, 55, 4.2), (0.84, 235, 4.0), (0.96, 140, 3.4), (0.28, 320, 3.8)]):
        az = math.radians(az_deg)
        base = twig_at(t)
        out = Vector((math.cos(az), math.sin(az), 0))
        pd = (out * 0.62 + Vector((0, 0, 0.79))).normalized()
        _rod("lfstalk%d" % k, mats["vleaf"], 0.07, 0.05, _bend_pts(base, pd, 0.7, Vector((0, 0, -0.1)), n=3), seg=4)
        lf = _leaf("vleaf%d" % k, mats["vleaf"],
                   length=ln * 0.9, width=ln * 0.36,
                   nx=6, ny=10, droop=0.22, curl=0.18, fold=0.10)
        _solidify(lf, 0.035)
        lf.rotation_euler = Euler((0, math.radians(-14), az), "ZYX")
        lf.location = base + pd * 0.7

    hero_info = None

    def bell(prefix, base, az_deg, tilt_deg, scale, is_hero, open_t=1.0):
        nonlocal hero_info
        az = math.radians(az_deg)
        out = Vector((math.cos(az), math.sin(az), 0))
        # 花柄:先外再垂
        ped_dir = (out * 0.55 - Vector((0, 0, 0.84))).normalized()
        ped_len = 0.9 * scale
        _rod(prefix + "_pedicel", mats["vped"], 0.05, 0.04,
             _bend_pts(base, ped_dir, ped_len, out * 0.10, n=4), seg=4)
        tip = base + ped_dir * ped_len
        # 萼:小环
        cal = _capsule(prefix + "_calyx", mats["vcalyx"], 0.16 * scale, 0.16 * scale, seg=8, ring=4, squash=1.0)
        # 花冠轴:向下、按 tilt 外倾
        axis = (Vector((0, 0, -1)) + out * math.tan(math.radians(tilt_deg))).normalized()
        rot = (-axis).to_track_quat("Z", "Y").to_euler()  # _urn 沿 -Z 放样:局部 +Z 对准挂点方向
        L = (0.85 if open_t >= 0.99 else 0.6) * scale
        urn = _urn(prefix + "_corolla", mats["urn"], 0.34 * scale, L,
                   seg=18 if is_hero else 12, rings=14 if is_hero else 9)
        urn.rotation_euler = rot
        urn.location = tip
        cal.rotation_euler = rot
        cal.location = tip + axis * 0.02
        if is_hero:
            # 花柱微微露出口外
            sty = _rod(prefix + "_style", mats["style"], 0.035, 0.03,
                       [tip + axis * (L * 0.4), tip + axis * (L + 0.08)], seg=5)
            mouth = tip + axis * (L + 0.05)
            hero_info = (mouth, axis, tip)
        return tip

    # 主花簇:8 铃(含主花)挂在枝中段;副簇 4 铃 + 2 蕾在枝前段
    cl1 = twig_at(0.52)
    bells1 = [(270, 24, 1.0, True, 1.0), (210, 30, 0.95, False, 1.0), (330, 28, 0.92, False, 1.0),
              (150, 26, 0.9, False, 1.0), (30, 30, 0.94, False, 1.0), (90, 24, 0.9, False, 1.0),
              (250, 40, 0.8, False, 0.9), (10, 38, 0.82, False, 0.9)]
    if lod != "hero":
        bells1 = bells1[:5]
    for i, (az, tilt, sc, hero, op) in enumerate(bells1):
        off = Vector((math.cos(math.radians(az)) * 0.35, math.sin(math.radians(az)) * 0.35, 0.05 * (i % 3)))
        bell("hero" if hero else "c1_%d" % i, cl1 + off, az, tilt, sc, hero, op)
    cl2 = twig_at(0.16)
    bells2 = [(300, 26, 0.85, 1.0), (200, 30, 0.8, 1.0), (40, 28, 0.78, 0.9), (120, 34, 0.7, 0.55)]
    if lod != "hero":
        bells2 = bells2[:2]
    for i, (az, tilt, sc, op) in enumerate(bells2):
        off = Vector((math.cos(math.radians(az)) * 0.28, math.sin(math.radians(az)) * 0.28, 0))
        bell("c2_%d" % i, cl2 + off, az, tilt, sc, False, op)

    hero_mouth, hero_axis, hero_tip = hero_info

    # ---- 应用与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_corolla"), "hero_bell")
    _join(fresh("hero_calyx", "hero_pedicel", "hero_style"), "hero_parts")
    _join(fresh("c1_", "c2_"), "cluster_flowers")
    _join(fresh("vleaf", "lfstalk"), "leaves")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.4
        _link(a)
        a.parent = root
        a.location = pos
        return a

    anchor("anchor_flowerCenter", hero_tip + hero_axis * 0.45)
    anchor("anchor_petalFocus", hero_tip + hero_axis * 0.35 + Vector((0, -0.5, 0)))
    anchor("anchor_stamenFocus", hero_mouth)
    nectar_pos = hero_mouth + hero_axis * 0.06
    anchor("anchor_nectarEntrance", nectar_pos)
    # 口朝下:落点法线沿花冠轴向外(向下偏外)——蜂倒悬吊在铃口上,这正是蓝莓的真实访花姿态
    anchor("anchor_landingNormal", nectar_pos + hero_axis * 1.0)
    anchor("anchor_stemBase", tw_pts[0] + Vector((0.4, 0, 0.1)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["vaccinium"] = build_vaccinium

# ---------------------------------------------------------------- 白车轴草(球形头状花序)
def MATS_T():
    m = MATS()
    m.update({
        "tfloret": _mat("tri_floret", (0.88, 0.86, 0.80), rough=0.45, sss=0.10),
        "tbrown": _mat("tri_brown", (0.27, 0.17, 0.09), rough=0.6),
        "tcalyx": _mat("tri_calyx", (0.26, 0.34, 0.10), rough=0.55),
        "tstem": _mat("tri_stem", (0.16, 0.30, 0.08), rough=0.55),
        "tleaf": _mat("tri_leaf", (0.13, 0.29, 0.08), rough=0.5),
    })
    return m


def _clover_floret(prefix, mats, S=1.0, brown=False, res=0.5):
    """简化蝶形小花:萼筒 + 旗瓣 + 龙骨体(白车轴草小花 7–12mm,远看只需轮廓)。
    局部 +Z 为花开方向,+Y 为旗瓣一侧。"""
    mat = mats["tbrown"] if brown else mats["tfloret"]
    objs = []
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=7,
                          radius1=0.045 * S, radius2=0.075 * S, depth=0.22 * S)
    for v in bm.verts:
        v.co.z += 0.11 * S
    cal = _obj_from_bm(bm, prefix + "_cal", mats["tcalyx"])
    objs.append(cal)
    std = _blade(prefix + "_std", mat,
                 length=0.46 * S, width=0.16 * S, claw=0.10 * S, claw_w=0.06 * S,
                 nx=3, ny=max(4, round(8 * res)), cup=0.22, recurve=-0.06, peak=0.75)
    _solidify(std, 0.015)
    std.rotation_euler = Euler((0, math.radians(-38), math.radians(90)), "ZYX")
    std.location = (0, 0.02 * S, 0.16 * S)
    objs.append(std)
    keel = _capsule(prefix + "_keel", mat, 0.055 * S, 0.30 * S, seg=7, ring=5, squash=0.6)
    keel.rotation_euler = Euler((math.radians(-78), 0, 0), "XYZ")
    keel.location = (0, -0.03 * S, 0.16 * S)
    objs.append(keel)
    return objs


def _clover_head(prefix, mats, center, radius, n, brown_low=0, hero_slot=None, res=0.5):
    """球形头状花序:小花沿球面呈放射状;brown_low 指定下部变褐下垂的小花数。
    返回 hero 小花的 (位置, 径向) 或 None。"""
    hero_info = None
    golden = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        # 球面均匀分布(上 3/4 球带),自上而下
        zf = 1.0 - 1.55 * (i + 0.5) / n  # 1 → -0.55
        rr = math.sqrt(max(0.0, 1 - zf * zf))
        th = i * golden
        d = Vector((math.cos(th) * rr, math.sin(th) * rr, zf)).normalized()
        is_brown = i >= n - brown_low
        if is_brown:
            # 老花:向下反折
            d = Vector((d.x * 0.8, d.y * 0.8, -0.85)).normalized()
        is_hero = hero_slot is not None and i == hero_slot
        S = 1.05 if not is_hero else 1.25
        fl_prefix = "hero" if is_hero else prefix + "_%d" % i
        objs = _clover_floret(fl_prefix, mats, S=S, brown=is_brown, res=res if not is_hero else 1.0)
        rot = d.to_track_quat("Z", "Y").to_euler()
        _place(objs, center + d * radius * 0.62, rot, scale=1.0)
        if is_hero:
            hero_info = (center + d * (radius * 0.62 + 0.38), d)
    return hero_info


def build_trifolium(lod="hero"):
    _reset()
    random.seed(41)
    mats = MATS_T()
    res = 1.0 if lod == "hero" else 0.5

    # 主花梗 + 主花序(顶部);副花序较老,下部变褐
    hero_top = Vector((0, -0.6, 7.6))
    stalk1 = _bend_pts(Vector((0.4, 0.6, 0)), (hero_top - Vector((0.4, 0.6, 0))).normalized(),
                       (hero_top - Vector((0.4, 0.6, 0))).length, Vector((0.5, -0.3, 0)), n=6)
    _rod("stalk1", mats["tstem"], 0.10, 0.075, stalk1, seg=6)
    old_top = Vector((3.6, 1.8, 6.1))
    stalk2 = _bend_pts(Vector((1.6, 1.2, 0)), (old_top - Vector((1.6, 1.2, 0))).normalized(),
                       (old_top - Vector((1.6, 1.2, 0))).length, Vector((-0.4, 0.4, 0)), n=6)
    _rod("stalk2", mats["tstem"], 0.09, 0.07, stalk2, seg=6)

    n1 = 52 if lod == "hero" else 26
    n2 = 40 if lod == "hero" else 20
    # hero 小花取朝向 -Y(镜头)、约 45° 仰角的槽位:遍历找最接近的
    golden = math.pi * (3 - math.sqrt(5))
    best, best_score = 0, -9
    for i in range(n1):
        zf = 1.0 - 1.55 * (i + 0.5) / n1  # 与 _clover_head 同步
        rr = math.sqrt(max(0.0, 1 - zf * zf))
        th = i * golden
        d = Vector((math.cos(th) * rr, math.sin(th) * rr, zf)).normalized()
        score = -d.y * 0.8 + d.z * 0.6  # 朝 -Y 且偏上
        if score > best_score:
            best, best_score = i, score
    hero_info = _clover_head("h1", mats, hero_top, 0.95, n1, brown_low=0, hero_slot=best, res=res)
    _clover_head("h2", mats, old_top, 0.88, n2, brown_low=max(6, n2 // 3), hero_slot=None, res=res)

    # 三出复叶 ×3:长叶柄,三枚倒卵形小叶
    for k, (bx, by, az_deg, ph) in enumerate([(-1.6, -0.7, 250, 4.4), (2.6, -0.4, 300, 3.8), (0.9, 2.2, 60, 4.0)]):
        base = Vector((bx, by, 0))
        az = math.radians(az_deg)
        out = Vector((math.cos(az), math.sin(az), 0))
        tip_dir = (out * 0.42 + Vector((0, 0, 0.91))).normalized()
        pet_pts = _bend_pts(base, tip_dir, ph, out * 0.35, n=5)
        _rod("petiole%d" % k, mats["tstem"], 0.07, 0.05, pet_pts, seg=5)
        top = pet_pts[-1]
        for j in range(3):
            la = az + math.radians(-125 + 125 * j)
            lf = _blade("tleaf%d_%d" % (k, j), mats["tleaf"],
                        length=1.45, width=0.95, claw=0.20, claw_w=0.10,
                        nx=5, ny=9, cup=0.05, recurve=0.08, peak=0.7)
            _solidify(lf, 0.03)
            lf.rotation_euler = Euler((0, math.radians(-18), la), "ZYX")
            lf.location = top
    # ---- 应用与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_std"), "hero_petals")
    _join(fresh("hero_keel", "hero_cal"), "hero_parts")
    _join(fresh("h1_"), "head_florets")
    _join(fresh("h2_"), "old_head_florets")
    _join(fresh("tleaf", "petiole"), "leaves")
    _join(fresh("stalk"), "stalks")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.35
        _link(a)
        a.parent = root
        a.location = pos
        return a

    hero_pos, hero_dir = hero_info
    anchor("anchor_flowerCenter", hero_top + Vector((0, -0.4, 0.5)))
    anchor("anchor_petalFocus", hero_pos + hero_dir * 0.35 + Vector((0, 0, 0.18)))
    anchor("anchor_stamenFocus", hero_pos + hero_dir * 0.22)
    nectar_pos = hero_pos + hero_dir * 0.12
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + hero_dir * 1.0)
    anchor("anchor_stemBase", Vector((0.4, 0.6, 0.5)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["trifolium"] = build_trifolium

# ---------------------------------------------------------------- 薰衣草(穗状轮伞花序)
def MATS_L():
    m = MATS()
    m.update({
        "lav": _mat("lav_corolla", (0.24, 0.13, 0.55), rough=0.45, sss=0.08),
        "lav_deep": _mat("lav_calyx", (0.17, 0.13, 0.24), rough=0.55),
        "lav_stem": _mat("lav_stem", (0.15, 0.23, 0.10), rough=0.55),
        "lav_leaf": _mat("lav_leaf", (0.20, 0.28, 0.15), rough=0.5),
    })
    return m


def _lav_floret(prefix, mats, S=1.0, lips=True):
    """薰衣草小花:灰紫萼筒 + 紫色花冠管 + 上下唇。局部 +Z 为伸出方向。"""
    objs = []
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=7,
                          radius1=0.028 * S, radius2=0.046 * S, depth=0.38 * S)
    for v in bm.verts:
        v.co.z += 0.19 * S
    objs.append(_obj_from_bm(bm, prefix + "_cal", mats["lav_deep"]))
    tube = _rod(prefix + "_tube", mats["lav"], 0.026 * S, 0.034 * S,
                [Vector((0, 0, 0.32 * S)), Vector((0, 0.015 * S, 0.52 * S)), Vector((0, 0.045 * S, 0.68 * S))],
                seg=7)
    objs.append(tube)
    if lips:
        up = _blade(prefix + "_lipU", mats["lav"],
                    length=0.11 * S, width=0.07 * S, claw=0.015 * S, claw_w=0.035 * S,
                    nx=3, ny=4, cup=0.14, recurve=-0.06, peak=0.7)
        _solidify(up, 0.01)
        up.rotation_euler = Euler((0, math.radians(-55), math.radians(90)), "ZYX")
        up.location = (0, 0.055 * S, 0.66 * S)
        objs.append(up)
        lo = _blade(prefix + "_lipL", mats["lav"],
                    length=0.10 * S, width=0.09 * S, claw=0.015 * S, claw_w=0.04 * S,
                    nx=3, ny=4, cup=0.10, recurve=0.08, peak=0.7)
        _solidify(lo, 0.01)
        lo.rotation_euler = Euler((0, math.radians(-12), math.radians(-90)), "ZYX")
        lo.location = (0, 0.04 * S, 0.68 * S)
        objs.append(lo)
    return objs


def _lav_spike(prefix, mats, axis_at, z0, height, whorls, per_whorl, hero_slot=None, res=1.0):
    """花穗:whorls 轮 × per_whorl 花,轮花贴着茎轴(axis_at(z) 给出该高度的轴心);顶端几枚小蕾。
    返回 hero 小花 (位置, 朝向) 或 None。"""
    hero_info = None
    idx = 0
    for w in range(whorls):
        zw = z0 + (w + 0.5) / whorls * height
        rot_off = w * 0.35
        ax = axis_at(zw)
        for k in range(per_whorl):
            az = k / per_whorl * 2 * math.pi + rot_off
            d = (Vector((math.cos(az), math.sin(az), 0)) * 0.62 + Vector((0, 0, 0.79))).normalized()
            is_hero = hero_slot is not None and idx == hero_slot
            objs = _lav_floret(prefix + "_%d" % idx if not is_hero else "hero", mats,
                               S=1.15 if is_hero else 1.0, lips=(res >= 0.9 or is_hero))
            rot = d.to_track_quat("Z", "Y").to_euler()
            pos = ax + Vector((d.x, d.y, 0)) * 0.05
            _place(objs, pos, rot, scale=1.0)
            if is_hero:
                hero_info = (pos + d * 0.85, d)
            idx += 1
    # 顶端小蕾
    tip = axis_at(z0 + height)
    for k in range(4):
        az = k * 1.9
        bud = _capsule(prefix + "_bud%d" % k, mats["lav_deep"], 0.05, 0.28, seg=6, ring=4)
        bud.location = tip + Vector((math.cos(az) * 0.09, math.sin(az) * 0.09, 0.02 * k))
    return hero_info


def build_lavandula(lod="hero"):
    _reset()
    random.seed(53)
    mats = MATS_L()
    res = 1.0 if lod == "hero" else 0.5

    spikes = [
        # (基点, 顶高, 穗长, 轮数, hero?)
        (Vector((0, -0.4, 0)), 13.6, 4.6, 7, True),
        (Vector((-2.4, 1.4, 0)), 11.8, 3.6, 5, False),
        (Vector((2.6, 1.8, 0)), 12.6, 3.8, 5, False),
    ]
    if lod != "hero":
        spikes = spikes[:2]
    hero_info = None
    for si, (base, top_z, sp_h, whorls, has_hero) in enumerate(spikes):
        sway = 0.5 if si else 0.3
        H = top_z + sp_h + 0.25  # 茎一直穿到穗顶,轮间不露断
        pts = [base + Vector((math.sin(t * 2.0) * sway * t, math.cos(t * 1.5) * sway * 0.5 * t, t * H))
               for t in [i / 7 for i in range(8)]]
        _rod("spikestem%d" % si, mats["lav_stem"], 0.09, 0.045, pts, seg=6)

        def axis_at(z, _pts=pts, _H=H):
            t = min(max(z / _H, 0.0), 1.0)
            i = min(int(t * 7), 6)
            f = t * 7 - i
            return _pts[i].lerp(_pts[i + 1], f)
        per = 8 if lod == "hero" else 5
        hero_slot = None
        if has_hero:
            # 取中段一轮里朝 -Y 的槽位:轮 3(0 起),k 使 az≈270°
            w_target = 3
            rot_off = w_target * 0.35
            best_k, best = 0, 9e9
            for k in range(per):
                az = (k / per * 2 * math.pi + rot_off) % (2 * math.pi)
                diff = abs(az - math.pi * 1.5)
                if diff < best:
                    best, best_k = diff, k
            hero_slot = w_target * per + best_k
        info = _lav_spike("s%d" % si, mats, axis_at, top_z, sp_h, whorls, per,
                          hero_slot=hero_slot, res=res)
        if info:
            hero_info = info
    # 基部线形叶(灰绿,对生几对)
    for k in range(8 if lod == "hero" else 5):
        az = math.radians(k * 47 + 15)
        bx = math.cos(az) * 0.9
        by = math.sin(az) * 0.9
        lf = _blade("lavleaf%d" % k, mats["lav_leaf"],
                    length=3.4 + (k % 3) * 0.5, width=0.24, claw=0.15, claw_w=0.08,
                    nx=3, ny=6, cup=0.20, recurve=0.16, peak=1.0)
        _solidify(lf, 0.03)
        lf.rotation_euler = Euler((0, math.radians(-52 - (k % 3) * 9), az), "ZYX")
        lf.location = (bx, by, 0.4 + (k % 2) * 0.5)

    # ---- 应用与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_tube", "hero_lip"), "hero_corolla")
    _join(fresh("hero_cal"), "hero_calyx_full")
    _join(fresh("s0_"), "spike_florets")
    _join(fresh("s1_", "s2_"), "spike_florets_bg")
    _join(fresh("lavleaf"), "leaves")
    _join(fresh("spikestem"), "stems")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.35
        _link(a)
        a.parent = root
        a.location = pos
        return a

    hero_pos, hero_dir = hero_info
    spike_mid = Vector((hero_pos.x - hero_dir.x * 0.85, hero_pos.y - hero_dir.y * 0.85, hero_pos.z + 0.6))
    anchor("anchor_flowerCenter", spike_mid + Vector((0, -0.3, 0)))
    anchor("anchor_petalFocus", hero_pos + hero_dir * 0.22 + Vector((0, 0, 0.10)))
    anchor("anchor_stamenFocus", hero_pos + hero_dir * 0.10)
    nectar_pos = hero_pos + hero_dir * 0.05
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + hero_dir * 1.0)
    anchor("anchor_stemBase", Vector((0, -0.4, 0.6)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["lavandula"] = build_lavandula

# ---------------------------------------------------------------- 紫花苜蓿(短总状花序,复用蝶形花件)
def MATS_M():
    m = MATS()
    m.update({
        "petal_w": _mat("med_petal", (0.28, 0.11, 0.48), rough=0.45, sss=0.08),
        "blotch": _mat("med_blotch", (0.55, 0.42, 0.68), rough=0.5),
        "calyx": _mat("med_calyx", (0.20, 0.28, 0.10), rough=0.55),
        "mstem": _mat("med_stem", (0.15, 0.27, 0.09), rough=0.55),
        "mleaf": _mat("med_leaf", (0.12, 0.26, 0.07), rough=0.5),
        "mbud": _mat("med_bud", (0.16, 0.07, 0.30), rough=0.5),
    })
    return m


def _medicago_raceme(prefix, mats, base, up_dir, n, hero_slot=None, res=0.5):
    """短而密的总状花序:n 朵紫色蝶形小花螺旋上排,顶端小蕾。返回 hero (位置, 朝向)。"""
    hero_info = None
    L = 2.4
    axis = up_dir.normalized()
    golden = math.radians(137.5)
    for i in range(n):
        t = (i + 0.5) / n
        az = i * golden
        # 花开方向:绕花序轴的外向 + 上抬 35°
        side = Vector((math.cos(az), math.sin(az), 0))
        side = (side - axis * side.dot(axis)).normalized()
        d = (side * 0.82 + axis * 0.57).normalized()
        pos = base + axis * (t * L) + side * 0.14
        is_hero = hero_slot is not None and i == hero_slot
        objs = build_papilionaceous_flower(
            mats, "hero" if is_hero else prefix + "_%d" % i,
            res=1.0 if is_hero else res, open_t=1.0 if t < 0.8 else 0.7,
            scale=0.50 if is_hero else 0.42)
        rot = d.to_track_quat("Z", "Y").to_euler()
        _place(objs, pos, rot, scale=1.0)
        if is_hero:
            hero_info = (pos + d * 0.55, d)
    tip = base + axis * (L + 0.15)
    for k in range(3):
        az = k * 2.1
        bud = _capsule(prefix + "_mbud%d" % k, mats["mbud"], 0.07, 0.30, seg=6, ring=4)
        bud.rotation_euler = axis.to_track_quat("Z", "Y").to_euler()
        bud.location = tip + Vector((math.cos(az) * 0.10, math.sin(az) * 0.10, 0.03 * k))
    return hero_info


def build_medicago(lod="hero"):
    _reset()
    random.seed(61)
    mats = MATS_M()
    res = 1.0 if lod == "hero" else 0.5

    stems = [
        # (基点, 顶点, 花序朝向, hero?)
        (Vector((0, -0.5, 0)), Vector((0.6, -1.3, 10.2)), Vector((0.15, -0.25, 1)), True),
        (Vector((1.8, 1.2, 0)), Vector((2.7, 1.9, 8.8)), Vector((0.2, 0.15, 1)), False),
        (Vector((-2.0, 1.0, 0)), Vector((-2.9, 1.7, 8.0)), Vector((-0.2, 0.12, 1)), False),
    ]
    if lod != "hero":
        stems = stems[:2]
    hero_info = None
    n_fl = 14 if lod == "hero" else 9
    for si, (b, top, rdir, has_hero) in enumerate(stems):
        pts = _bend_pts(b, (top - b).normalized(), (top - b).length, Vector((0.5 - si * 0.4, 0.3, 0)), n=6)
        _rod("mstem%d" % si, mats["mstem"], 0.10, 0.06, pts, seg=6)
        hero_slot = None
        if has_hero:
            # 取中段朝 -Y 的槽位
            golden = math.radians(137.5)
            best_i, best = 0, 9e9
            for i in range(n_fl):
                if not (0.3 < (i + 0.5) / n_fl < 0.75):
                    continue
                az = (i * golden) % (2 * math.pi)
                diff = abs(az - math.pi * 1.5)
                if diff < best:
                    best, best_i = diff, i
            hero_slot = best_i
        info = _medicago_raceme("r%d" % si, mats, top, rdir, n_fl, hero_slot=hero_slot, res=res * 0.6)
        if info:
            hero_info = info
        # 茎上两组窄三出复叶
        for k, tt in enumerate((0.45, 0.72)):
            node = pts[int(tt * 5)]
            az = math.radians(90 + si * 120 + k * 150)
            out = Vector((math.cos(az), math.sin(az), 0))
            pd = (out * 0.75 + Vector((0, 0, 0.66))).normalized()
            _rod("mpet%d_%d" % (si, k), mats["mstem"], 0.05, 0.04,
                 _bend_pts(node, pd, 0.9, Vector((0, 0, -0.08)), n=3), seg=4)
            ltop = node + pd * 0.9
            for j in range(3):
                la = az + math.radians(-115 + 115 * j)
                lf = _blade("mleaf%d_%d_%d" % (si, k, j), mats["mleaf"],
                            length=1.35, width=0.48, claw=0.22, claw_w=0.07,
                            nx=4, ny=7, cup=0.08, recurve=0.10, peak=1.05)
                _solidify(lf, 0.025)
                lf.rotation_euler = Euler((0, math.radians(-16), la), "ZYX")
                lf.location = ltop

    # ---- 应用与合并
    all_meshes = [o for o in bpy.data.collections[COLL].objects if o.type == "MESH"]
    _apply_mods(all_meshes)

    def fresh(*prefixes):
        return [o for o in bpy.data.collections[COLL].objects
                if o.type == "MESH" and o.name.startswith(prefixes)]

    _join(fresh("hero_standard", "hero_blotch"), "hero_petals")
    _join(fresh("hero_wing", "hero_keel"), "hero_wings_keel")
    _join(fresh("hero_calyx"), "hero_calyx_full")
    _join(fresh("r0_", "r1_", "r2_"), "raceme_florets")
    _join(fresh("mleaf", "mpet"), "leaves")
    _join(fresh("mstem"), "stems")

    root = bpy.data.objects.new("flower_root", None)
    _link(root)
    for o in list(bpy.data.collections[COLL].objects):
        if o is root:
            continue
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            continue
        if o.parent is None or (o.parent and o.parent.name.startswith("tmp_pivot")):
            keep = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = keep
    for o in list(bpy.data.collections[COLL].objects):
        if o.type == "EMPTY" and o.name.startswith("tmp_pivot"):
            bpy.data.objects.remove(o, do_unlink=True)

    def anchor(name, pos):
        a = bpy.data.objects.new(name, None)
        a.empty_display_size = 0.35
        _link(a)
        a.parent = root
        a.location = pos
        return a

    hero_pos, hero_dir = hero_info
    anchor("anchor_flowerCenter", hero_pos - hero_dir * 0.35 + Vector((0, 0, 0.45)))
    anchor("anchor_petalFocus", hero_pos + hero_dir * 0.18 + Vector((0, 0, 0.14)))
    anchor("anchor_stamenFocus", hero_pos + hero_dir * 0.10)
    nectar_pos = hero_pos + hero_dir * 0.05
    anchor("anchor_nectarEntrance", nectar_pos)
    anchor("anchor_landingNormal", nectar_pos + hero_dir * 1.0)
    anchor("anchor_stemBase", Vector((0, -0.5, 0.5)))

    root.scale = (ROOT_SCALE,) * 3
    return root


BUILDERS["medicago"] = build_medicago








def _select_tree(obj):
    obj.select_set(True)
    for c in obj.children:
        _select_tree(c)


def export_flower(flower):
    for lod, suffix in (("hero", ""), ("low", "-low")):
        root = BUILDERS[flower](lod)
        bpy.ops.object.select_all(action="DESELECT")
        _select_tree(root)
        bpy.ops.export_scene.gltf(
            filepath=BASE_DIR + "/flowermodel/flower-%s%s.glb" % (flower, suffix),
            use_selection=True, export_animations=False)
        print("exported flower:", flower, lod)


print("flower_gen loaded; flowers:", list(BUILDERS))
