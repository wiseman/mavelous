#!/bin/sh
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --dep $CLOSURE_LIBRARY_DIR \
  --path checklist.js \
  --output_mode deps > checklist-deps.js
