export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { name, email, message, botcheck } = request.body || {};

  if (botcheck) return response.status(200).json({ success: true });

  if (
    typeof name !== "string" || !name.trim()
    || typeof email !== "string" || !email.trim()
    || typeof message !== "string" || !message.trim()
  ) {
    return response.status(400).json({ success: false, error: "Name, email, and message are required" });
  }

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    return response.status(500).json({ success: false, error: "Contact service is not configured" });
  }

  try {
    const web3Response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        subject: "New message from Maan Grover portfolio",
        from_name: "Maan Grover Portfolio",
      }),
    });
    const result = await web3Response.json().catch(() => ({}));

    if (!web3Response.ok || !result.success) {
      return response.status(502).json({ success: false, error: result.message || "Unable to send message" });
    }

    return response.status(200).json({ success: true });
  } catch {
    return response.status(502).json({ success: false, error: "Unable to reach contact service" });
  }
}
