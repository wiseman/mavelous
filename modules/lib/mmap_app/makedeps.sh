#!/bin/sh
CLOSURE_LIBRARY_DIR=$(dirname "$0")/third_party/closure-library
python $CLOSURE_LIBRARY_DIR/closure/bin/calcdeps.py \
  --dep $CLOSURE_LIBRARY_DIR \
  --path script/mission.js \
  --path script/missionui.js \
  --output_mode deps > script/mission-deps.js
