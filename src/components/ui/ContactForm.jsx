import { useId, useState } from "react";

const initialForm = { name: "", email: "", message: "", botcheck: "" };

export function ContactForm({ className = "" }) {
  const headingId = useId();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== "idle") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.botcheck) {
      setForm(initialForm);
      setStatus("success");
      setErrorMessage("");
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setStatus("error");
      setErrorMessage("Contact form is not configured. Please email me directly.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("access_key", accessKey);
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("message", form.message);
      formData.append("subject", "New message from Maan Grover portfolio");
      formData.append("from_name", "Maan Grover Portfolio");
      formData.append("replyto", form.email);
      formData.append("botcheck", form.botcheck);

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || result.error || "Something went wrong. Please email me directly.");
      }

      setForm(initialForm);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error && error.message
        ? error.message
        : "Something went wrong. Please email me directly.");
    }
  };

  return (
    <section className={`contact-message-form ${className}`.trim()} aria-labelledby={headingId}>
      <div className="contact-message-heading">
        <h3 id={headingId}>Message me</h3>
        <p>Have a role, project, opportunity, or idea? Send a quick note.</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="contact-form-fields">
          <label>
            <span>Name</span>
            <input name="name" type="text" value={form.name} onChange={updateField} autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
          </label>
        </div>
        <label>
          <span>Message</span>
          <textarea name="message" rows="4" value={form.message} onChange={updateField} required />
        </label>
        <div className="contact-form-honeypot" aria-hidden="true">
          <label>Leave this field empty<input name="botcheck" type="text" value={form.botcheck} onChange={updateField} tabIndex="-1" autoComplete="off" /></label>
        </div>
        <div className="contact-form-footer">
          <button type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending..." : "Send Message"}</button>
          <p className={`contact-form-status ${status}`} role="status" aria-live="polite">
            {status === "success" ? "Message sent — I’ll get back to you soon." : null}
            {status === "error" ? errorMessage : null}
          </p>
        </div>
      </form>
    </section>
  );
}
