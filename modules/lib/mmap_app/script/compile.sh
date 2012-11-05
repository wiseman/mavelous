#!/bin/sh
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --path $CLOSURE_LIBRARY_DIR \
  --input mission.js \
  --compiler_jar ~/bin/closure-compiler.jar \
  --output_mode compiled > mission-compiled.js

