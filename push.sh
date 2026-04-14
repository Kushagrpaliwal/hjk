#!/bin/sh
git add .
git commit -m "new code" || exit 0
git push origin term