#!/bin/bash
cat /tmp/prompt.txt | claude -p --verbose --output-format stream-json --allowedTools "Bash" "Write" "Edit" 
