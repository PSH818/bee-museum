# 无头导出运行器:
#   blender --background --python beemodel/run_export.py -- osmia megachile xylocopa
import sys
import os as _os
_HERE = _os.path.dirname(_os.path.abspath(__file__))
exec(compile(open(_os.path.join(_HERE, "export_hero.py"), encoding="utf-8").read(),
             "export_hero.py", "exec"))
targets = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
for target in targets:
    export_hero(target)  # noqa: F821
print("RUN_EXPORT_DONE", targets)
