# 预览渲染:构建 hero 巢脾,Cycles CPU 渲三个机位到 hivemodel/preview/
#   blender --background --python hivemodel/render_preview.py
import math
import bpy
from mathutils import Vector

import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
exec(compile(open(_os.path.join(_HERE, "hive_gen.py"), encoding="utf-8").read(),
             "hive_gen.py", "exec"))

root = BUILDERS["comb"]("hero")  # noqa: F821

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 860
scene.render.resolution_y = 640
scene.render.film_transparent = False
scene.view_settings.view_transform = "Standard"

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.94, 0.93, 0.90, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.5
scene.world = world

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 3.6
sun.rotation_euler = (math.radians(55), math.radians(-14), math.radians(-30))
scene.collection.objects.link(sun)
fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
fill.data.energy = 300
fill.data.size = 8
fill.location = (4.5, -7.5, 2.5)
fill.rotation_euler = (math.radians(70), 0, math.radians(28))
scene.collection.objects.link(fill)

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.lens = 62

VIEWS = {
    "full": (Vector((0.0, -14.5, 0.6)), Vector((0, 0, 0))),
    "honey": (Vector((-1.2, -4.6, -1.6)), Vector((0.2, 0, 0.2))),
    "capped": (Vector((5.6, -4.8, -1.2)), Vector((3.4, 0, 0.4))),
}

for name, (pos, target) in VIEWS.items():
    cam.location = pos
    direction = target - pos
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = BASE_DIR + "/hivemodel/preview/comb-%s.png" % name
    bpy.ops.render.render(write_still=True)
    print("rendered", name)
print("PREVIEW_DONE")
