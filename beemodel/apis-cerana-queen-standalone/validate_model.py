"""Run in a separate Blender process with the saved .blend as the input file."""
import bpy, math, json, struct
from pathlib import Path
from mathutils import Vector

out=Path(__file__).resolve().parent
model=bpy.data.collections['01 | APIS CERANA • Queen']
objects=list(model.objects)
root=bpy.data.objects['Apis_cerana_queen']
assert root['caste']=='queen' and not root['corbiculae']
assert not any('corbicula' in o.name.lower() or 'pollen basket' in o.name.lower() for o in objects)
assert sum(o.name.endswith('_membrane') for o in objects)==4
assert sum(o.name.startswith('Ocellus_') for o in objects)==3
assert sum('| coxa' in o.name for o in objects)==6
assert sum('| tergite ' in o.name for o in objects)==6
assert sum('| sternite ' in o.name for o in objects)==6
assert sum('| tibia' in o.name for o in objects)==6
assert sum('flagellomere_' in o.name for o in objects)==20
assert sum('tarsomere_' in o.name for o in objects)==30
assert bpy.context.scene.unit_settings.scale_length > .00099
abdomen=[o for o in objects if '| tergite ' in o.name]
wings=[o for o in objects if o.name.endswith('_membrane')]
tail=max((o.matrix_world@Vector(v)).x for o in abdomen for v in o.bound_box)
wingtip=max((o.matrix_world@Vector(v)).x for o in wings for v in o.bound_box)
assert tail-wingtip>3, (tail,wingtip)
for o in objects:
    if o.type=='MESH':
        assert all(math.isfinite(v) for p in o.data.vertices for v in p.co), o.name
assert not [i for i in bpy.data.images if i.source=='FILE' and i.filepath and not i.packed_file]
data=(out/'apis-cerana-queen.glb').read_bytes()
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
bpy.ops.import_scene.gltf(filepath=str(out/'apis-cerana-queen.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box]
dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
assert all(.003<d<.025 for d in dimensions), dimensions
assert len(meshes)>=190
assert .015<dimensions[0]<.017, dimensions
report={'passed':True,'checks':['queen caste','no worker pollen baskets','abdomen extends beyond wing tips','four wings','six legs and ordinary tibiae','three ocelli','six abdominal tergites and sternites','twenty flagellomeres','thirty tarsomeres','finite geometry','no external image dependencies','valid self-contained GLB','transparent membrane retained','no studio exported','GLB successfully re-imported','meter scale verified'], 'abdomen_past_wingtip_mm':tail-wingtip,'imported_mesh_count':len(meshes),'imported_dimensions_m':dimensions}
(out/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('CERANA_QUEEN_VALIDATION_PASSED',json.dumps(report),flush=True)
