"""Run in a separate Blender process with the saved .blend as the input file."""
import bpy, math, json, struct
from pathlib import Path
from mathutils import Vector

out=Path(__file__).resolve().parent
model=bpy.data.collections['01 | APIS CERANA • Worker']
objects=list(model.objects)
assert sum(o.name.endswith('_membrane') for o in objects)==4
assert sum(o.name.startswith('Ocellus_') for o in objects)==3
assert sum('| coxa' in o.name for o in objects)==6
assert sum('| tergite ' in o.name for o in objects)==6
assert sum('flagellomere_' in o.name for o in objects)==20
assert sum('tarsomere_' in o.name for o in objects)==30
assert bpy.context.scene.unit_settings.scale_length > .00099
for o in objects:
    if o.type=='MESH':
        assert all(math.isfinite(v) for p in o.data.vertices for v in p.co), o.name
assert not [i for i in bpy.data.images if i.source=='FILE' and i.filepath and not i.packed_file]
data=(out/'apis-cerana-worker.glb').read_bytes()
magic,version,length=struct.unpack_from('<III',data)
assert magic==0x46546C67 and version==2 and length==len(data)
n,kind=struct.unpack_from('<II',data,12)
gltf=json.loads(data[20:20+n])
assert not gltf.get('cameras') and not gltf.get('animations')
assert not any('uri' in b for b in gltf.get('buffers',[]))
assert not any('Studio' in node.get('name','') for node in gltf.get('nodes',[]))
assert any(m.get('alphaMode')=='BLEND' for m in gltf['materials'])
# Re-import into a clean process scene to check export transforms and completeness.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(out/'apis-cerana-worker.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box]
dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
assert all(.003<d<.025 for d in dimensions), dimensions
assert len(meshes)>=190
report={'passed':True,'checks':['four wings','six legs','three ocelli','six abdominal tergites','twenty flagellomeres','thirty tarsomeres','finite geometry','no external image dependencies','valid self-contained GLB','transparent membrane retained','no studio exported','GLB successfully re-imported','meter scale verified'], 'imported_mesh_count':len(meshes),'imported_dimensions_m':dimensions}
(out/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('CERANA_VALIDATION_PASSED',json.dumps(report),flush=True)
