#!/bin/sh
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --dep $CLOSURE_LIBRARY_DIR \
  --path mission.js \
  --output_mode deps > mission-deps.js
