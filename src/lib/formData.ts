export function formDataToStrings(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      out[key] = value;
    }
    // If it's a File, ignore it for this MVP (no file uploads).
  }

  return out;
}
