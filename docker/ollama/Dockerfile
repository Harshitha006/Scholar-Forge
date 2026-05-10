FROM ollama/ollama:latest

# Start Ollama in the background, wait for it to boot, and pull the required model
RUN nohup bash -c "ollama serve &" && sleep 5 && ollama pull llama3.1:8b
