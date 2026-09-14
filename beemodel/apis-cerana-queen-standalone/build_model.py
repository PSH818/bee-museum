"""Independent Apis cerana queen study. Run with Blender 5.1 --background --python.
All surfaces, hairs and materials are original; no external model or texture assets.
Model units are millimeters. +X points toward the abdomen, Z is up.
"""
import bpy, math, random, json, sys, argparse
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--preview', action='store_true')
parser.add_argument('--render-only', action='store_true')
args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
random.seed(73110)

def material(name, color, rough=.4, metal=0.0, coat=.15, noise=0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    n = mat.node_tree.nodes
    p = n.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['Coat Weight'].default_value = coat
    p.inputs['Coat Roughness'].default_value = .25
    if noise:
        tex = n.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 125
        tex.inputs['Detail'].default_value = 2
        bump = n.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .24
        bump.inputs['Distance'].default_value = noise
        mat.node_tree.links.new(tex.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    return mat

def mesh(name, vertices, faces, mat, collection=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    (collection or MODEL).objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    for f in obj.data.polygons:
        f.use_smooth = True
    if collection is None:
        obj.parent = ROOT
    return obj

def ellipsoid(name, center, axes, mat, rotate=None, segments=56, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=center)
    obj=bpy.context.object
    obj.name=name
    obj.scale=axes
    if rotate: obj.rotation_euler=rotate
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for col in list(obj.users_collection): col.objects.unlink(obj)
    MODEL.objects.link(obj)
    obj.parent=ROOT
    obj.data.materials.append(mat)
    for f in obj.data.polygons: f.use_smooth=True
    return obj

def curve(name, points, radius, mat, radii=None):
    data=bpy.data.curves.new(name,'CURVE')
    data.dimensions='3D'
    data.resolution_u=10
    data.bevel_depth=radius
    data.bevel_resolution=2
    data.use_fill_caps=True
    s=data.splines.new('BEZIER')
    s.bezier_points.add(len(points)-1)
    for i,(b,p) in enumerate(zip(s.bezier_points,points)):
        b.co=p; b.handle_left_type='AUTO'; b.handle_right_type='AUTO'
        b.radius=radii[i] if radii else 1
    obj=bpy.data.objects.new(name,data)
    MODEL.objects.link(obj); obj.parent=ROOT
    data.materials.append(mat)
    return obj

def smooth_profile(keys,x):
    for i in range(len(keys)-1):
        if x <= keys[i+1][0]: break
    t=max(0,min(1,(x-keys[i][0])/(keys[i+1][0]-keys[i][0])))
    result=[]
    for axis in (1,2,3):
        a=keys[max(0,i-1)][axis]; b=keys[i][axis]
        c=keys[i+1][axis]; d=keys[min(len(keys)-1,i+2)][axis]
        val=.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)
        result.append(val)
    return result

def loft(name, keys, mat, steps=64, sides=72, interval=None, scallop=0):
    lo,hi=interval or (keys[0][0],keys[-1][0])
    verts=[]; faces=[]
    for i in range(steps+1):
        x=lo+(hi-lo)*i/steps
        ry,rz,zc=smooth_profile(keys,x)
        t=i/steps
        # Slight raised posterior lip between tergites, not torus rings.
        factor=1+scallop*math.sin(math.pi*t)**2
        for j in range(sides):
            a=math.tau*j/sides
            verts.append((x, max(.008,ry)*math.cos(a)*factor, zc+max(.008,rz)*math.sin(a)*factor))
    for i in range(steps):
        for j in range(sides):
            nj=(j+1)%sides
            faces.append((i*sides+j,i*sides+nj,(i+1)*sides+nj,(i+1)*sides+j))
    for row,reverse in ((0,True),(steps,False)):
        center=len(verts); x=lo+(hi-lo)*row/steps
        verts.append((x,0,smooth_profile(keys,x)[2]))
        for j in range(sides):
            tri=(center,row*sides+j,row*sides+(j+1)%sides)
            faces.append(tuple(reversed(tri)) if reverse else tri)
    return mesh(name,verts,faces,mat)

def hair_mesh(name,samples,mat):
    """Tapered curved 3-sided fibers with occasional fine lateral branches."""
    verts=[]; faces=[]
    def strand(start,direction,length,radius,bend):
        direction=direction.normalized()
        tangent=direction.cross(Vector((0,0,1)))
        if tangent.length<.01: tangent=direction.cross(Vector((0,1,0)))
        tangent.normalize(); bitangent=direction.cross(tangent).normalized()
        base=len(verts)
        for k in range(3):
            t=k/2
            pos=start+direction*length*t+bend*t*t
            r=radius*(1-.94*t)
            for j in range(3):
                a=math.tau*j/3
                verts.append(pos+r*(math.cos(a)*tangent+math.sin(a)*bitangent))
        for k in range(2):
            for j in range(3):
                faces.append((base+k*3+j,base+k*3+(j+1)%3,base+(k+1)*3+(j+1)%3,base+(k+1)*3+j))
    for start,normal,length,radius in samples:
        start=Vector(start); normal=Vector(normal).normalized()
        bend=Vector((random.uniform(-.04,.04),random.uniform(-.025,.025),random.uniform(-.02,.01)))
        strand(start,normal,length,radius,bend)
        if random.random()<.18:
            branch=(normal+Vector((random.uniform(-1,1),random.uniform(-1,1),.15))).normalized()
            strand(start+normal*length*.52,branch,length*.27,radius*.4,bend*.2)
    return mesh(name,verts,faces,mat)

def ellipsoid_hairs(name,center,axes,count,length,mat,mask=None):
    samples=[]
    for _ in range(count*4):
        n=Vector((random.uniform(-1,1),random.uniform(-1,1),random.uniform(-1,1)))
        if n.length<.1 or n.length>1: continue
        n.normalize()
        if mask and not mask(n): continue
        p=Vector(center)+Vector((n.x*axes[0],n.y*axes[1],n.z*axes[2]))
        normal=Vector((n.x/axes[0],n.y/axes[1],n.z/axes[2])).normalized()
        samples.append((p,normal,length*random.uniform(.6,1.45),random.uniform(.003,.006)))
        if len(samples)>=count: break
    return hair_mesh(name,samples,mat)

def wing(name,side,base,span,width,hind=False):
    # Each membrane uses a center strip and a smooth root-to-tip outline.
    keys=[(0,.025,.015),(.12,.17,.1),(.3,.36,.24),(.52,.48,.34),(.72,.43,.31),(.87,.28,.22),(.96,.13,.11),(1,.003,.003)]
    def widths(t):
        for i in range(len(keys)-1):
            if t<=keys[i+1][0]: break
        u=(t-keys[i][0])/(keys[i+1][0]-keys[i][0])
        result=[]
        for j in (1,2):
            a=keys[max(0,i-1)][j]; b=keys[i][j]
            c=keys[i+1][j]; d=keys[min(len(keys)-1,i+2)][j]
            result.append(max(.003,.5*(2*b+(-a+c)*u+(2*a-5*b+4*c-d)*u*u+(-a+3*b-3*c+d)*u*u*u))*width)
        return result
    def point(t,v):
        # Modest observation opening, not a fully spread flight pose.
        # Queen abdomen projects well beyond the wing tips.
        a,b=widths(t)
        cross=v*(a if v>0 else b)
        dx,dy=(.92,.392) if not hind else (.88,.475)
        return Vector((base[0]+t*span*dx-cross*dy,
                       side*(abs(base[1])+t*span*dy+cross*dx),
                       base[2]+.2*math.sin(math.pi*t)+.12*t+.018*(1-v*v)))
    verts=[]; faces=[]
    for i in range(65):
        for j in range(7): verts.append(point(i/64,-1+2*j/6))
    for i in range(64):
        for j in range(6):
            q=i*7+j; faces.append((q,q+1,q+8,q+7))
    obj=mesh(name+'_membrane',verts,faces,MAT['wing'])
    obj['anatomy']='hindwing' if hind else 'forewing'
    for label,v,radius in [('leading',1,.009),('trailing',-1,.007)]:
        edge=curve(name+'_'+label+'_edge',[point(i/64,v) for i in range(65)],radius,MAT['vein'])
        edge.data.resolution_u=2
    networks=[[(0,0),(.22,.25),(.45,.55),(.68,.72),(.9,.8),(.96,1)],
              [(0,0),(.22,-.1),(.44,-.15),(.64,-.05),(.82,.25),(.9,.8)],
              [(.08,-.2),(.27,-.52),(.48,-.7),(.7,-.68),(.84,-1)],
              [(.26,-.1),(.3,.38)],[(.44,-.15),(.46,.56)],
              [(.6,-.08),(.64,.69)],[(.29,-.54),(.36,-.12)],
              [(.48,-.7),(.5,-.14)],[(.7,-.68),(.64,-.05)],
              [(.68,.72),(.77,.35),(.82,.25)]]
    if hind: networks=networks[:3]+networks[4:6]
    for k,line in enumerate(networks):
        curve(name+f'_vein_{k:02}',[point(t,v)+Vector((0,0,.007)) for t,v in line],.012 if k<3 else .008,MAT['vein'])
    if hind:
        for k in range(12):
            p=point(.12+k*.018,1)
            curve(name+f'_hamulus_{k:02}',[p,p+Vector((-.025,side*.055,.02)),p+Vector((-.06,side*.05,.018))],.004,MAT['vein'])
    return obj

def build():
    global MODEL,ROOT,MAT,STUDIO
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene
    scene.unit_settings.system='METRIC'; scene.unit_settings.scale_length=.001
    MODEL=bpy.data.collections.new('01 | APIS CERANA • Queen')
    STUDIO=bpy.data.collections.new('02 | Studio & Cameras (not exported)')
    scene.collection.children.link(MODEL); scene.collection.children.link(STUDIO)
    ROOT=bpy.data.objects.new('Apis_cerana_queen',None); MODEL.objects.link(ROOT)
    ROOT['scientific_name']='Apis cerana'; ROOT['sex']='female'; ROOT['caste']='queen'
    ROOT['life_stage']='adult laying queen; interpretive resting specimen'
    ROOT['corbiculae']=False
    ROOT['body_length_mm']=14.4
    ROOT['units']='millimeters; +X posterior, +Z dorsal'
    ROOT['scope']='Interpretive educational model; not a taxonomic measurement specimen'
    MAT={
        'chitin':material('01 • Charcoal umber chitin',(.023,.015,.009),.39,0,.22,.009),
        'thorax':material('02 • Queen mesosoma',(.04,.023,.011),.44,0,.16,.011),
        'amber':material('03 • Subdued chestnut basal bands',(.125,.054,.016),.43,0,.18,.006),
        'brown':material('04 • Queen dark chestnut tergites',(.061,.028,.011),.39,0,.23,.006),
        'edge':material('05 • Intersegment membranes',(.016,.008,.004),.62),
        'eye':material('06 • Compound eyes',(.008,.006,.0045),.2,.02,.6),
        'hair':material('07 • Fine tawny setae',(.3,.235,.14),.76),
        'short':material('08 • Sparse queen abdominal setae',(.23,.17,.09),.78),
        'vein':material('09 • Wing veins',(.13,.085,.043),.42,0,.1),
        'wing':material('10 • Transparent wing membrane',(.62,.66,.6),.26,0,.25),
    }
    p=MAT['wing'].node_tree.nodes.get('Principled BSDF')
    p.inputs['Alpha'].default_value=.16
    p.inputs['Transmission Weight'].default_value=.18
    p.inputs['IOR'].default_value=1.38
    if 'Thin Film Thickness' in p.inputs: p.inputs['Thin Film Thickness'].default_value=380
    if hasattr(MAT['wing'],'surface_render_method'): MAT['wing'].surface_render_method='DITHERED'
    MAT['wing'].diffuse_color=(.62,.66,.6,.16)
    n=MAT['eye'].node_tree.nodes; l=MAT['eye'].node_tree.links
    v=n.new('ShaderNodeTexVoronoi'); v.feature='DISTANCE_TO_EDGE'; v.inputs['Scale'].default_value=95
    b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.24; b.inputs['Distance'].default_value=.008
    l.new(v.outputs['Distance'],b.inputs['Height']); l.new(b.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])

    headkeys=[(-4.15,.16,.24,2.43),(-3.98,.7,.76,2.59),(-3.65,1.08,1.07,2.8),(-3.18,1.16,1.12,2.89),(-2.8,1.08,1.06,2.94),(-2.43,.53,.62,2.97)]
    loft('Head | sculpted capsule',headkeys,MAT['chitin'])
    thoraxkeys=[(-2.62,.32,.4,2.97),(-2.24,1.12,1.08,3.02),(-1.65,1.52,1.4,3.05),(-.83,1.61,1.42,3.06),(-.12,1.3,1.18,2.98),(.42,.67,.65,2.88),(.85,.36,.39,2.84)]
    loft('Thorax | continuous mesosoma',thoraxkeys,MAT['thorax'])
    ellipsoid('Scutellum',(-.02,0,4.01),(.6,.93,.3),MAT['chitin'])
    ellipsoid('Neck membrane',(-2.53,0,2.95),(.28,.53,.56),MAT['edge'])
    for s in (-1,1):
        ellipsoid(f'Compound_eye_{s}',(-3.38,s*.98,2.92),(.54,.28,.83),MAT['eye'],rotate=(s*-.16,-.16,0))
        ellipsoid(f'Tegula_{s}',(-.64,s*1.3,3.94),(.4,.23,.16),MAT['chitin'])
    for i,p in enumerate([(-3.35,0,3.99),(-3.02,-.29,3.97),(-3.02,.29,3.97)]):
        ellipsoid(f'Ocellus_{i+1}',p,(.13,.13,.09),MAT['eye'],segments=24,rings=16)
    ellipsoid('Clypeus',(-3.96,0,2.23),(.23,.59,.37),MAT['chitin'])

    # Queen-specific distended abdomen: long oval, not a scaled worker sphere.
    abdomen=[(.43,.33,.38,2.84),(.94,.97,.94,2.86),(1.72,1.54,1.36,2.92),(2.9,1.8,1.56,2.97),(4.35,1.83,1.6,2.95),(5.9,1.67,1.49,2.87),(7.27,1.33,1.24,2.76),(8.48,.94,.93,2.64),(9.42,.46,.54,2.54),(9.98,.13,.22,2.47),(10.25,.018,.025,2.41)]
    breaks=[.44,1.77,3.47,5.28,7.04,8.6,10.25]
    for k in range(6):
        lo,hi=breaks[k],breaks[k+1]
        obj=loft(f'Abdomen | tergite {k+1}',abdomen,MAT['brown'],steps=34,sides=96,interval=(lo,hi),scallop=.007)
        obj.data.materials.append(MAT['amber']); obj.data.materials.append(MAT['edge'])
        for face in obj.data.polygons:
            x=sum(obj.data.vertices[v].co.x for v in face.vertices)/len(face.vertices)
            t=(x-lo)/(hi-lo)
            # Quiet basal bands, with a dark posterior seam instead of raised rings.
            face.material_index=1 if k<5 and .05<t<.27 else (2 if t>.985 else 0)
    # Six separate ventral sternite patches follow the same distended contour.
    for k in range(6):
        lo,hi=breaks[k]+.025,breaks[k+1]-.025
        verts=[]; faces=[]
        for i in range(23):
            x=lo+(hi-lo)*i/22
            ry,rz,zc=smooth_profile(abdomen,x)
            for j in range(25):
                angle=math.pi+(.28+(math.pi-.56)*j/24)
                verts.append((x,ry*math.cos(angle)*1.009,zc+rz*math.sin(angle)*1.009))
        for i in range(22):
            for j in range(24):
                q=i*25+j; faces.append((q,q+1,q+26,q+25))
        mesh(f'Abdomen | sternite {k+1}',verts,faces,MAT['brown'])
    # Sting is retracted in a resting queen; no artificial external tail spike.
    ROOT['sting_state']='retracted'

    for s in (-1,1):
        base=Vector((-3.7,s*.42,3.15)); elbow=Vector((-4.61,s*.66,3.78)); tip=Vector((-5.28,s*1.45,3.76))
        curve(f'Antenna_{s} | scape',[base,base.lerp(elbow,.5)+Vector((0,0,.05)),elbow],.067,MAT['chitin'],[1,.9,.72])
        ellipsoid(f'Antenna_{s} | pedicel',elbow,(.083,.083,.083),MAT['chitin'],segments=20,rings=12)
        # Nine + terminal flagellomeres; scape + pedicel + ten flagellomeres = twelve.
        for j in range(10):
            a=elbow.lerp(tip,j/10); z=elbow.lerp(tip,(j+1)/10)
            a.z+=.12*math.sin(math.pi*j/10); z.z+=.12*math.sin(math.pi*(j+1)/10)
            curve(f'Antenna_{s} | flagellomere_{j+1:02}',[a,a.lerp(z,.5),z],.054*(1-j*.025),MAT['chitin'],[.83,1,.83])
        curve(f'Mandible_{s}',[(-4.03,s*.35,2.2),(-4.31,s*.28,2.07),(-4.36,s*.08,2.12)],.125,MAT['chitin'],[1,.8,.12])
        curve(f'Labial_palp_{s}',[(-3.86,s*.15,2.12),(-4.02,s*.15,1.96),(-4.18,s*.13,1.92)],.032,MAT['chitin'],[1,.8,.25])
    curve('Proboscis | folded beneath head',[(-3.84,0,2.14),(-3.98,0,1.98),(-4.21,0,1.94)],.042,MAT['brown'],[1,.75,.25])

    # Six legs attach to the thorax, with individual joints and five tarsomeres.
    for s in (-1,1):
        configs=[('fore',(-1.97,s*.89,2.36),(-2.65,s*1.7,1.96),(-3.47,s*2,.64),(-4.02,s*2.57,.03)),
                 ('mid',(-1.13,s*1.11,2.22),(-.52,s*2.32,1.8),(-.67,s*2.96,.57),(.1,s*3.49,.03)),
                 ('hind',(-.12,s*.94,2.3),(1.28,s*2.15,1.98),(2.84,s*2.58,.7),(4.0,s*3.13,.03))]
        for kind,a,b,c,d in configs:
            a,b,c,d=map(Vector,(a,b,c,d))
            hip=a.lerp(b,.22)
            ellipsoid(f'{kind}_{s} | coxa',a,(.23,.2,.25),MAT['chitin'],segments=24,rings=16)
            curve(f'{kind}_{s} | trochanter',[a,hip],.135,MAT['chitin'],[1,.7])
            curve(f'{kind}_{s} | femur',[hip,hip.lerp(b,.5)+Vector((0,0,.15)),b],.16 if kind=='hind' else .125,MAT['chitin'],[.85,1.1,.68])
            # Queens have an ordinary setose hind tibia, not a worker corbicula.
            curve(f'{kind}_{s} | tibia',[b,b.lerp(c,.5)+Vector((-.045,0,0)),c],.12 if kind=='hind' else .1,MAT['chitin'],[.8,1,.58])
            for q,p in enumerate((b,c)):
                ellipsoid(f'{kind}_{s} | joint_{q}',p,(.12,.12,.12),MAT['chitin'],segments=20,rings=12)
            for j in range(5):
                t0=(j/5)**.66; t1=((j+1)/5)**.66
                p=c.lerp(d,t0); q=c.lerp(d,t1)
                curve(f'{kind}_{s} | tarsomere_{j+1}',[p,p.lerp(q,.5)+Vector((0,0,.025)),q],(.074 if kind=='hind' else .065)*(1-j*.11),MAT['chitin'],[.8,1,.62])
            for sign in (-1,1):
                curve(f'{kind}_{s} | claw_{sign}',[d,d+Vector((.07,s*sign*.09,-.04)),d+Vector((.12,s*sign*.12,.025))],.018,MAT['chitin'],[1,.7,.08])
            samples=[]
            for j in range(65):
                t=random.random(); p=b.lerp(c,t)
                n=Vector((random.uniform(-1,1),s,random.uniform(-.5,.5))).normalized()
                samples.append((p+n*(.115 if kind=='hind' else .09),n,random.uniform(.06,.12),.0025))
            hair_mesh(f'{kind}_{s} | leg bristles',samples,MAT['hair'])

    for s in (-1,1):
        wing(f'Forewing_{s}',s,(-.85,s*1.22,4.09),7.7,2.55)
        wing(f'Hindwing_{s}',s,(-.08,s*1.3,3.7),5.5,1.7,True)

    # Sample hairs directly on lofts to avoid floating bristles on ellipsoid proxies.
    for name,keys,count,length in [('Thoracic fine coat',thoraxkeys,5200,.135),('Facial short setae',headkeys,700,.075)]:
        samples=[]
        for _ in range(count*2):
            x=random.uniform(keys[0][0]+.03,keys[-1][0]-.03)
            a=random.uniform(0,math.tau)
            ry,rz,zc=smooth_profile(keys,x)
            n=Vector((random.uniform(-.2,.2),math.cos(a),math.sin(a))).normalized()
            if name.startswith('Facial') and abs(math.cos(a))>.55: continue
            # Expose the queen's satin dorsal thoracic surface under a lighter coat.
            if name.startswith('Thoracic') and math.sin(a)>.65 and random.random()<.64: continue
            p=(x,ry*math.cos(a),zc+rz*math.sin(a))
            samples.append((p,n,length*random.uniform(.6,1.6),random.uniform(.0025,.0045)))
            if len(samples)>=count: break
        hair_mesh(name,samples,MAT['hair'])
    samples=[]
    for k in range(1,6):
        edge=breaks[k]
        for _ in range(95):
            x=random.uniform(edge-.14,edge-.014); a=random.uniform(0,math.tau)
            ry,rz,zc=smooth_profile(abdomen,x)
            n=Vector((.28,math.cos(a),math.sin(a))).normalized()
            samples.append(((x,ry*math.cos(a)*1.01,zc+rz*math.sin(a)*1.01),n,random.uniform(.025,.06),random.uniform(.0018,.003)))
    hair_mesh('Queen abdomen | sparse marginal setae',samples,MAT['short'])
    for name,p in {'head':(-3.3,0,2.9),'thorax':(-1,0,3.05),'abdomen':(5,0,2.9),'proboscis':(-4.1,0,2),'hind_tibia_L':(2,-2.4,1.3),'hind_tibia_R':(2,2.4,1.3),'wing_L':(3,-3,4.2),'wing_R':(3,3,4.2)}.items():
        o=bpy.data.objects.new('anchor_'+name,None); MODEL.objects.link(o); o.parent=ROOT; o.location=p; o.empty_display_size=.12
    make_studio()
    scene['Model notes']='Original Blender model; representative adult Apis cerana queen. Elongated abdomen, no corbiculae, sparse abdominal setae. Wing venation simplified for education; not a taxonomic specimen. Sting retracted.'
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type=='VIEW_3D':
                area.spaces.active.region_3d.view_perspective='CAMERA'
                area.spaces.active.clip_end=1000

def move_studio(obj):
    for col in list(obj.users_collection): col.objects.unlink(obj)
    STUDIO.objects.link(obj)

def camera(name,pos,target,scale):
    data=bpy.data.cameras.new(name); data.type='ORTHO'; data.ortho_scale=scale; data.clip_start=.01; data.clip_end=3000
    obj=bpy.data.objects.new(name,data); STUDIO.objects.link(obj); obj.location=pos
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

def make_studio():
    scene=bpy.context.scene
    floor=material('Studio | warm porcelain',(.25,.275,.26),.82)
    bpy.ops.mesh.primitive_plane_add(size=1000,location=(0,0,-.12))
    obj=bpy.context.object; obj.name='Studio ground'; obj.data.materials.append(floor); move_studio(obj)
    world=bpy.data.worlds.new('Studio ambient'); world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.24,.28,.32,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.35
    scene.world=world
    for name,pos,power,size,color in [('Key',(-5,-8,14),1800,9,(1,.88,.72)),('Fill',(-1,8,8),1300,8,(.78,.87,1)),('Rim',(8,2,11),2100,7,(1,.93,.8))]:
        data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size; data.color=color
        o=bpy.data.objects.new(name,data); STUDIO.objects.link(o); o.location=pos; o.rotation_euler=(Vector((0,0,2.5))-o.location).to_track_quat('-Z','Y').to_euler()
    scene.camera=camera('Camera_Hero',(-8,-22,15),(2.1,0,2.3),20)
    camera('Camera_Dorsal',(2.2,0,28),(2.2,0,2.5),19)
    # Retreat along the orthographic viewing axis so lower rays start above ground.
    camera('Camera_Lateral',(2.2,-112,12.5),(2.2,0,2.5),18.8)
    scene.render.engine='CYCLES'
    scene.cycles.samples=32 if args.preview else 96
    scene.cycles.use_denoising=True
    scene.render.resolution_x=1500; scene.render.resolution_y=1200
    scene.render.resolution_percentage=65 if args.preview else 100
    scene.render.image_settings.file_format='PNG'
    scene.view_settings.view_transform='AgX'
    scene.render.film_transparent=False
    scene.render.image_settings.color_mode='RGBA'
    # CPU rendering is portable. Prefer a discovered CUDA/OptiX device when present.
    try:
        prefs=bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type='OPTIX'; prefs.get_devices()
        gpus=[d for d in prefs.devices if d.type=='OPTIX']
        if gpus:
            for d in prefs.devices: d.use=(d.type=='OPTIX')
            scene.cycles.device='GPU'
    except Exception: pass

def export_glb():
    bpy.ops.object.select_all(action='DESELECT')
    copies=[]
    export_col=bpy.data.collections.new('TEMP_export'); bpy.context.scene.collection.children.link(export_col)
    # Export meshes only; procedural surface noise stays in .blend, base PBR values in GLB.
    deps=bpy.context.evaluated_depsgraph_get()
    for original in list(MODEL.objects):
        if original.type not in {'MESH','CURVE'}: continue
        evaluated=original.evaluated_get(deps)
        data=bpy.data.meshes.new_from_object(evaluated,depsgraph=deps)
        copy=bpy.data.objects.new(original.name,data); export_col.objects.link(copy)
        copy.matrix_world=original.matrix_world
        # Explicitly convert millimeters to meters; glTF always uses meters.
        from mathutils import Matrix
        copy.matrix_world=Matrix.Scale(.001,4) @ copy.matrix_world
        copy.select_set(True); copies.append(copy)
    bpy.ops.export_scene.gltf(filepath=str(OUT/'apis-cerana-queen.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
    for o in copies:
        o.data.calc_loop_triangles()
    triangles=sum(len(o.data.loop_triangles) for o in copies)
    points=[o.matrix_world@Vector(v) for o in copies for v in o.bound_box]
    dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
    stats={'scientific_name':'Apis cerana','caste':'queen','sex':'female','life_stage':'adult laying queen (interpretive)','body_length_mm':14.4,'corbiculae':False,'mesh_objects':len(copies),'triangles':triangles,'glb_units':'meters','blend_units':'millimeters','glb_dimensions_meters_xyz':dimensions,'external_assets':False,'rigged':False,'notes':'Static educational model. GLB includes modeled hairs and constant PBR materials; procedural micro-bump and thin-film look are retained in the Blender master.'}
    (OUT/'model-info.json').write_text(json.dumps(stats,indent=2),encoding='utf-8')
    for o in copies:
        data=o.data; bpy.data.objects.remove(o,do_unlink=True); bpy.data.meshes.remove(data)
    bpy.data.collections.remove(export_col)

if __name__=='__main__':
    if not args.render_only:
        build()
        if not args.preview: export_glb()
        bpy.context.scene.camera=bpy.data.objects['Camera_Hero']
        bpy.context.preferences.filepaths.save_version=0
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'apis-cerana-queen.blend'))
    scene=bpy.context.scene
    views=['Hero'] if args.preview else ['Hero','Dorsal','Lateral']
    for view in views:
        scene.camera=bpy.data.objects['Camera_'+view]
        if not args.preview: scene.cycles.samples=64 if view=='Lateral' else 96
        scene.render.filepath=str(OUT/('preview-'+view.lower()+'.png'))
        bpy.ops.render.render(write_still=True)
    scene.camera=bpy.data.objects['Camera_Hero']
    print('CERANA_QUEEN_BUILD_COMPLETE',flush=True)
