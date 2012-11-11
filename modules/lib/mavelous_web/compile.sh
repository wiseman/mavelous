#!/bin/sh
CLOSURE_LIBRARY_DIR=$(dirname "$0")/third_party/closure-library
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --path $CLOSURE_LIBRARY_DIR \
  --input script/mission.js \
  --input script/missionui.js \
  --compiler_jar ~/bin/closure-compiler.jar \
  --output_mode compiled > script/mission-compiled.js

