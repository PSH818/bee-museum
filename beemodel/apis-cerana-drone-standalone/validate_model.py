"""Run in a separate Blender process with the saved .blend as the input file."""
import bpy, math, json, struct
from pathlib import Path
from mathutils import Vector

out=Path(__file__).resolve().parent
model=bpy.data.collections['01 | APIS CERANA • Drone']
objects=list(model.objects)
root=bpy.data.objects['Apis_cerana_drone']
assert root['caste']=='drone' and root['sex']=='male' and not root['corbiculae']
assert root['sting_state']=='absent'
assert not any('corbicula' in o.name.lower() or 'pollen basket' in o.name.lower() for o in objects)
assert sum(o.name.endswith('_membrane') for o in objects)==4
assert sum(o.name.startswith('Ocellus_') for o in objects)==3
assert sum('| coxa' in o.name for o in objects)==6
assert sum('| tergite ' in o.name for o in objects)==7
assert sum('| sternite ' in o.name for o in objects)==7
assert sum('| tibia' in o.name for o in objects)==6
assert sum('flagellomere_' in o.name for o in objects)==22
assert sum('tarsomere_' in o.name for o in objects)==30
assert bpy.context.scene.unit_settings.scale_length > .00099
abdomen=[o for o in objects if '| tergite ' in o.name]
wings=[o for o in objects if o.name.endswith('_membrane')]
tail=max((o.matrix_world@Vector(v)).x for o in abdomen for v in o.bound_box)
wingtip=max((o.matrix_world@Vector(v)).x for o in wings for v in o.bound_box)
assert abs(tail-wingtip)<1.5, (tail,wingtip)
eyes=[o for o in objects if o.name.startswith('Compound_eye_')]
assert len(eyes)==2
dorsal_seam_gap=sum(min(abs(v.co.y) for v in o.data.vertices) for o in eyes)
assert dorsal_seam_gap<.08, dorsal_seam_gap
assert all(max(v.co.z for v in o.data.vertices)>4.6 for o in eyes)
# Near the terminal abdomen, substantial width remains until the rounded cap.
terminal=bpy.data.objects['Abdomen | tergite 7']
assert max(abs(v.co.y) for v in terminal.data.vertices if v.co.x>6.3)>.6
for o in objects:
    if o.type=='MESH':
        assert all(math.isfinite(v) for p in o.data.vertices for v in p.co), o.name
assert not [i for i in bpy.data.images if i.source=='FILE' and i.filepath and not i.packed_file]
data=(out/'apis-cerana-drone.glb').read_bytes()
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
bpy.ops.import_scene.gltf(filepath=str(out/'apis-cerana-drone.glb'))
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(v) for o in meshes for v in o.bound_box]
dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
assert all(.003<d<.025 for d in dimensions), dimensions
assert len(meshes)>=190
assert .012<dimensions[0]<.015, dimensions
report={'passed':True,'checks':['male drone','no sting or worker pollen baskets','large eyes approach dorsal midline','compact abdomen with blunt terminal cap','four wings','six legs and ordinary tibiae','three ocelli','seven abdominal tergites and ventral plates','twenty-two flagellomeres','thirty tarsomeres','finite geometry','no external image dependencies','valid self-contained GLB','transparent membrane retained','no studio exported','GLB successfully re-imported','meter scale verified'], 'dorsal_eye_seam_gap_mm':dorsal_seam_gap,'abdomen_past_wingtip_mm':tail-wingtip,'imported_mesh_count':len(meshes),'imported_dimensions_m':dimensions}
(out/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('CERANA_DRONE_VALIDATION_PASSED',json.dumps(report),flush=True)
