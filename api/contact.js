export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false, error: "Method not allowed" });
  }

  let body;

  try {
    body = typeof request.body === "string"
      ? JSON.parse(request.body)
      : request.body;
  } catch {
    return response.status(400).json({ success: false, error: "Invalid JSON body" });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return response.status(400).json({ success: false, error: "Invalid JSON body" });
  }

  const { name, email, message, botcheck } = body;

  if (botcheck) return response.status(200).json({ success: true });

  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (
    typeof name !== "string" || !name.trim()
    || !trimmedEmail
    || typeof message !== "string" || !message.trim()
  ) {
    return response.status(400).json({ success: false, error: "Name, email, and message are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return response.status(400).json({ success: false, error: "A valid email is required" });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return response.status(500).json({ success: false, error: "Missing contact form configuration" });
  }

  try {
    const formData = new FormData();
    formData.append("access_key", accessKey);
    formData.append("name", name.trim());
    formData.append("email", trimmedEmail);
    formData.append("message", message.trim());
    formData.append("subject", "New message from Maan Grover portfolio");
    formData.append("from_name", "Maan Grover Portfolio");
    formData.append("replyto", trimmedEmail);

    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData,
    });

    const result = await web3Response.json().catch(() => null);
    const web3Error = result?.message || result?.error;

    console.info("Web3Forms response status:", web3Response.status);
    console.info("Web3Forms response message:", web3Error || "No message returned");

    if (!web3Response.ok || result?.success !== true) {
      return response.status(502).json({
        success: false,
        error: web3Error || `Web3Forms request failed with status ${web3Response.status}`,
      });
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Web3Forms request error:", message);
    return response.status(502).json({ success: false, error: "Unable to reach contact service" });
  }
}
