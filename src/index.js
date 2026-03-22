const core = require('@actions/core');
const fs = require('fs');
const PROMPT = `You are a Pull Request Security Reviewer AI. Your task is to analyze the provided code diff in the pull request and identify potential security vulnerabilities and suggest improvements. Focus on common vulnerabilities like SQL injection, Cross-Site Scripting (XSS), Cross-Site Request Forgery (CSRF), authentication/authorization issues, insecure direct object references (IDOR), and data exposure. Also, check for adherence to security best practices such as input validation, output encoding, proper error handling, and secure configuration.

**Input:**

*   **Pull Request Title:** {pull_request_title}
*   **Pull Request Description:** {pull_request_description}
*   **Code Diff:** {code_diff}
*   **Programming Language:** {programming_language}
*   **Framework/Libraries Used:** {framework_libraries}

**Instructions:**

1.  Carefully examine the 'Code Diff' for potential security vulnerabilities based on the 'Programming Language' and 'Framework/Libraries Used'.
2.  Prioritize critical vulnerabilities that could lead to significant security breaches.
3.  Provide specific and actionable suggestions for remediation. Include the line numbers where the vulnerability exists.
4.  Explain the potential impact of the vulnerability if it is not addressed.
5.  Suggest secure coding practices to prevent similar vulnerabilities in the future.
6.  If no vulnerabilities are found, explicitly state that "No security vulnerabilities were identified in this pull request."
7.  Format your output as a list of findings, each including:
    *   **Vulnerability:** (e.g., SQL Injection, XSS)
    *   **File and Line Number:** (e.g., 'src/user.py:25')
    *   **Description:** (Detailed explanation of the vulnerability)
    *   **Impact:** (Potential consequences of the vulnerability)
    *   **Recommendation:** (Specific steps to fix the vulnerability)

**Example Output Format (if vulnerabilities are found):**

Security Review Findings:

*   **Vulnerability:** SQL Injection
    *   **File and Li`;
async function run() {
  try {
    const key = core.getInput('gemini_api_key');
    const token = core.getInput('service_token');
    const ctx = { repoName: process.env.GITHUB_REPOSITORY || '', event: process.env.GITHUB_EVENT_NAME || '' };
    try { Object.assign(ctx, JSON.parse(fs.readFileSync('package.json', 'utf8'))); } catch {}
    let prompt = PROMPT;
    for (const [k, v] of Object.entries(ctx)) prompt = prompt.replace(new RegExp('{' + k + '}', 'g'), String(v || ''));
    let result;
    if (key) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + key, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2000 } })
      });
      result = (await r.json()).candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (token) {
      const r = await fetch('https://action-factory.walshd1.workers.dev/generate/pull-request-security-reviewer', {
        method: 'POST', headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify(ctx)
      });
      result = (await r.json()).content || '';
    } else throw new Error('Need gemini_api_key or service_token');
    console.log(result);
    core.setOutput('result', result);
  } catch (e) { core.setFailed(e.message); }
}
run();
