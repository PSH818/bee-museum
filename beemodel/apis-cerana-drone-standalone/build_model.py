"""Independent Apis cerana drone study. Run with Blender 5.1 --background --python.
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
random.seed(73111)

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

def drone_eye(side, headkeys):
    """One continuous curved eye patch that wraps over the dorsal head capsule."""
    def point(t,v):
        x=-4.62+1.98*t
        ry,rz,zc=smooth_profile(headkeys,x)
        half=1.035*max(0,math.sin(math.pi*t))**.28
        angle=.52+half*(2*v-1)
        bulge=.025+.14*max(0,math.sin(math.pi*t)*math.sin(math.pi*v))**.7
        return Vector((x,side*(ry+bulge)*math.cos(angle),zc+(rz+bulge)*math.sin(angle)))
    vertices=[point(i/96,j/48) for i in range(97) for j in range(49)]
    faces=[]
    for i in range(96):
        for j in range(48):
            q=i*49+j
            f=(q,q+49,q+50,q+1)
            faces.append(tuple(reversed(f)) if side==1 else f)
    obj=mesh(f'Compound_eye_{side}',vertices,faces,MAT['eye'])
    obj['feature']='enlarged dorsal compound eye; narrow median seam'
    rim=[point(i/96,0) for i in range(97)]+[point(i/96,1) for i in range(95,-1,-1)]
    border=curve(f'Eye_rim_{side}',rim,.017,MAT['chitin'])
    border.data.resolution_u=2
    # Sparse interommatidial hairs are geometry, not a particle effect.
    samples=[]
    for _ in range(190):
        t=random.uniform(.07,.93); v=random.uniform(.08,.92)
        p=point(t,v)
        dt=point(t+.001,v)-point(t-.001,v)
        dv=point(t,v+.001)-point(t,v-.001)
        normal=dv.cross(dt).normalized()*side
        samples.append((p,normal,random.uniform(.035,.07),.0018))
    hair_mesh(f'Eye_setae_{side}',samples,MAT['short'])
    return obj

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
        # Broad wings cover most of the compact drone abdomen in projection.
        a,b=widths(t)
        cross=v*(a if v>0 else b)
        dx,dy=(.84,.543) if not hind else (.82,.572)
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
    MODEL=bpy.data.collections.new('01 | APIS CERANA • Drone')
    STUDIO=bpy.data.collections.new('02 | Studio & Cameras (not exported)')
    scene.collection.children.link(MODEL); scene.collection.children.link(STUDIO)
    ROOT=bpy.data.objects.new('Apis_cerana_drone',None); MODEL.objects.link(ROOT)
    ROOT['scientific_name']='Apis cerana'; ROOT['sex']='male'; ROOT['caste']='drone'
    ROOT['life_stage']='adult male; interpretive resting specimen'
    ROOT['corbiculae']=False
    ROOT['body_length_mm']=11.4
    ROOT['units']='millimeters; +X posterior, +Z dorsal'
    ROOT['scope']='Interpretive educational model; not a taxonomic measurement specimen'
    MAT={
        'chitin':material('01 • Charcoal umber chitin',(.023,.015,.009),.39,0,.22,.009),
        'thorax':material('02 • Drone broad mesosoma',(.026,.021,.015),.5,0,.1,.011),
        'amber':material('03 • Smoky umber basal bands',(.046,.031,.016),.47,0,.13,.006),
        'brown':material('04 • Drone near-black tergites',(.021,.016,.011),.44,0,.18,.008),
        'edge':material('05 • Intersegment membranes',(.016,.008,.004),.62),
        'eye':material('06 • Drone compound eyes',(.006,.005,.004),.28,0,.34),
        'hair':material('07 • Fine tawny setae',(.3,.235,.14),.76),
        'short':material('08 • Drone abdominal short setae',(.24,.205,.135),.78),
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

    headkeys=[(-4.85,.17,.27,2.66),(-4.66,.75,.92,3.02),(-4.22,1.38,1.3,3.19),(-3.65,1.56,1.41,3.24),(-3.06,1.35,1.28,3.25),(-2.63,.72,.79,3.22),(-2.38,.39,.44,3.19)]
    loft('Head | sculpted capsule',headkeys,MAT['chitin'])
    thoraxkeys=[(-2.62,.4,.46,3.18),(-2.26,1.26,1.22,3.22),(-1.67,1.76,1.61,3.32),(-.78,1.88,1.64,3.35),(.04,1.53,1.39,3.23),(.61,.87,.83,3.05),(1.13,.39,.42,2.99)]
    loft('Thorax | continuous mesosoma',thoraxkeys,MAT['thorax'])
    ellipsoid('Scutellum',(.06,0,4.39),(.64,1.02,.32),MAT['chitin'])
    ellipsoid('Neck membrane',(-2.48,0,3.18),(.31,.62,.62),MAT['edge'])
    for s in (-1,1):
        drone_eye(s,headkeys)
        ellipsoid(f'Tegula_{s}',(-.65,s*1.43,4.39),(.4,.24,.16),MAT['chitin'])
    # The greatly enlarged compound eyes push the ocelli toward the frontal area.
    for i,p in enumerate([(-4.78,0,3.46),(-4.65,-.22,3.78),(-4.65,.22,3.78)]):
        ellipsoid(f'Ocellus_{i+1}',p,(.105,.13,.13),MAT['eye'],segments=24,rings=16)
    ellipsoid('Clypeus',(-4.68,0,2.55),(.23,.59,.39),MAT['chitin'])

    # Broad male abdomen, with a rounded terminal cap rather than a queen's taper.
    abdomen=[(.75,.38,.42,2.99),(1.13,1.1,1.05,2.99),(1.9,1.77,1.47,3.04),(2.94,1.96,1.61,3.04),(3.96,1.93,1.6,3.0),(4.94,1.72,1.48,2.96),(5.73,1.4,1.22,2.9),(6.21,.99,.91,2.85),(6.47,.51,.51,2.83),(6.55,.025,.035,2.83)]
    breaks=[.76,1.59,2.44,3.31,4.19,5.03,5.81,6.55]
    for k in range(7):
        lo,hi=breaks[k],breaks[k+1]
        obj=loft(f'Abdomen | tergite {k+1}',abdomen,MAT['brown'],steps=34,sides=96,interval=(lo,hi),scallop=.007)
        obj.data.materials.append(MAT['amber']); obj.data.materials.append(MAT['edge'])
        for face in obj.data.polygons:
            x=sum(obj.data.vertices[v].co.x for v in face.vertices)/len(face.vertices)
            t=(x-lo)/(hi-lo)
            # Quiet basal bands, with a dark posterior seam instead of raised rings.
            face.material_index=1 if k<6 and .07<t<.24 else (2 if t>.985 else 0)
    # Separate ventral plates; fine terminal structures remain simplified.
    for k in range(7):
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
    # Male honey bees have no sting. External genitalia are not everted at rest.
    ROOT['sting_state']='absent'
    ROOT['genitalia_state']='not everted; external resting model only'

    for s in (-1,1):
        base=Vector((-4.61,s*.42,3.18)); elbow=Vector((-5.24,s*.68,3.66)); tip=Vector((-6.39,s*1.79,3.79))
        curve(f'Antenna_{s} | scape',[base,base.lerp(elbow,.5)+Vector((0,0,.05)),elbow],.067,MAT['chitin'],[1,.9,.72])
        ellipsoid(f'Antenna_{s} | pedicel',elbow,(.083,.083,.083),MAT['chitin'],segments=20,rings=12)
        # Scape + pedicel + eleven flagellomeres = thirteen segments per antenna.
        for j in range(11):
            a=elbow.lerp(tip,j/11); z=elbow.lerp(tip,(j+1)/11)
            a.z+=.17*math.sin(math.pi*j/11); z.z+=.17*math.sin(math.pi*(j+1)/11)
            curve(f'Antenna_{s} | flagellomere_{j+1:02}',[a,a.lerp(z,.5),z],.067*(1-j*.021),MAT['chitin'],[.83,1,.83])
        curve(f'Mandible_{s}',[(-4.78,s*.34,2.45),(-4.98,s*.25,2.3),(-4.98,s*.09,2.34)],.1,MAT['chitin'],[1,.8,.12])
        curve(f'Labial_palp_{s}',[(-4.62,s*.14,2.37),(-4.75,s*.14,2.2),(-4.91,s*.12,2.2)],.028,MAT['chitin'],[1,.8,.25])
    curve('Proboscis | short folded mouthparts',[(-4.62,0,2.37),(-4.73,0,2.23),(-4.93,0,2.21)],.038,MAT['brown'],[1,.75,.25])

    # Six legs attach to the thorax, with individual joints and five tarsomeres.
    for s in (-1,1):
        configs=[('fore',(-2,s*1.0,2.44),(-2.86,s*1.9,2.02),(-3.65,s*2.29,.68),(-4.17,s*2.87,.03)),
                 ('mid',(-1.07,s*1.3,2.29),(-.56,s*2.57,1.87),(-.75,s*3.13,.57),(-.1,s*3.69,.03)),
                 ('hind',(.09,s*1.06,2.3),(1.39,s*2.34,1.95),(2.56,s*2.76,.67),(3.59,s*3.3,.03))]
        for kind,a,b,c,d in configs:
            a,b,c,d=map(Vector,(a,b,c,d))
            hip=a.lerp(b,.22)
            ellipsoid(f'{kind}_{s} | coxa',a,(.23,.2,.25),MAT['chitin'],segments=24,rings=16)
            curve(f'{kind}_{s} | trochanter',[a,hip],.135,MAT['chitin'],[1,.7])
            curve(f'{kind}_{s} | femur',[hip,hip.lerp(b,.5)+Vector((0,0,.15)),b],.16 if kind=='hind' else .125,MAT['chitin'],[.85,1.1,.68])
            # Drones have no corbicula or worker pollen brush.
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
        wing(f'Forewing_{s}',s,(-.7,s*1.42,4.5),7.9,2.75)
        wing(f'Hindwing_{s}',s,(.1,s*1.25,4.06),5.7,1.85,True)

    # Sample hairs directly on lofts to avoid floating bristles on ellipsoid proxies.
    for name,keys,count,length in [('Thoracic dense coat',thoraxkeys,6500,.19),('Facial short setae',headkeys,1100,.1)]:
        samples=[]
        for _ in range(count*2):
            x=random.uniform(keys[0][0]+.03,keys[-1][0]-.03)
            a=random.uniform(0,math.tau)
            ry,rz,zc=smooth_profile(keys,x)
            n=Vector((random.uniform(-.2,.2),math.cos(a),math.sin(a))).normalized()
            if name.startswith('Facial') and math.sin(a)>-.35 and x> -4.6: continue
            p=(x,ry*math.cos(a),zc+rz*math.sin(a))
            samples.append((p,n,length*random.uniform(.6,1.6),random.uniform(.0025,.0045)))
            if len(samples)>=count: break
        hair_mesh(name,samples,MAT['hair'])
    samples=[]
    for k in range(1,7):
        edge=breaks[k]
        for _ in range(230):
            x=random.uniform(edge-.14,edge-.014); a=random.uniform(0,math.tau)
            ry,rz,zc=smooth_profile(abdomen,x)
            n=Vector((.28,math.cos(a),math.sin(a))).normalized()
            samples.append(((x,ry*math.cos(a)*1.01,zc+rz*math.sin(a)*1.01),n,random.uniform(.065,.13),random.uniform(.002,.0035)))
    for _ in range(1500):
        x=random.uniform(.99,6.45); a=random.uniform(0,math.tau)
        ry,rz,zc=smooth_profile(abdomen,x)
        p=(x,ry*math.cos(a)*1.008,zc+rz*math.sin(a)*1.008)
        samples.append((p,Vector((.3,math.cos(a),math.sin(a))),random.uniform(.045,.095),.0025))
    hair_mesh('Drone abdomen | short coat and marginal setae',samples,MAT['short'])
    for name,p in {'head':(-3.7,0,3.24),'thorax':(-1,0,3.35),'abdomen':(3.7,0,3),'proboscis':(-4.8,0,2.2),'hind_tibia_L':(2,-2.6,1.3),'hind_tibia_R':(2,2.6,1.3),'wing_L':(3,-3.8,4.6),'wing_R':(3,3.8,4.6)}.items():
        o=bpy.data.objects.new('anchor_'+name,None); MODEL.objects.link(o); o.parent=ROOT; o.location=p; o.empty_display_size=.12
    make_studio()
    scene['Model notes']='Original Blender model; representative adult Apis cerana drone. Enlarged dorsal eyes, forward ocelli, 13 antennal segments per side, broad thorax and blunt abdomen. No sting or corbiculae. Wing venation and terminal anatomy simplified; not a taxonomic specimen.'
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
    scene.camera=camera('Camera_Hero',(-10,-23,15),(.1,0,2.6),19.5)
    camera('Camera_Dorsal',(.1,0,28),(.1,0,2.6),18.6)
    # Retreat along the orthographic viewing axis so lower rays start above ground.
    camera('Camera_Lateral',(.1,-120,14),(.1,0,2.6),17.5)
    scene.render.engine='CYCLES'
    scene.cycles.samples=32 if args.preview else 64
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
    bpy.ops.export_scene.gltf(filepath=str(OUT/'apis-cerana-drone.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
    for o in copies:
        o.data.calc_loop_triangles()
    triangles=sum(len(o.data.loop_triangles) for o in copies)
    points=[o.matrix_world@Vector(v) for o in copies for v in o.bound_box]
    dimensions=[max(p[i] for p in points)-min(p[i] for p in points) for i in range(3)]
    stats={'scientific_name':'Apis cerana','caste':'drone','sex':'male','life_stage':'adult male (interpretive)','body_length_mm':11.4,'corbiculae':False,'sting':False,'antenna_segments_per_side':13,'mesh_objects':len(copies),'triangles':triangles,'glb_units':'meters','blend_units':'millimeters','glb_dimensions_meters_xyz':dimensions,'external_assets':False,'rigged':False,'notes':'Static educational model. GLB includes modeled hairs and constant PBR materials; procedural micro-bump and thin-film look are retained in the Blender master.'}
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
        bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'apis-cerana-drone.blend'))
    scene=bpy.context.scene
    views=['Hero'] if args.preview else ['Hero','Dorsal','Lateral']
    for view in views:
        scene.camera=bpy.data.objects['Camera_'+view]
        if not args.preview: scene.cycles.samples=64
        scene.render.filepath=str(OUT/('preview-'+view.lower()+'.png'))
        print('RENDERING_DRONE_VIEW',view,flush=True)
        bpy.ops.render.render(write_still=True)
    scene.camera=bpy.data.objects['Camera_Hero']
    print('CERANA_DRONE_BUILD_COMPLETE',flush=True)
