import { useEffect, useMemo, useState } from "react";
import { getSectionById } from "../../data/sections";
import { getDestinationAnchorLabel } from "../../data/destinationAnchors";
import { getPortfolioContent } from "../../data/portfolioContent";
import { ContactForm } from "./ContactForm";

const CLOSE_ANIMATION_MS = 180;

function AssetPreview({ src, alt, title }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="asset-fallback" aria-label={alt || title}>
        <span>Preview asset</span>
        <strong>{title}</strong>
        <small>Drop image at {src || "configured project path"}</small>
      </div>
    );
  }

  return <img src={src} alt={alt || title} onError={() => setFailed(true)} />;
}

function SoftImage({ src, alt, className, fallbackLabel }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={className ? `${className} image-fallback-soft` : "image-fallback-soft"} aria-label={alt}>
        <span>{fallbackLabel || alt || "Image"}</span>
      </div>
    );
  }

  return <img className={className} src={src} alt={alt} onError={() => setFailed(true)} />;
}

function ContactMediaSlide({ slide }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [slide?.src]);

  if (!slide || failed) {
    return (
      <div className="contact-media-fallback" aria-label={slide?.label || "Contact media"}>
      </div>
    );
  }

  if (slide.type === "video") {
    return (
      <video
        className="contact-media-video"
        src={slide.src}
        controls
        muted
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
      >
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      className="contact-media-image"
      src={slide.src}
      alt={slide.alt || slide.label}
      onError={() => setFailed(true)}
    />
  );
}

function ActionLink({ action }) {
  if (!action) return null;

  if (!action.href) {
    return (
      <span className="content-action disabled" aria-disabled="true">
        {action.label}
      </span>
    );
  }

  return (
    <a className="content-action" href={action.href} target="_blank" rel="noreferrer">
      {action.label}
    </a>
  );
}

function ProjectShowcase({ content, active }) {
  const projects = content.projects || [];
  const [index, setIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const project = projects[index] || projects[0];
  const mediaItems = useMemo(
    () => [project?.coverImage, ...(project?.media || [])].filter(Boolean),
    [project]
  );
  const activeMedia = mediaItems[mediaIndex] || project?.coverImage;

  const goNext = () => setIndex((current) => {
    setMediaIndex(0);
    return (current + 1) % projects.length;
  });
  const goPrevious = () => setIndex((current) => {
    setMediaIndex(0);
    return (current - 1 + projects.length) % projects.length;
  });
  const goNextMedia = () => setMediaIndex((current) => (current + 1) % mediaItems.length);
  const goPreviousMedia = () => setMediaIndex((current) => (current - 1 + mediaItems.length) % mediaItems.length);

  useEffect(() => {
    if (!active || !projects.length) return undefined;

    const onKeyDown = (event) => {
      if (event.code !== "ArrowLeft" && event.code !== "ArrowRight") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
      if (event.code === "ArrowLeft") goPrevious();
      if (event.code === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
  }, [active, projects.length]);

  if (!project) return null;

  return (
    <section className="project-showcase" aria-label="Project showcase">
      <div className="project-media">
        <AssetPreview src={activeMedia} title={project.title} alt={`${project.title} preview`} />
        <span className="project-status-pill">{project.status}</span>
        {mediaItems.length > 1 ? (
          <div className="project-media-nav" aria-label="Project image controls">
            <button type="button" onClick={goPreviousMedia} aria-label="Previous image">←</button>
            <button type="button" onClick={goNextMedia} aria-label="Next image">→</button>
          </div>
        ) : null}
        {activeMedia ? (
          <a className="media-open-link" href={activeMedia} target="_blank" rel="noreferrer">
            View full image
          </a>
        ) : null}
        {mediaItems.length > 1 ? (
          <div className="project-media-strip" aria-label="Project media">
            {mediaItems.map((item, itemIndex) => (
              <button
                key={item}
                type="button"
                className={itemIndex === mediaIndex ? "active" : ""}
                onClick={() => setMediaIndex(itemIndex)}
              >
                {itemIndex + 1}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="project-detail">
        <div>
          <p className="project-count">{index + 1} / {projects.length}</p>
          <h3>{project.title}</h3>
          <p className="project-subtitle">{project.subtitle}</p>
          <p>{project.description}</p>
        </div>

        <div className="project-role">
          <span>Role</span>
          <strong>{project.role}</strong>
        </div>

        <div className="tech-stack">
          {project.tags.map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>

        {project.actions?.length ? (
          <div className="content-actions">
            {project.actions.map((action) => (
              <ActionLink action={action} key={action.label} />
            ))}
          </div>
        ) : null}

        <div className="project-carousel-controls">
          <button type="button" onClick={goPrevious} aria-label="Previous project">←</button>
          <div className="project-dots" aria-hidden="true">
            {projects.map((item, dotIndex) => (
              <button
                key={item.id}
                type="button"
                className={dotIndex === index ? "active" : ""}
                onClick={() => {
                  setIndex(dotIndex);
                  setMediaIndex(0);
                }}
                aria-label={`Show project ${dotIndex + 1}`}
              />
            ))}
          </div>
          <button type="button" onClick={goNext} aria-label="Next project">→</button>
        </div>
      </div>
    </section>
  );
}

function SkillGrid({ content }) {
  return (
    <div className="skill-grid">
      {content.categories.map((category) => (
        <section className="skill-card" key={category.title}>
          <div>
            <h3>{category.title}</h3>
            <span>{category.level}</span>
          </div>
          <div className="panel-list">
            {category.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ExperienceTimeline({ content }) {
  return (
    <div className="timeline premium-timeline">
      {content.timeline.map((entry) => (
        <article className="timeline-entry" key={`${entry.role}-${entry.date}`}>
          <div>
            <h3>{entry.role}</h3>
            <span>{entry.organization}</span>
          </div>
          <small>{entry.date} · {entry.location}</small>
          {entry.tags?.length ? (
            <div className="timeline-tags">
              {entry.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}
          <ul>
            {entry.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          {entry.link ? <ActionLink action={{ label: "Related link", href: entry.link }} /> : null}
        </article>
      ))}
    </div>
  );
}

function ResumePanel({ content }) {
  return (
    <div className="resume-layout">
      <div className="resume-hero-actions">
        <a className="content-action" href={content.pdfPath} download>Download Resume</a>
        <a className="content-action" href={content.pdfPath} target="_blank" rel="noreferrer">View Resume PDF</a>
      </div>

      <section className="resume-summary">
        <h3>Summary</h3>
        <p>{content.summary}</p>
      </section>

      <section className="panel-section">
        <h3>Education</h3>
        {content.education.map((entry) => (
          <article className="panel-item" key={`${entry.school}-${entry.program}`}>
            <div>
              <strong>{entry.school}</strong>
              <span>{entry.program}</span>
            </div>
            <small>{entry.date}</small>
            <p>{entry.detail}</p>
          </article>
        ))}
      </section>

      <section className="panel-section">
        <h3>Strengths</h3>
        <div className="panel-list">
          {content.strengths.map((strength) => <span key={strength}>{strength}</span>)}
        </div>
      </section>

      <section className="panel-section">
        <h3>Highlights</h3>
        <ul className="clean-list">
          {content.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
        </ul>
      </section>
    </div>
  );
}

function ContactPanel({ content }) {
  const mediaSlides = [
    { type: "image", src: "/profile/contact/contact-1.jpg", alt: "Contact photo 1", label: "Photo 1" },
    { type: "image", src: "/profile/contact/contact-2.jpg", alt: "Contact photo 2", label: "Photo 2" },
    { type: "image", src: "/profile/contact/contact-3.jpg", alt: "Contact photo 3", label: "Photo 3" },
    { type: "image", src: "/profile/contact/contact-4.jpg", alt: "Contact photo 4", label: "Photo 4" },
    { type: "video", src: "/profile/contact/contact-video.mp4", label: "Contact Video" },
  ];
  const [mediaIndex, setMediaIndex] = useState(0);
  const activeSlide = mediaSlides[mediaIndex] || mediaSlides[0];

  useEffect(() => {
    if (mediaIndex >= mediaSlides.length) setMediaIndex(0);
  }, [mediaIndex, mediaSlides.length]);

  const goPreviousMedia = () => setMediaIndex((current) => (
    mediaSlides.length ? (current - 1 + mediaSlides.length) % mediaSlides.length : 0
  ));
  const goNextMedia = () => setMediaIndex((current) => (
    mediaSlides.length ? (current + 1) % mediaSlides.length : 0
  ));

  if (content.groups?.length) {
    return (
      <div className="contact-layout">
        {mediaSlides.length ? (
          <section className="contact-media-section" aria-label="Snapshots">
            <h3>Snapshots</h3>
            <div className="contact-media-carousel">
              <div className="contact-media-frame">
                <ContactMediaSlide slide={activeSlide} key={activeSlide?.src || mediaIndex} />
                {mediaSlides.length > 1 ? (
                  <div className="contact-media-nav" aria-label="Contact media controls">
                    <button type="button" onClick={goPreviousMedia} aria-label="Previous contact media">←</button>
                    <button type="button" onClick={goNextMedia} aria-label="Next contact media">→</button>
                  </div>
                ) : null}
              </div>

              {mediaSlides.length > 1 ? (
                <div className="contact-media-dots" aria-label="Contact media slides">
                  {mediaSlides.map((slide, dotIndex) => (
                    <button
                      key={slide.src}
                      type="button"
                      className={dotIndex === mediaIndex ? "active" : ""}
                      onClick={() => setMediaIndex(dotIndex)}
                      aria-label={`Show ${slide.label}`}
                    >
                      {dotIndex + 1}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="contact-group-stack">
          {content.groups.map((group) => (
            <section className="contact-group" key={group.title}>
              <h3>{group.title}</h3>
              <div className="contact-grid">
                {group.cards.map((card) => (
                  <article className="contact-card" key={card.label}>
                    <span>{card.label}</span>
                    <strong>{card.value}</strong>
                    {card.href ? <ActionLink action={{ label: card.action, href: card.href }} /> : <p>{card.action}</p>}
                  </article>
                ))}
              </div>
            </section>
          ))}
          <ContactForm />
        </div>
      </div>
    );
  }

  return (
    <div className="contact-grid">
      {content.cards.map((card) => (
        <article className="contact-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          {card.href ? <ActionLink action={{ label: card.action, href: card.href }} /> : <p>{card.action}</p>}
        </article>
      ))}
    </div>
  );
}

function AboutPanel({ content }) {
  return (
    <div className="about-layout">
      <div className="about-profile-row">
        <div className="about-intro">
          {content.personalIntro.split("\n").filter(Boolean).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className="about-profile-card">
          <SoftImage
            src={content.profileImage}
            alt="Maan Grover profile"
            fallbackLabel="Maan"
            className="about-profile-image"
          />
          <div>
            <span>Profile</span>
            <strong>Maan Grover</strong>
            <p>Product-minded builder across AI/data, web, operations, and communication.</p>
          </div>
        </aside>
      </div>
      <div className="about-card-grid">
        {content.cards.map((card) => (
          <article className="about-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function SectionContent({ content, active }) {
  if (!content) return null;
  if (content.id === "projects") return <ProjectShowcase content={content} active={active} />;
  if (content.id === "skills") return <SkillGrid content={content} />;
  if (content.id === "experience") return <ExperienceTimeline content={content} />;
  if (content.id === "resume") return <ResumePanel content={content} />;
  if (content.id === "socials") return <ContactPanel content={content} />;
  if (content.id === "interests") return <AboutPanel content={content} />;
  return null;
}

export function PortfolioPanel({ activeSection, onClose }) {
  const [renderedSectionId, setRenderedSectionId] = useState(activeSection);
  const [isClosing, setIsClosing] = useState(false);
  const section = getSectionById(renderedSectionId);
  const content = useMemo(() => getPortfolioContent(renderedSectionId), [renderedSectionId]);

  useEffect(() => {
    if (activeSection) {
      setRenderedSectionId(activeSection);
      setIsClosing(false);
      return undefined;
    }

    if (!renderedSectionId) return undefined;

    setIsClosing(true);
    const closeTimer = window.setTimeout(() => {
      setRenderedSectionId(null);
      setIsClosing(false);
    }, CLOSE_ANIMATION_MS);

    return () => window.clearTimeout(closeTimer);
  }, [activeSection, renderedSectionId]);

  if (!section || !content) return null;
  const sectionLabel = content.title || getDestinationAnchorLabel(section);

  return (
    <div className="panel-backdrop" role="presentation">
      <aside
        className={[
          "portfolio-panel",
          `section-${content.id}`,
          isClosing ? "closing" : "",
        ].filter(Boolean).join(" ")}
        aria-modal="true"
        role="dialog"
        aria-label={sectionLabel}
      >
        <div className="portfolio-window-bar polished">
          <p className="window-title">{sectionLabel}</p>
          <div className="window-actions">
            <span className="esc-hint">Esc to close</span>
            <button className="panel-close" type="button" onClick={onClose} aria-label="Close panel">
              ×
            </button>
          </div>
        </div>

        <div className="portfolio-window-body">
          <div className="panel-content">
            <p className="panel-kicker">{content.eyebrow}</p>
            <h2>{sectionLabel}</h2>
            {content.intro ? <p className="panel-body">{content.intro}</p> : null}
            <SectionContent content={content} active={Boolean(activeSection) && !isClosing} />
          </div>
        </div>
      </aside>
    </div>
  );
}
