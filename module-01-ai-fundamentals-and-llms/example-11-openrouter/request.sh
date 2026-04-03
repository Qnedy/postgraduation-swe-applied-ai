source .env

API_URL="https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_SITE_URL="http://localhost/3000"
OPENROUTER_SITE_NAME="My OpenRouter Site"

NLP_MODEL="google/gemma-3-27b-it:free"

DATA=$(cat <<EOF
{
  "model": "$NLP_MODEL",
  "messages": [
    {
      "role": "user",
      "content": "Me conte uma curiosidade sobre LLMs"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 1000
}
EOF
)

curl --silent -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPEN_ROUTER_KEY" \
  -H "HTTP-Referer: $OPENROUTER_SITE_URL" \
  -H "X-Title: $OPENROUTER_SITE_NAME" \
  -d "$DATA" | jq
