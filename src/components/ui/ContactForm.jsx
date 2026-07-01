import { useId, useState } from "react";

const initialForm = { name: "", email: "", message: "", botcheck: "" };

export function ContactForm({ className = "" }) {
  const headingId = useId();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== "idle") setStatus("idle");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) throw new Error(result.error || "Message failed");

      setForm(initialForm);
      setStatus("success");
    } catch {
      setStatus("error");
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
            {status === "error" ? "Something went wrong. Please email me directly." : null}
          </p>
        </div>
      </form>
    </section>
  );
}
