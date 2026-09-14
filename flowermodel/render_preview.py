# 预览渲染:构建 hero 模型,Cycles CPU 渲三个机位到 flowermodel/preview/
#   blender --background --python flowermodel/render_preview.py -- brassica
import sys
import math
import bpy
from mathutils import Vector

import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
exec(compile(open(_os.path.join(_HERE, "flower_gen.py"), encoding="utf-8").read(),
             "flower_gen.py", "exec"))

flower = (sys.argv[sys.argv.index("--") + 1:] or ["brassica"])[0]
root = BUILDERS[flower]("hero")  # noqa: F821

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 640
scene.render.resolution_y = 860
scene.render.film_transparent = False
scene.view_settings.view_transform = "Standard"

world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.94, 0.93, 0.90, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
scene.world = world

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
sun.data.energy = 4.2
sun.rotation_euler = (math.radians(50), math.radians(12), math.radians(35))
scene.collection.objects.link(sun)
fill = bpy.data.objects.new("fill", bpy.data.lights.new("fill", "AREA"))
fill.data.energy = 260
fill.data.size = 6
fill.location = (-3.2, -4.0, 3.2)
fill.rotation_euler = (math.radians(62), 0, math.radians(-38))
scene.collection.objects.link(fill)

cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam"))
scene.collection.objects.link(cam)
scene.camera = cam
cam.data.lens = 62

# 每种花一组预览机位(单位 cm)
ALL_VIEWS = {
    "brassica": {
        "full": (Vector((15.3, -18.6, 12.0)), Vector((0, 0, 8.7))),
        "hero": (Vector((3.8, -8.3, 12.5)), Vector((0, -1.5, 10.5))),
        "top": (Vector((1.3, -6.0, 18.6)), Vector((0, -0.7, 11.3))),
    },
    "robinia": {
        "full": (Vector((16, -24, 10)), Vector((0.5, 0.8, 8.0))),
        "hero": (Vector((3.5, -10, 7.5)), Vector((0.8, -0.8, 7.2))),
        "top": (Vector((9, -12, 16)), Vector((0, 0, 11))),
    },
    "vaccinium": {
        "full": (Vector((11, -17, 13.5)), Vector((0, 0.5, 12.2))),
        "hero": (Vector((2.2, -5.8, 10.8)), Vector((0.35, -0.3, 11.7))),
        "top": (Vector((5, -8, 17.5)), Vector((0, 0.8, 12.5))),
    },
    "trifolium": {
        "full": (Vector((8, -12, 6.5)), Vector((1.2, 0.5, 4.6))),
        "hero": (Vector((1.2, -4.6, 8.6)), Vector((0, -0.7, 7.7))),
        "top": (Vector((0.8, -3.5, 11.5)), Vector((0.8, 0.4, 6.6))),
    },
    "lavandula": {
        "full": (Vector((10, -15, 11)), Vector((0, 0.4, 8.5))),
        "hero": (Vector((1.6, -5.2, 15.6)), Vector((0, -0.4, 15.7))),
        "top": (Vector((0.8, -4.0, 19.5)), Vector((0, 0.3, 15.2))),
    },
    "medicago": {
        "full": (Vector((9, -14, 8.5)), Vector((0, 0.2, 6.2))),
        "hero": (Vector((2.2, -5.6, 11.2)), Vector((0.6, -1.3, 11.2))),
        "top": (Vector((1, -4.5, 14.5)), Vector((0.3, 0, 9.8))),
    },
    "helianthus": {
        "full": (Vector((26, -34, 22)), Vector((0, -1, 16))),
        "hero": (Vector((7, -19, 30)), Vector((0, -2.6, 25.8))),
        "top": (Vector((2, -13, 36)), Vector((0, -2.2, 26.5))),
    },
}
views = ALL_VIEWS[flower]
for name, (pos, target) in views.items():
    cam.location = pos
    d = target - pos
    cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = BASE_DIR + "/flowermodel/preview/%s-%s.png" % (flower, name)
    bpy.ops.render.render(write_still=True)
    print("rendered", name)
print("PREVIEW_DONE")
