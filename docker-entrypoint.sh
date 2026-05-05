#!/bin/sh
set -e
npx prisma migrate deploy
if [ -n "$RUN_SEED_ON_START" ]; then
  if [ -n "$SEED_USER_VITYA_PASSWORD" ] && [ -n "$SEED_USER_SEGA_PASSWORD" ]; then
    npx prisma db seed
  else
    echo "Skip seed: set SEED_USER_VITYA_PASSWORD and SEED_USER_SEGA_PASSWORD."
  fi
fi
exec npx next start -H 0.0.0.0 -p 3000
