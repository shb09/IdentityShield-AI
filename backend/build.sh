#!/bin/bash
# Render build script - install system dependencies then Python deps
apt-get update -qq && apt-get install -y -qq tesseract-ocr > /dev/null 2>&1
pip install -r requirements.txt
