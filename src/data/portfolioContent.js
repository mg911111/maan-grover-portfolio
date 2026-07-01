export const portfolioContent = {
  projects: {
    id: "projects",
    title: "Projects",
    eyebrow: "Selected work",
    intro:
      "Practical AI, data, web, hardware, and science-communication projects built around clear workflows, useful outputs, and recruiter-readable execution.",
    projects: [
      {
        id: "rupiqoai",
        title: "RupiqoAI",
        status: "Live",
        subtitle: "AI-assisted currency exchange timing tool",
        description:
          "A practical AI/data tool that helps users understand exchange-rate movement before converting money. It combines reference rates, short-horizon trend signals, scenario comparison, and plain-English AI explanations.",
        role: "Product engineering, frontend systems, AI/data workflow design.",
        coverImage: "/projects/rupiqoai/cover.png",
        media: [
          "/projects/rupiqoai/dashboard.png",
          "/projects/rupiqoai/results.png",
          "/projects/rupiqoai/chart.png",
          "/projects/rupiqoai/logo.png",
        ],
        tags: ["React", "Supabase", "AI workflows", "Data analysis", "Product UX"],
        actions: [
          { label: "Live Demo", href: "https://rupiqoai.vercel.app/" },
          { label: "GitHub", href: "https://github.com/mg911111/rupiqoai" },
        ],
      },
      {
        id: "cartai",
        title: "Universal Cart AI",
        status: "In progress",
        subtitle: "AI-assisted shopping cart builder",
        description:
          "A shopping assistant that turns any idea, vibe, or plan into a personalized cart. Users describe what they need, and the product breaks it into categories, suggests items, and builds one universal shopping plan.",
        role: "Product concept, frontend build, AI workflow design, interaction design.",
        coverImage: "/projects/cartai/cover.png",
        media: [
          "/projects/cartai/results.png",
          "/projects/cartai/how-it-works.png",
          "/projects/cartai/possibilities.png",
        ],
        tags: ["React", "AI workflows", "Product UX", "Shopping assistant", "Local build"],
        actions: [{ label: "Local build", disabled: true }, { label: "In progress", disabled: true }],
      },
      {
        id: "fashion-eco-score",
        title: "Fashion Material Eco Score Dashboard",
        status: "Prototype",
        subtitle: "Prototype sustainability scoring dashboard",
        description:
          "A simple prototype dashboard that detects material composition, compares material variants, visualizes eco-score data, and gives sustainability recommendations.",
        role: "Data analysis, dashboard design, prototype development.",
        coverImage: "/projects/fashion-eco-score/cover.png",
        media: [
          "/projects/fashion-eco-score/results.png",
          "/projects/fashion-eco-score/recommendations.png",
        ],
        tags: ["Python", "Streamlit", "Data analysis", "Sustainability", "Visualization"],
        actions: [
          { label: "Live Demo", href: "https://blank-app-dcp7y4ob62g.streamlit.app/" },
          { label: "GitHub", href: "https://github.com/mg911111/blank-app" },
        ],
      },
      {
        id: "phys310",
        title: "ML Phase Transition Analysis",
        status: "Technical report",
        subtitle: "2D Ising Model phase transition and order parameter identification",
        description:
          "An individual machine learning project using supervised learning methods to identify phase transition behavior and order parameters in the 2D Ising Model.",
        role: "Modeling, analysis, report writing, Python implementation.",
        coverImage: "/projects/phys310/cover.png",
        media: [],
        tags: ["Python", "Machine Learning", "Physics", "Data analysis", "Scientific computing"],
        actions: [
          { label: "Project Report", href: "/projects/phys310/report.pdf" },
          { label: "Code PDF", href: "/projects/phys310/code.pdf" },
        ],
      },
      {
        id: "eosc442",
        title: "Scientific Data Analysis Project",
        status: "Course project",
        subtitle: "Environmental time-series analysis",
        description:
          "A course-based scientific analysis project using Python to investigate environmental time-series data through seasonal averaging, correlation analysis, detrending, variance analysis, residual interpretation, and visual communication.",
        role: "Data analysis, visualization, scientific reporting, presentation.",
        coverImage: "/projects/eosc442/cover.png",
        media: [],
        tags: ["Python", "Data analysis", "Scientific reporting", "Visualization"],
        actions: [{ label: "Presentation PDF", href: "/projects/eosc442/presentation.pdf" }],
      },
      {
        id: "astr333",
        title: "Designed Icy Ocean World",
        status: "Presentation",
        subtitle: "Could life exist on a designed icy ocean world?",
        description:
          "A final presentation exploring astrobiology, habitability, and the conditions under which life could exist on an engineered icy ocean world.",
        role: "Research synthesis, scientific communication, presentation design.",
        coverImage: "/projects/astr333/cover.png",
        media: [],
        tags: ["Astrobiology", "Research", "Presentation", "Science communication"],
        actions: [{ label: "Presentation PDF", href: "/projects/astr333/slides.pdf" }],
      },
      {
        id: "scie300",
        title: "Autofluorescence in Live-Cell Imaging",
        status: "Science communication",
        subtitle: "Video podcast on g-Odots and TADF dyes",
        description:
          "A video podcast exploring how researchers are overcoming autofluorescence in live-cell imaging using specialized TADF dyes, Glassy Organic Dots, and the external heavy atom effect to improve image contrast.",
        role: "Science communication, research explanation, video presentation.",
        coverImage: "/projects/scie300/cover.png",
        media: [],
        tags: ["Science communication", "Research", "Medical imaging", "Podcast"],
        actions: [{ label: "Watch Podcast", href: "https://www.youtube.com/watch?v=I7zgwicjqOY" }],
      },
      {
        id: "phys319",
        title: "Gesture-Controlled Car",
        status: "Course project",
        subtitle: "Phone-tilt controlled hardware car",
        description:
          "A hardware/software project where I built a car from scratch and controlled it through phone-tilt gestures. The project involved electronics, motor control, wiring, app control logic, testing, and physical prototyping.",
        role: "Hardware build, embedded control, app interaction, prototyping.",
        coverImage: "/projects/phys319/cover.png",
        media: [
          "/projects/phys319/car-1.jpg",
          "/projects/phys319/car-2.jpg",
          "/projects/phys319/car-3.jpg",
        ],
        tags: ["Embedded systems", "Hardware", "Sensors", "Prototyping", "Motor control"],
        actions: [
          { label: "Demo Video", href: "/projects/phys319/car-demo.mp4" },
          { label: "Slides PDF", href: "/projects/phys319/slides.pdf" },
        ],
      },
    ],
  },
  skills: {
    id: "skills",
    title: "Skills",
    eyebrow: "Builder toolkit",
    intro:
      "A practical toolkit across AI/data, software, product thinking, operations, communication, and creative execution.",
    categories: [
      {
        title: "AI / Data",
        level: "Applied analytical tools",
        skills: [
          "Artificial Intelligence",
          "Data Analysis",
          "Automation",
          "Analytics",
          "SQL",
          "Python",
          "Scientific Data Analysis",
        ],
      },
      {
        title: "Software / Web",
        level: "Frontend and technical foundations",
        skills: [
          "React",
          "JavaScript",
          "Java",
          "Computer Science",
          "Frontend UI",
          "Responsive Interfaces",
          "Git/GitHub",
        ],
      },
      {
        title: "Product / Business",
        level: "User-facing problem solving",
        skills: [
          "Product Thinking",
          "Problem Solving",
          "Business-facing Tools",
          "Dashboard Design",
          "Customer Workflows",
          "Practical AI Tools",
        ],
      },
      {
        title: "Operations / Admin",
        level: "Organized, reliable execution",
        skills: [
          "Operations",
          "Administration Support",
          "Event Operations",
          "Data Entry",
          "Coordination",
          "Documentation",
          "Student Support",
        ],
      },
      {
        title: "Communication / People",
        level: "Customer and community support",
        skills: [
          "Communication",
          "Customer Service",
          "Customer Support",
          "Orientation Leadership",
          "Marketing",
          "Event Support",
        ],
      },
      {
        title: "Creative / Other",
        level: "Communication and taste",
        skills: ["Photography", "Music", "Visual Taste", "Content Creation", "Presentation Design", "Creative Work"],
      },
    ],
  },
  experience: {
    id: "experience",
    title: "Experience",
    eyebrow: "Work & applied practice",
    intro:
      "Compact highlights across AI/data building, operations, student support, teaching, marketing, and business-facing work.",
    timeline: [
      {
        role: "AI & Data Builder",
        organization: "mgbuildsai · Self-employed",
        date: "Sep 2025 – Present",
        location: "Remote",
        tags: ["AI", "Data Analysis", "Automation", "Product Thinking"],
        bullets: [
          "Build practical tools, dashboards, and automation workflows with an emphasis on useful product thinking and clear decision support.",
          "Documenting projects, experiments, workflows, and lessons from building with AI and data.",
          "Current work includes RupiqoAI, an AI-assisted currency exchange timing tool.",
        ],
      },
      {
        role: "Thunderbird Park & Stadium Operations Staff",
        organization: "UBC Athletics & Recreation",
        date: "Sep 2025 – Apr 2026",
        location: "Vancouver · On-site",
        tags: ["Event Operations", "Customer Service", "Data Tracking"],
        bullets: [
          "Support event operations through facility coordination, logistics, customer service, equipment handling, and operational data tracking.",
          "Apply organization and data-tracking habits to inventory, attendance, and operational workflows.",
        ],
      },
      {
        role: "Intramural League Official",
        organization: "UBC Athletics & Recreation",
        date: "Sep 2025 – Jan 2026",
        location: "Vancouver · On-site",
        tags: ["Communication", "Decision-making", "Operations"],
        bullets: [
          "Support game operations through clear communication, conflict management, real-time decisions, and a positive participant experience.",
          "Communicate rules clearly and make confident real-time decisions.",
        ],
      },
      {
        role: "Vantage College Orientation Leader",
        organization: "The University of British Columbia",
        date: "Jun 2025 – Sep 2025",
        location: "Vancouver · On-site",
        tags: ["Leadership", "Community Building", "Communication"],
        bullets: [
          "Supported student onboarding through communication, campus guidance, group activities, and academic and social transition support.",
          "Facilitated group discussions, activities, and orientation programming.",
        ],
      },
      {
        role: "Check-In Assistant — Residence Move-In Day",
        organization: "UBC Student Housing & Community Services",
        date: "Jun 2025 – Sep 2025",
        location: "Vancouver · On-site",
        tags: ["Customer Service", "Data Entry", "Operations"],
        bullets: [
          "Provided administration and customer-facing support for check-in flow, registration, coordination, and onboarding during residence move-in.",
          "Managed registration, check-in packages, cart sign-outs, and data collection.",
        ],
      },
      {
        role: "Marketing Associate",
        organization: "Vancouver Housing Market Society",
        date: "Sep 2024 – Sep 2025",
        location: "Remote",
        tags: ["Marketing", "Analytics", "Content"],
        bullets: [
          "Supported campaigns and promotional strategies for student-led events.",
          "Used engagement tracking and basic analytics to measure outreach effectiveness.",
        ],
      },
      {
        role: "Teaching Assistant",
        organization: "Wize Academy",
        date: "Nov 2024 – Jan 2025",
        location: "Vancouver",
        tags: ["Teaching", "Coding", "Communication"],
        bullets: [
          "Delivered beginner-level coding and 3D modeling lessons.",
          "Introduced problem-solving, logic, and basic data visualization concepts.",
        ],
      },
      {
        role: "Wealth Management Project Associate",
        organization: "Golden Wings Structures Pvt. Ltd.",
        date: "May 2024 – Aug 2024",
        location: "Delhi",
        tags: ["Financial Analysis", "Client Communication", "Data Analysis"],
        bullets: [
          "Conducted data-driven analysis of financial portfolios related to insurance and retirement planning.",
          "Helped onboard and advise 15+ clients with client-friendly insights.",
        ],
      },
      {
        role: "Software Project — PayPal-Style Wallet",
        organization: "CPSC 210, UBC",
        date: "Jan 2024 – Apr 2024",
        location: "Course project",
        tags: ["Java", "Software Design", "Data Structures"],
        bullets: [
          "Developed a wallet-style Java application with user authentication and transaction logic.",
          "Worked with user data structures, backend logic, and team-based workflows.",
        ],
      },
    ],
  },
  resume: {
    id: "resume",
    title: "Resume",
    eyebrow: "Recruiter-ready overview",
    intro: "Product, AI/data, frontend, operations, and entry-level role overview.",
    pdfPath: "/files/Resume_MaanGrover.pdf",
    summary:
      "Product-minded builder with experience across AI/data tools, web projects, dashboards, operations, administrative support, customer-facing communication, and workflow design. Comfortable turning messy information into clear tools, organized systems, dashboards, and better decisions.",
    education: [
      {
        school: "University of British Columbia",
        program: "Quantitative, science, and technical coursework",
        date: "In progress",
        detail:
          "Coursework and projects spanning statistics, physics, earth and ocean sciences, machine learning, scientific data analysis, Java software design, and technical communication.",
      },
    ],
    strengths: [
      "Product-minded building",
      "Practical AI/Data tools",
      "Frontend / web systems",
      "Operations & admin support",
      "Customer-facing communication",
      "Entry-level role readiness",
    ],
    highlights: [
      "Builds practical tools, dashboards, and workflows from messy real-world information.",
      "Combines analytical coursework with operations, admin, student support, teaching, marketing, and client-facing experience.",
      "Comfortable documenting work, communicating clearly, and shipping polished prototypes.",
    ],
  },
  socials: {
    id: "socials",
    title: "Contact",
    eyebrow: "Connect",
    intro: "",
    groups: [
      {
        title: "Professional",
        cards: [
          { label: "Email", value: "maangrover090903@gmail.com", href: "mailto:maangrover090903@gmail.com", action: "Send email" },
          { label: "LinkedIn", value: "linkedin.com/in/maan-grover-949a65266", href: "https://www.linkedin.com/in/maan-grover-949a65266/", action: "Open LinkedIn" },
          { label: "GitHub", value: "github.com/mg911111", href: "https://github.com/mg911111", action: "View GitHub" },
          { label: "mgbuildsai Linktree", value: "Professional tools and builds", href: "https://linktr.ee/mgbuildsai", action: "Open Linktree" },
        ],
      },
      {
        title: "Creative",
        cards: [
          { label: "Personal Linktree", value: "Creative and personal links", href: "https://linktr.ee/yoitsmg?utm_source=linktree_profile_share&ltsid=e3974d8f-4d6e-4edc-a6c3-56978c59bf60", action: "Open Linktree" },
          { label: "mgbuildsai Instagram", value: "@mgbuilds.ai", href: "https://www.instagram.com/mgbuilds.ai/", action: "Open Instagram" },
          { label: "Personal Instagram", value: "@maangroverr", href: "https://www.instagram.com/maangroverr/", action: "Open Instagram" },
          { label: "YouTube Music", value: "Music release", href: "https://music.youtube.com/watch?v=uZ4r-a7Clrk", action: "Listen" },
          { label: "Spotify", value: "Music release", href: "https://open.spotify.com/album/5ncoSiovGJ6smZDK3D6w2C?si=VBFGLHOPTmCf45U1QloCXA&utm_medium=share&utm_source=linktree&nd=1&dlsi=73e7d34a524f46e5", action: "Open Spotify" },
        ],
      },
      {
        title: "Availability",
        cards: [
          {
            label: "Location",
            value: "Vancouver / Remote-friendly",
            action: "Open to entry-level roles, internships, operations/admin, product, AI/data, frontend, and analytics-adjacent roles.",
          },
        ],
      },
    ],
  },
  interests: {
    id: "interests",
    title: "About",
    eyebrow: "Profile",
    intro:
      "A concise profile across practical tools, web projects, AI/data work, operations, communication, and creative projects.",
    profileImage: "/profile/maan-headshot.jpg",
    personalIntro:
      "I’m Maan Grover, a product-minded builder with a UBC background across statistics, physics, earth and ocean sciences, technical coursework, data analysis, operations, and practical projects.\n\nI like turning messy information into clearer decisions — through dashboards, AI workflows, web tools, organized systems, and polished interactive experiences.\n\nAlongside technical building, I bring hands-on experience in operations, student support, event coordination, customer-facing communication, marketing, and creative work. I care about building tools and workflows that are useful, reliable, and easy for real people to understand.",
    cards: [
      {
        title: "What I build",
        body: "Dashboards, AI workflows, web tools, organized systems, and interactive portfolio experiences.",
      },
      {
        title: "What I care about",
        body: "Clear communication, useful workflows, reliable execution, and tools real people can understand.",
      },
      {
        title: "Current focus",
        body: "Building practical AI/data tools while presenting product, operations, and customer-facing strengths.",
      },
      {
        title: "Outside work",
        body: "Music, photography, gaming, training, travel, and creative experiments.",
      },
    ],
  },
};

portfolioContent.socials.gallery = [
  { src: "/profile/contact/contact-1.jpg", alt: "Maan Grover profile image 1" },
  { src: "/profile/contact/contact-2.jpg", alt: "Maan Grover profile image 2" },
  { src: "/profile/contact/contact-3.jpg", alt: "Maan Grover profile image 3" },
  { src: "/profile/contact/contact-4.jpg", alt: "Maan Grover profile image 4" },
];

portfolioContent.socials.video = {
  src: "/profile/contact/contact-video.mp4",
  label: "Contact video",
};

export function getPortfolioContent(sectionId) {
  return portfolioContent[sectionId] || null;
}
