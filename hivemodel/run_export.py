# 无头导出运行器:
#   blender --background --python hivemodel/run_export.py -- comb
import sys
import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
exec(compile(open(_os.path.join(_HERE, "hive_gen.py"), encoding="utf-8").read(),
             "hive_gen.py", "exec"))
targets = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["comb"]
for target in targets:
    export_hive(target)  # noqa: F821
print("RUN_EXPORT_DONE", targets)
