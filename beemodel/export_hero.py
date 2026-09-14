# export_hero.py -- 职型精模一键导出管线(建模→烘焙→绒毛网格化→锚点命名→GLB)
# usage inside Blender:
#   exec(compile(open(r"<项目根>/beemodel/export_hero.py", encoding="utf-8").read(), "export_hero.py", "exec"))
#   export_hero("queen"); export_hero("drone")
import bpy, math, random
from mathutils import Vector, Matrix

import os as _os
BASE_DIR = (_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
            if "__file__" in globals() else _os.getcwd()).replace("\\", "/")
Z0 = 1.5
exec(compile(open(BASE_DIR + "/bee_gen.py", encoding="utf-8").read(), "bee_gen.py", "exec"))

_HB = PRESETS["honeybee"]  # noqa: F821  (defined by bee_gen exec)
# 根节点缩放:1 单位 = 1cm,按物种真实体型区分(东方蜜蜂工蜂明显更小)
ROOT_SCALE = {"queen": 0.3, "drone": 0.3, "cerana": 0.24, "bombus": 0.27,
              "osmia": 0.27, "megachile": 0.17, "xylocopa": 0.48,
              "cerana-queen": 0.24, "cerana-drone": 0.24}
CASTE_PRESETS = {
    # 西方蜜蜂工蜂:honeybee 基础预设 + 原 bee-hero.glb 的绒毛参数
    # (从旧 GLB 反推:胸 4200/头 500/腹 1100 根,长 0.085/0.045/0.045)
    "worker": dict(
        _HB,
        fuzz=dict(thorax=(4200, 0.085), abdomen=(1100, 0.045), head=(500, 0.045)),
    ),
    # 角额壁蜂 Osmia cornifrons 雌蜂:粗壮,胸部赭色密毛,腹面集粉毛(scopa),无花粉筐
    "osmia": dict(
        _HB,
        ab_len=1.3, ab_fat=1.05, waist=-0.05,
        stripe_scale=1.2, stripe_distort=1.0, stripe_balance=0.5,
        col_amber=(0.1, 0.07, 0.05), col_band=(0.03, 0.02, 0.015),
        col_chitin=(0.04, 0.03, 0.025), col_fuzz=(0.6, 0.36, 0.1),
        fuzz=dict(thorax=(4200, 0.16), abdomen=(2600, 0.12), head=(500, 0.08)),
        eye=0.95, wing_len=1.75, wing_wid=0.75, leg_r=0.045,
        pollen=False, stinger=0.2,
    ),
    # 苜蓿切叶蜂 Megachile rotundata 雌蜂:小而壮,深灰体,腹部白毛带 + 腹面集粉毛,大头
    "megachile": dict(
        _HB,
        ab_len=1.3, ab_fat=1.0, waist=-0.05,
        stripe_scale=1.6, stripe_distort=0.6, stripe_balance=0.5,
        col_amber=(0.16, 0.15, 0.14), col_band=(0.05, 0.05, 0.05),
        col_chitin=(0.08, 0.075, 0.07), col_fuzz=(0.12, 0.11, 0.1),
        fuzz=dict(thorax=(2600, 0.09), abdomen=(2400, 0.08), head=(500, 0.06)),
        eye=1.0, wing_len=1.7, wing_wid=0.72, leg_r=0.04,
        pollen=False, stinger=0.2,
    ),
    # 紫木蜂 Xylocopa violacea:大型,黑体蓝紫金属光泽,稀毛,烟紫色翅
    "xylocopa": dict(
        _HB,
        ab_len=1.55, ab_fat=1.15, waist=-0.1,
        stripe_scale=0.9, stripe_distort=0.8, stripe_balance=0.5,
        col_amber=(0.05, 0.04, 0.12), col_band=(0.02, 0.015, 0.06),
        ab_metal=0.55, ab_rough=0.25,
        col_chitin=(0.04, 0.035, 0.09), chitin_metal=0.5, chitin_rough=0.3,
        col_fuzz=(0.06, 0.05, 0.07),
        fuzz=dict(thorax=(1400, 0.08), abdomen=(300, 0.04), head=(250, 0.05)),
        eye=1.0, wing_len=2.3, wing_wid=0.85, wing_alpha=0.55,
        col_wing=(0.28, 0.2, 0.4), leg_r=0.06,
        pollen=False, stinger=0.25, sss=0.02,
    ),
    # 欧洲熊蜂 Bombus terrestris 工蜂:圆胖,浓密长绒毛分区着色
    # (黑底 + 前胸黄领 + 腹前黄带 + 白尾),甲壳近黑,足粗壮
    "bombus": dict(
        _HB,
        ab_len=1.55, ab_fat=1.3, waist=-0.15,
        stripe_scale=0.6, stripe_distort=1.0, stripe_balance=0.5,
        col_amber=(0.07, 0.055, 0.045), col_band=(0.02, 0.018, 0.016),
        col_fuzz=(0.05, 0.045, 0.04),
        fuzz=dict(thorax=(5200, 0.22), abdomen=(4600, 0.2), head=(450, 0.08)),
        eye=0.95, wing_len=1.7, wing_wid=0.75, leg_r=0.055,
        pollen=True, stinger=0.25,
    ),
    # 东方蜜蜂 Apis cerana 工蜂:整体更小,腹部环纹更均匀清晰,色调偏灰黄
    "cerana": dict(
        _HB,
        ab_len=1.32, ab_fat=0.95, stripe_scale=1.5, stripe_distort=1.0,
        stripe_balance=0.5,
        col_amber=(0.6, 0.33, 0.04), col_band=(0.015, 0.01, 0.006),
        col_fuzz=(0.4, 0.24, 0.06),
        fuzz=dict(thorax=(3400, 0.1), abdomen=(1000, 0.055), head=(400, 0.05)),
        eye=1.0, wing_len=1.9,
    ),
    "queen": dict(
        _HB,
        ab_len=1.95, ab_fat=0.8, stripe_scale=1.35,
        col_amber=(0.55, 0.26, 0.02),
        fuzz=dict(thorax=(2400, 0.085), abdomen=(400, 0.04), head=(280, 0.045)),
        eye=0.85, wing_len=1.8, pollen=False, stinger=0.3,
    ),
    "drone": dict(
        _HB,
        ab_len=1.3, ab_fat=1.06, stripe_scale=1.0, stripe_balance=0.55,
        col_band=(0.008, 0.006, 0.005),
        fuzz=dict(thorax=(3800, 0.12), abdomen=(600, 0.05), head=(200, 0.04)),
        eye=1.65, wing_len=2.15, wing_wid=0.85, pollen=False, stinger=0.0,
        leg_r=0.045,
    ),
}

# 东方蜜蜂三职型:在 cerana 基础上套用蜂王(长腹)/雄蜂(大眼粗胸)形态差异
CASTE_PRESETS["cerana-queen"] = dict(
    CASTE_PRESETS["cerana"],
    ab_len=1.85, ab_fat=0.78, stripe_scale=1.6,
    fuzz=dict(thorax=(2400, 0.085), abdomen=(400, 0.04), head=(280, 0.045)),
    eye=0.85, wing_len=1.75, pollen=False, stinger=0.28,
)
CASTE_PRESETS["cerana-drone"] = dict(
    CASTE_PRESETS["cerana"],
    ab_len=1.25, ab_fat=1.04, stripe_balance=0.55,
    fuzz=dict(thorax=(3600, 0.11), abdomen=(600, 0.05), head=(200, 0.04)),
    eye=1.6, wing_len=2.05, wing_wid=0.82, pollen=False, stinger=0.0, leg_r=0.044,
)

RENAME = {
    "eyeL": "compoundEyeL", "eyeR": "compoundEyeR",
    "antenna_L": "antennaL", "antenna_R": "antennaR",
    "forewing_L": "foreWingL", "forewing_R": "foreWingR",
    "hindwing_L": "hindWingL", "hindwing_R": "hindWingR",
    "leg_0_L": "foreLegL", "leg_1_L": "midLegL", "leg_2_L": "hindLegL",
    "leg_0_R": "foreLegR", "leg_1_R": "midLegR", "leg_2_R": "hindLegR",
    "stinger": "sting",
}


def _post_build_tweaks(caste):
    if caste == "bombus":
        # 腹壳按毛色分区上底色(白尾/黑身/黄带),烘焙后毛下透色,
        # 提高毛色分带在中远景的辨识度
        ab = bpy.data.objects["abdomen"]
        mat = ab.data.materials[0]
        nt = mat.node_tree
        for n in list(nt.nodes):
            if n.type not in ('OUTPUT_MATERIAL', 'BSDF_PRINCIPLED'):
                nt.nodes.remove(n)
        bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
        coord = nt.nodes.new("ShaderNodeTexCoord")
        sep = nt.nodes.new("ShaderNodeSeparateXYZ")
        rng_map = nt.nodes.new("ShaderNodeMapRange")
        rng_map.inputs["From Min"].default_value = -1.0
        rng_map.inputs["From Max"].default_value = 1.0
        ramp = nt.nodes.new("ShaderNodeValToRGB")
        ramp.color_ramp.interpolation = 'CONSTANT'
        ramp.color_ramp.elements[0].color = (0.75, 0.72, 0.62, 1)  # 白尾(x=-1 端)
        # 边界与毛色分区对齐(白尾 world<-2.25 → t≈0.2;黄带 world>-1.35 → t≈0.45)
        e1 = ramp.color_ramp.elements[1]
        e1.position = 0.2
        e1.color = (0.045, 0.04, 0.035, 1)  # 黑身
        e2 = ramp.color_ramp.elements.new(0.45)
        e2.color = (0.62, 0.42, 0.06, 1)  # 前段黄带
        nt.links.new(coord.outputs["Object"], sep.inputs["Vector"])
        nt.links.new(sep.outputs["X"], rng_map.inputs["Value"])
        nt.links.new(rng_map.outputs["Result"], ramp.inputs["Fac"])
        nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
        return
    if caste == "megachile":
        # 切叶蜂:头大颚强,腹部略扁
        head = bpy.data.objects["head"]
        head.scale = tuple(v * 1.15 for v in head.scale)
        ab = bpy.data.objects["abdomen"]
        ab.scale = (ab.scale[0], ab.scale[1], ab.scale[2] * 0.82)
        return
    if caste.endswith("drone"):
        # 雄蜂标志:巨大复眼在头顶靠拢,胸部更粗壮
        for s, name in ((1, "eyeL"), (-1, "eyeR")):
            eye = bpy.data.objects[name]
            eye.location = (1.08, s * 0.19, Z0 + 0.33)
            eye.scale = (0.3, 0.3, 0.44)
            eye.rotation_euler = (s * 0.5, 0, 0)
        thorax = bpy.data.objects["thorax"]
        thorax.scale = tuple(v * 1.12 for v in thorax.scale)


def _strip_particles():
    for name in ("thorax", "abdomen", "head"):
        obj = bpy.data.objects.get(name)
        if not obj:
            continue
        for modifier in list(obj.modifiers):
            if modifier.type == 'PARTICLE_SYSTEM':
                obj.modifiers.remove(modifier)


def _bake_stripes(caste):
    ab = bpy.data.objects["abdomen"]
    mat = ab.data.materials[0]
    nt = mat.node_tree
    img = bpy.data.images.new("abdomen_stripes_" + caste, 1024, 1024)
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    nt.nodes.active = tex
    tex.select = True
    bpy.ops.object.select_all(action='DESELECT')
    ab.select_set(True)
    bpy.context.view_layer.objects.active = ab
    scene = bpy.context.scene
    old_samples = scene.cycles.samples
    scene.cycles.samples = 16
    # 金属材质的 DIFFUSE 通道近黑:烘焙时临时关掉金属度,烘完恢复
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    saved_metal = bsdf.inputs["Metallic"].default_value
    bsdf.inputs["Metallic"].default_value = 0.0
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, margin=8)
    bsdf.inputs["Metallic"].default_value = saved_metal
    scene.cycles.samples = old_samples
    img.pack()
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])


def _bombus_fur_zone(part, x):
    """熊蜂毛色分区:前胸黄领、腹前黄带、白尾,其余黑色。返回材质槽号。"""
    if part == "thorax" and x > 0.35:
        return 1  # yellow collar
    if part == "abdomen":
        if x < -2.25:
            return 2  # white tail
        if x > -1.35:
            return 1  # yellow band
    return 0  # black


# 分区毛色:槽 0 恒为预设 col_fuzz,其余为物种专属色
FUR_PALETTES = {
    "bombus": [None, (0.85, 0.6, 0.09), (0.95, 0.93, 0.87)],   # 黄领/黄带、白尾
    "osmia": [None, (0.82, 0.68, 0.42)],                       # 腹面集粉毛(浅赭)
    "megachile": [None, (0.86, 0.84, 0.8)],                    # 白毛带 + 腹面集粉毛
}


def _fur_zone(caste, part, base, preset):
    if caste == "bombus":
        return _bombus_fur_zone(part, base.x)
    if caste == "osmia":
        # 壁蜂:腹部下半(腹面)为集粉毛
        return 1 if part == "abdomen" and base.z < Z0 - 0.06 else 0
    if caste == "megachile":
        if part != "abdomen":
            return 0
        if base.z < Z0 - 0.04:
            return 1  # 腹面集粉毛
        ab_x = -1.45 - preset["waist"]
        t = (base.x - ab_x) / preset["ab_len"]
        return 1 if math.sin(t * math.pi * 3.0) > 0.55 else 0  # 背板后缘白毛带
    return 0


def _fuzz_mesh(caste, preset):
    # 绒毛按身体分区拆成三张网格(fuzz_head / fuzz_thorax / fuzz_abdomen):
    # 工作台"单独显示"要能保留目标部位的毛(交互方案 v3.1)。
    # 随机序列与拆分前逐位一致——每根毛的几何完全不变,只是落进不同网格。
    rng = random.Random(20260821)
    buffers = {}  # part -> dict(verts, faces, zones)
    zoned = caste in FUR_PALETTES

    def add_hair(buf, base, d, length, r):
        d = d.normalized()
        a = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0))
        u = d.cross(a).normalized()
        v = d.cross(u)
        verts, faces = buf["verts"], buf["faces"]
        i0 = len(verts)
        for k in range(3):
            t = k * 2.0944
            verts.append(base + u * (r * math.cos(t)) + v * (r * math.sin(t)))
        bend = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1))) * length * 0.25
        verts.append(base + d * length + bend)
        tip = i0 + 3
        faces.extend([(i0, i0 + 1, tip), (i0 + 1, i0 + 2, tip), (i0 + 2, i0, tip)])

    def tuft(part, cx, cy, cz, rx, ry, rz, count, length, filt=None):
        buf = buffers.setdefault(part, dict(verts=[], faces=[], zones=[]))
        made, tries = 0, 0
        while made < count and tries < count * 30:
            tries += 1
            v = Vector((rng.uniform(-1, 1), rng.uniform(-1, 1), rng.uniform(-1, 1)))
            if v.length_squared < 0.01:
                continue
            v.normalize()
            if filt and not filt(v):
                continue
            base = Vector((cx + v.x * rx, cy + v.y * ry, cz + v.z * rz))
            add_hair(buf, base, v, length * rng.uniform(0.6, 1.4), rng.uniform(0.006, 0.011))
            buf["zones"].append(_fur_zone(caste, part, base, preset) if zoned else 0)
            made += 1

    thorax = bpy.data.objects["thorax"]
    tsx, tsy, tsz = thorax.scale
    fz = preset["fuzz"]
    ab_x = -1.45 - preset["waist"]
    tuft("thorax", 0.18, 0, Z0 + 0.12, tsx + 0.01, tsy + 0.01, tsz + 0.01, *fz["thorax"])
    tuft("head", 1.02, 0, Z0 + 0.22, 0.39, 0.47, 0.45, *fz["head"],
         lambda v: v.z > -0.3 and v.x < 0.6)
    # 熊蜂绒毛覆盖整个腹部(含尾部),蜜蜂属只盖腹部前段
    tuft("abdomen", ab_x, 0, Z0 - 0.02, preset["ab_len"], preset["ab_fat"] * 0.98,
         preset["ab_fat"] * 0.95, *fz["abdomen"],
         None if zoned else (lambda v: v.x > 0.3))

    def fur_material(name, color):
        m = bpy.data.materials.new(name)
        m.use_nodes = True
        b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        b.inputs["Base Color"].default_value = (*color, 1)
        b.inputs["Roughness"].default_value = 0.9
        return m

    # 三张网格共享同一组毛发材质
    if zoned:
        shared = [fur_material("bee:fur-%d" % slot,
                               color if color is not None else preset["col_fuzz"])
                  for slot, color in enumerate(FUR_PALETTES[caste])]
    else:
        shared = [fur_material("bee:fuzzmesh", preset["col_fuzz"])]

    for part in ("thorax", "head", "abdomen"):
        buf = buffers.get(part)
        if not buf or not buf["faces"]:
            continue
        name = "fuzz_%s" % part
        mesh = bpy.data.meshes.new(name)
        mesh.from_pydata([tuple(v) for v in buf["verts"]], [], buf["faces"])
        mesh.update()
        obj = bpy.data.objects.new(name, mesh)
        bpy.data.collections["Bee"].objects.link(obj)
        for m in shared:
            mesh.materials.append(m)
        if zoned:
            zones = buf["zones"]
            for face_index, poly in enumerate(mesh.polygons):
                poly.material_index = zones[face_index // 3]


def _rename_and_root(root_scale=0.3):
    for old, new in RENAME.items():
        obj = bpy.data.objects.get(old)
        if obj:
            obj.name = new
    thorax_center = Vector((0.18, 0, Z0 + 0.12))
    root = bpy.data.objects.new("bee_root", None)
    bpy.data.collections["Bee"].objects.link(root)
    root.location = thorax_center
    for obj in bpy.data.collections["Bee"].objects:
        if obj is root or obj.parent is not None:
            continue
        obj.parent = root
        obj.matrix_parent_inverse = root.matrix_world.inverted()
    root.location = (0, 0, 0)
    root.scale = (root_scale,) * 3  # 1 单位 = 1cm,体型差异真实保留
    return root


def _select_tree(obj):
    obj.select_set(True)
    for child in obj.children:
        _select_tree(child)


def export_hero(caste):
    preset = CASTE_PRESETS[caste]
    build_bee(preset)  # noqa: F821
    _post_build_tweaks(caste)
    _strip_particles()
    setup_cycles(16)  # noqa: F821
    _bake_stripes(caste)
    _fuzz_mesh(caste, preset)
    root = _rename_and_root(ROOT_SCALE.get(caste, 0.3))

    bpy.ops.object.select_all(action='DESELECT')
    _select_tree(root)
    suffix = "" if caste == "worker" else "-" + caste
    bpy.ops.export_scene.gltf(
        filepath=BASE_DIR + "/beemodel/bee-hero%s.glb" % suffix,
        use_selection=True, export_animations=True)
    for fuzz_name in ("fuzz", "fuzz_head", "fuzz_thorax", "fuzz_abdomen"):
        fuzz_obj = bpy.data.objects.get(fuzz_name)
        if fuzz_obj:
            fuzz_obj.select_set(False)
    bpy.ops.export_scene.gltf(
        filepath=BASE_DIR + "/beemodel/bee-hero%s-low.glb" % suffix,
        use_selection=True, export_animations=True)
    print("exported hero:", caste)


print("export_hero loaded; castes:", list(CASTE_PRESETS))
