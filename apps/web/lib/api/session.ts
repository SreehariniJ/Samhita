let csrfToken: string | null = null;

export function setApiCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getApiCsrfToken() {
  return csrfToken;
}
