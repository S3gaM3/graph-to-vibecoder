#!/bin/sh
set -e
npx prisma migrate deploy
if [ -n "$RUN_SEED_ON_START" ]; then
  npx prisma db seed || true
fi
exec npx next start -H 0.0.0.0 -p 3000
