#!/usr/bin/env bash
set -o errexit

python -m pip install --upgrade pip
python -m pip install uv
uv sync --refresh --index-url https://pypi.org/simple --frozen
uv run python manage.py collectstatic --no-input
uv run python manage.py migrate
