ollama list
ollama pull modelNAME (See on the Ollama website)

problemas de CORS no Jan:

1 - close ollama full (quit)

2 - define env var:
launchctl setenv OLLAMA_ORIGINS "*"

3 - restart ollama

4 - set configs perm:
echo 'export OLLAMA_ORIGINS="*"' >> ~/.zshrc
source ~/.zshrc

