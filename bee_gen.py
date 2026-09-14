# bee_gen.py -- parametric bee builder for Blender
# usage inside Blender:
#   exec(compile(open(r"<项目根>/bee_gen.py", encoding="utf-8").read(), "bee_gen.py", "exec"))
#   build_bee("honeybee")   # or "bumblebee" / "wasp" / a custom dict
import bpy, math
from mathutils import Matrix

Z0 = 1.5
KEEP = {"platform", "floor", "key", "rim", "fill", "beecam", "target"}

PRESETS = {
    "honeybee": dict(
        ab_len=1.35, ab_fat=0.97, waist=0.0,
        stripe_scale=1.15, stripe_distort=1.6, stripe_balance=0.5,
        col_amber=(0.68, 0.32, 0.025), col_band=(0.02, 0.01, 0.004),
        col_chitin=(0.045, 0.022, 0.008), col_fuzz=(0.42, 0.22, 0.045),
        fuzz=dict(thorax=(3200, 0.10), abdomen=(900, 0.055), head=(400, 0.05)),
        eye=1.0, wing_len=1.95, wing_wid=0.8, wing_alpha=0.3,
        leg_r=0.042, pollen=True, stinger=0.34, sss=0.12,
        flap_up=-70, flap_down=22,
    ),
    "bumblebee": dict(
        ab_len=1.12, ab_fat=1.18, waist=-0.12,
        stripe_scale=0.8, stripe_distort=2.4, stripe_balance=0.45,
        col_amber=(0.55, 0.3, 0.03), col_band=(0.012, 0.007, 0.004),
        col_chitin=(0.02, 0.012, 0.006), col_fuzz=(0.5, 0.3, 0.05),
        fuzz=dict(thorax=(4200, 0.2), abdomen=(2800, 0.17), head=(500, 0.08)),
        eye=0.85, wing_len=1.7, wing_wid=0.72, wing_alpha=0.28,
        leg_r=0.052, pollen=True, stinger=0.2, sss=0.1,
        flap_up=-62, flap_down=18,
    ),
    "wasp": dict(
        ab_len=1.55, ab_fat=0.72, waist=0.42,
        stripe_scale=1.9, stripe_distort=0.35, stripe_balance=0.42,
        col_amber=(0.8, 0.55, 0.03), col_band=(0.01, 0.008, 0.006),
        col_chitin=(0.035, 0.025, 0.008), col_fuzz=(0.3, 0.18, 0.04),
        fuzz=dict(thorax=(500, 0.04), abdomen=(0, 0), head=(120, 0.03)),
        eye=1.1, wing_len=2.1, wing_wid=0.62, wing_alpha=0.26,
        leg_r=0.032, pollen=False, stinger=0.5, sss=0.06,
        flap_up=-75, flap_down=25,
    ),
}


def get_bsdf(m):
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            return n
    n = m.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    out = next(x for x in m.node_tree.nodes if x.type == 'OUTPUT_MATERIAL')
    m.node_tree.links.new(n.outputs[0], out.inputs[0])
    return n


def set_in(node, names, value):
    # tolerant input setter across Blender versions (3.x / 4.x renames)
    for nm in names:
        s = node.inputs.get(nm)
        if s is not None:
            try:
                s.default_value = value
                return True
            except Exception:
                pass
    return False


def clear_bee():
    for ob in list(bpy.data.objects):
        if ob.name not in KEEP:
            bpy.data.objects.remove(ob, do_unlink=True)
    for m in list(bpy.data.materials):
        if m.users == 0:
            bpy.data.materials.remove(m)
    try:
        bpy.data.orphans_purge(do_recursive=True)
    except Exception:
        pass


def build_bee(preset="honeybee"):
    p = dict(PRESETS[preset]) if isinstance(preset, str) else dict(preset)
    clear_bee()
    made = []

    # ---------- materials ----------
    def mat_new(name, color, rough=0.5, metal=0.0, sss=0.0):
        m = bpy.data.materials.new("bee:" + name)
        m.use_nodes = True
        b = get_bsdf(m)
        b.inputs["Base Color"].default_value = (*color, 1)
        b.inputs["Roughness"].default_value = rough
        b.inputs["Metallic"].default_value = metal
        if sss > 0:
            set_in(b, ["Subsurface Weight", "Subsurface"], sss)
            set_in(b, ["Subsurface Radius"], (0.36, 0.14, 0.05))
            set_in(b, ["Subsurface Color"], (*color, 1))
        return m

    chitin = mat_new("chitin", p["col_chitin"], p.get("chitin_rough", 0.45), p.get("chitin_metal", 0.0), sss=p["sss"])
    legmat = mat_new("leg", (0.03, 0.015, 0.006), 0.55)
    eyemat = mat_new("eye", (0.015, 0.008, 0.004), 0.15, 0.1)
    pollen = mat_new("pollen", (0.7, 0.28, 0.04), 0.7, sss=0.3)

    # striped abdomen: wave texture -> constant ramp, plus subsurface
    abmat = bpy.data.materials.new("bee:abdomen")
    abmat.use_nodes = True
    nt = abmat.node_tree
    bsdf = get_bsdf(abmat)
    bsdf.inputs["Roughness"].default_value = p.get("ab_rough", 0.35)
    bsdf.inputs["Metallic"].default_value = p.get("ab_metal", 0.0)
    set_in(bsdf, ["Subsurface Weight", "Subsurface"], p["sss"])
    set_in(bsdf, ["Subsurface Radius"], (0.36, 0.14, 0.05))
    set_in(bsdf, ["Subsurface Color"], (*p["col_amber"], 1))
    coord = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.bands_direction = 'X'
    wave.inputs["Scale"].default_value = p["stripe_scale"]
    wave.inputs["Distortion"].default_value = p["stripe_distort"]
    wave.inputs["Detail"].default_value = 2.0
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = 'CONSTANT'
    ramp.color_ramp.elements[0].color = (*p["col_amber"], 1)
    e1 = ramp.color_ramp.elements[1]
    e1.position = p["stripe_balance"]
    e1.color = (*p["col_band"], 1)
    nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])

    # fuzz: Principled Hair BSDF (Cycles) for realistic strands
    fuzz = bpy.data.materials.new("bee:fuzz")
    fuzz.use_nodes = True
    fnt = fuzz.node_tree
    for n in list(fnt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            fnt.nodes.remove(n)
    fout = next(x for x in fnt.nodes if x.type == 'OUTPUT_MATERIAL')
    try:
        hair = fnt.nodes.new("ShaderNodeBsdfHairPrincipled")
        set_in(hair, ["Color"], (*p["col_fuzz"], 1))
        set_in(hair, ["Roughness"], 0.35)
        set_in(hair, ["Radial Roughness"], 0.4)
        fnt.links.new(hair.outputs[0], fout.inputs[0])
    except Exception:
        fb = fnt.nodes.new("ShaderNodeBsdfPrincipled")
        fb.inputs["Base Color"].default_value = (*p["col_fuzz"], 1)
        fnt.links.new(fb.outputs[0], fout.inputs[0])

    wingmat = bpy.data.materials.new("bee:wing")
    wingmat.use_nodes = True
    wb = get_bsdf(wingmat)
    wb.inputs["Base Color"].default_value = (*p.get("col_wing", (0.85, 0.88, 0.92)), 1)
    wb.inputs["Roughness"].default_value = 0.12
    wb.inputs["Alpha"].default_value = p["wing_alpha"]
    try:
        wingmat.blend_method = 'BLEND'
        wingmat.show_transparent_back = False
    except Exception:
        pass

    # ---------- geometry helpers ----------
    def sphere(name, loc, scale, mat, rot=(0, 0, 0), seg=48):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=seg // 2,
                                             radius=1, location=loc, rotation=rot)
        o = bpy.context.active_object
        o.name = name
        o.scale = scale
        o.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        made.append(o)
        return o

    def tube(name, pts, radius, mat):
        cu = bpy.data.curves.new(name, 'CURVE')
        cu.dimensions = '3D'
        sp = cu.splines.new('NURBS')
        sp.points.add(len(pts) - 1)
        for q, (x, y, z) in zip(sp.points, pts):
            q.co = (x, y, z, 1)
        sp.use_endpoint_u = True
        cu.bevel_depth = radius
        cu.bevel_resolution = 4
        cu.use_fill_caps = True
        ob = bpy.data.objects.new(name, cu)
        bpy.context.collection.objects.link(ob)
        ob.data.materials.append(mat)
        made.append(ob)
        return ob

    # ---------- body ----------
    ab_x = -1.45 - p["waist"]
    abdomen = sphere("abdomen", (ab_x, 0, Z0 - 0.02),
                     (p["ab_len"], p["ab_fat"], p["ab_fat"] * 0.97), abmat)
    thorax = sphere("thorax", (0.18, 0, Z0 + 0.12), (0.84, 0.78, 0.78), chitin)
    head = sphere("head", (1.02, 0, Z0 + 0.22), (0.38, 0.47, 0.44), chitin)

    if p["waist"] > 0.05:  # wasp petiole
        bpy.ops.mesh.primitive_cylinder_add(radius=0.09, depth=p["waist"] + 0.5,
            location=((ab_x + p["ab_len"] * 0.6 + 0.18) / 2 - 0.15, 0, Z0 + 0.02),
            rotation=(0, math.pi / 2, 0))
        pet = bpy.context.active_object
        pet.name = "petiole"
        pet.data.materials.append(chitin)
        bpy.ops.object.shade_smooth()
        made.append(pet)

    for s in (1, -1):
        sphere("eye" + ("L" if s > 0 else "R"), (1.16, s * 0.31, Z0 + 0.26),
               (0.19 * p["eye"], 0.19 * p["eye"], 0.33 * p["eye"]),
               eyemat, rot=(s * 0.25, 0, 0), seg=32)
    for i, (x, y, z) in enumerate([(1.16, 0, 0.62), (1.09, 0.09, 0.6), (1.09, -0.09, 0.6)]):
        sphere("ocellus%d" % i, (x, y, Z0 + z), (0.042,) * 3, eyemat, seg=16)

    if p["stinger"] > 0:  # 雄蜂无螫针
        bpy.ops.mesh.primitive_cone_add(radius1=0.085, radius2=0, depth=p["stinger"],
            location=(ab_x - p["ab_len"] * 0.98 - p["stinger"] * 0.3, 0, Z0 - 0.06),
            rotation=(0, -math.pi / 2, 0))
        st = bpy.context.active_object
        st.name = "stinger"
        st.data.materials.append(chitin)
        bpy.ops.object.shade_smooth()
        made.append(st)

    # ---------- legs & antennae ----------
    hipX = [0.58, 0.2, -0.24]
    bend = [[0.12, 0.3, 0.42], [0.0, -0.06, 0.02], [-0.28, -0.62, -0.92]]
    for s in (1, -1):
        tag = "L" if s > 0 else "R"
        for i in range(3):
            hx, hz = hipX[i], Z0 - 0.3
            dx = bend[i]
            pts = [(hx, s * 0.32, hz),
                   (hx + dx[0] * 0.5, s * 0.74, hz + 0.28),
                   (hx + dx[1], s * 0.92, hz - 0.5),
                   (hx + dx[2], s * 1.0, hz - 1.18)]
            tube("leg_%d_%s" % (i, tag), pts, p["leg_r"], legmat)
            sphere("tarsus_%d_%s" % (i, tag), pts[3], (p["leg_r"] * 1.2,) * 3, legmat, seg=12)
            if i == 2 and p["pollen"]:
                sphere("pollen_" + tag,
                       (pts[2][0] - 0.02, pts[2][1] + s * 0.07, pts[2][2] + 0.06),
                       (0.15, 0.11, 0.19), pollen, seg=20)
        bx, by, bz = 1.22, s * 0.12, Z0 + 0.44
        tube("antenna_" + tag,
             [(bx, by, bz), (bx + 0.16, by + s * 0.06, bz + 0.3),
              (bx + 0.2, by + s * 0.09, bz + 0.44),
              (bx + 0.48, by + s * 0.16, bz + 0.34),
              (bx + 0.68, by + s * 0.2, bz + 0.08)], 0.022, chitin)

    # ---------- wings + flap keyframes ----------
    def wing(name, length, width, shoulder, rot):
        bpy.ops.mesh.primitive_circle_add(vertices=32, radius=1, fill_type='NGON', location=(0, 0, 0))
        o = bpy.context.active_object
        o.name = name
        o.data.transform(Matrix.Translation((1.0, 0, 0)))  # pivot at wing root
        o.scale = (length / 2, width / 2, 1)
        o.location = shoulder
        o.rotation_euler = rot
        o.data.materials.append(wingmat)
        made.append(o)
        return o

    def keyframe_flap(ob, up_deg, down_deg, phase=0):
        ob.animation_data_clear()
        base = ob.rotation_euler.copy()
        for f, ang in ((1 + phase, up_deg), (4 + phase, down_deg), (7 + phase, up_deg)):
            ob.rotation_euler = (base.x, math.radians(ang), base.z)
            ob.keyframe_insert("rotation_euler", frame=f)
        ob.rotation_euler = base
        act = ob.animation_data.action
        try:
            fcurves = list(act.fcurves)  # Blender <= 4.x
        except AttributeError:
            fcurves = [fc for layer in act.layers for strip in layer.strips
                       for bag in strip.channelbags for fc in bag.fcurves]
        for fc in fcurves:
            if fc.data_path == "rotation_euler":
                fc.modifiers.new('CYCLES')  # loop forever

    for s, tag in ((1, "L"), (-1, "R")):
        fw = wing("forewing_" + tag, p["wing_len"], p["wing_wid"],
                  (0.34, s * 0.16, Z0 + 0.82),
                  (s * math.radians(8), math.radians(-12), s * math.radians(132)))
        keyframe_flap(fw, p["flap_up"], p["flap_down"], 0)
        hw = wing("hindwing_" + tag, p["wing_len"] * 0.62, p["wing_wid"] * 0.62,
                  (0.2, s * 0.2, Z0 + 0.76),
                  (s * math.radians(6), math.radians(-6), s * math.radians(148)))
        keyframe_flap(hw, p["flap_up"] * 0.8, p["flap_down"] * 0.7, 1)

    # ---------- fuzz ----------
    def add_hair(obj, count, length):
        if count <= 0:
            return
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.particle_system_add()
        ps = obj.particle_systems[-1].settings
        ps.type = 'HAIR'
        ps.count = count
        ps.hair_length = length
        ps.hair_step = 3
        obj.data.materials.append(fuzz)
        ps.material = len(obj.data.materials)
        try:
            ps.root_radius = 0.35
            ps.tip_radius = 0.0
        except Exception:
            pass

    add_hair(thorax, *p["fuzz"]["thorax"])
    add_hair(abdomen, *p["fuzz"]["abdomen"])
    add_hair(head, *p["fuzz"]["head"])

    # ---------- collection bookkeeping ----------
    coll = bpy.data.collections.get("Bee")
    if not coll:
        coll = bpy.data.collections.new("Bee")
        bpy.context.scene.collection.children.link(coll)
    for ob in made:
        for uc in list(ob.users_collection):
            uc.objects.unlink(ob)
        coll.objects.link(ob)

    sc = bpy.context.scene
    sc.frame_start, sc.frame_end = 1, 72
    sc.render.fps = 24
    sc.frame_set(1)
    name = preset if isinstance(preset, str) else "custom"
    print("built:", name, "objects:", len(made))
    return name


def setup_cycles(samples=32):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.samples = samples
    try:
        cy.use_denoising = True
    except Exception:
        pass
    try:
        sc.view_layers[0].cycles.use_denoising = True
    except Exception:
        pass
    device = 'CPU'
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for dt in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'):
            try:
                prefs.compute_device_type = dt
                try:
                    prefs.get_devices()
                except Exception:
                    pass
                gpus = [d for d in prefs.devices if d.type != 'CPU']
                if gpus:
                    for d in prefs.devices:
                        d.use = True
                    cy.device = 'GPU'
                    device = dt
                    break
            except Exception:
                continue
    except Exception:
        pass
    if device == 'CPU':
        cy.device = 'CPU'
    print("cycles device:", device)
    return device


bpy.app.driver_namespace["build_bee"] = build_bee
bpy.app.driver_namespace["setup_cycles"] = setup_cycles
print("bee_gen loaded: build_bee(preset), setup_cycles(samples); presets:", list(PRESETS))
