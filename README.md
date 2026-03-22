# Pull Request Security Reviewer

Provides automated security review suggestions on pull requests, focusing on common vulnerabilities and best practices using AI.

## Free
```yaml
- uses: walshd1/pull-request-security-reviewer@v1
  with:
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
```

## Paid (cost + 4.75%)
```yaml
- uses: walshd1/pull-request-security-reviewer@v1
  with:
    service_token: ${{ secrets.ACTION_FACTORY_TOKEN }}
```
