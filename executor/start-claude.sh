#!/bin/bash
cat /tmp/prompt.txt | claude --model claude-3-7-sonnet-20250219 -p --verbose --output-format stream-json --allowedTools "Bash" "Write" "Edit" 
