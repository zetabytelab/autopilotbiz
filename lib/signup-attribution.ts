// Brevo signup attribution. The form sends utm_source / utm_campaign /
// utm_content from the page URL plus its pathname; these become the
// SIGNUP_SOURCE / SIGNUP_CAMPAIGN / SIGNUP_PLACEMENT contact attributes.
// Without UTMs: SIGNUP_SOURCE=site, SIGNUP_PLACEMENT=<page path>.

export type SignupAttributionInput = {
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  page?: string;
};

// Untrusted input collapsed to a short [a-z0-9_./-] value; "" when empty.
const clean = (s: string | undefined) =>
  (s ?? "").toLowerCase().trim().replace(/[^a-z0-9_./-]/g, "").slice(0, 80);

export function signupAttributes(input: SignupAttributionInput): Record<string, string> {
  const path = clean((input.page ?? "").replace(/^\/+|\/+$/g, "")) || "home";
  const attrs: Record<string, string> = {
    SIGNUP_SOURCE: clean(input.utm_source) || "site",
    SIGNUP_PLACEMENT: clean(input.utm_content) || path,
  };
  const campaign = clean(input.utm_campaign);
  if (campaign) attrs.SIGNUP_CAMPAIGN = campaign;
  return attrs;
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<Response>;

// POST a Brevo contact body with the SIGNUP_* attributes added. If Brevo
// rejects it with a 400 (e.g. the attributes are not created in the account
// yet), retry once with the original attributes only, so the signup still
// goes through without attribution instead of failing.
export async function postContactWithAttribution(
  fetchImpl: FetchLike,
  url: string,
  headers: Record<string, string>,
  body: { attributes?: Record<string, string> } & Record<string, unknown>,
  extra: Record<string, string>,
): Promise<Response> {
  const withExtra = { ...body, attributes: { ...(body.attributes ?? {}), ...extra } };
  const res = await fetchImpl(url, { method: "POST", headers, body: JSON.stringify(withExtra) });
  if (res.status !== 400 || Object.keys(extra).length === 0) return res;
  console.warn("brevo rejected signup attribution, retrying without it:", await res.text().catch(() => ""));
  return fetchImpl(url, { method: "POST", headers, body: JSON.stringify(body) });
}
