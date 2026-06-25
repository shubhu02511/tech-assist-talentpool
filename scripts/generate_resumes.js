const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Define candidates database
const candidates = [
  // 1. Software Engineers
  {
    name: "Alex Rivera",
    email: "alex.rivera@gmail.com",
    phone: "+1 (415) 882-9901",
    linkedin: "linkedin.com/in/alex-rivera-dev",
    github: "github.com/alexrivera",
    role: "Senior Software Engineer",
    location: "San Francisco, CA",
    experience: "8 years",
    skills: ["React", "TypeScript", "Node.js", "Python", "GraphQL", "AWS", "Docker", "PostgreSQL", "CI/CD"],
    history: [
      {
        role: "Lead Front End Engineer",
        company: "Stripe",
        dates: "2022 - Present",
        details: "Designed and built modern dashboard interfaces using React and TypeScript. Managed a team of 4 frontend engineers. Improved rendering performance by 35% through code-splitting and memoization optimizations."
      },
      {
        role: "Senior Software Engineer",
        company: "Opendoor",
        dates: "2019 - 2022",
        details: "Built and scaled core service APIs using Python and Node.js. Maintained robust CI/CD pipelines on AWS. Managed migration of monolithic database to microservice architecture."
      },
      {
        role: "Full Stack Developer",
        company: "SeedStage",
        dates: "2018 - 2019",
        details: "Implemented initial web application product using React, Node.js, and Postgres. Set up local development workflows and cloud hosting."
      }
    ]
  },
  {
    name: "Emily Chen",
    email: "emily.chen@outlook.com",
    phone: "206-555-0198",
    linkedin: "linkedin.com/in/emily-chen-se",
    github: "github.com/emilychen-codes",
    role: "Software Engineer",
    location: "Seattle, WA",
    experience: "3 years",
    skills: ["JavaScript", "React", "Next.js", "Tailwind CSS", "Node.js", "Express", "MongoDB", "Jest", "Git"],
    history: [
      {
        role: "Software Engineer I",
        company: "Nordstrom Tech",
        dates: "2024 - Present",
        details: "Participate in development of e-commerce client interfaces using Next.js. Wrote over 100 unit and integration tests using Jest and React Testing Library. Collaborated in daily agile standups and sprint planning."
      },
      {
        role: "Associate Frontend Developer",
        company: "Zillow Group",
        dates: "2023 - 2024",
        details: "Maintained UI component libraries. Worked closely with design teams to translate Figma wireframes into accessible and responsive HTML/CSS structures."
      }
    ]
  },
  {
    name: "Devon Miller",
    email: "devon.miller@techie.com",
    phone: "(512) 991-0021",
    linkedin: "linkedin.com/in/devon-miller",
    github: "github.com/devonm",
    role: "Junior Full Stack Engineer",
    location: "Austin, TX",
    experience: "1.5 years",
    skills: ["JavaScript", "HTML5", "CSS3", "React.js", "Ruby on Rails", "PostgreSQL", "Git", "Bootstrap"],
    history: [
      {
        role: "Junior Software Developer",
        company: "WP Engine",
        dates: "2025 - Present",
        details: "Contributed to WordPress hosting plugin development. Assisted senior engineers in debugging and implementing new web features."
      },
      {
        role: "Web Development Intern",
        company: "Ace Digital Agency",
        dates: "2024 - 2024",
        details: "Built and deployed landing pages for corporate clients. Customized responsive CSS layout templates."
      }
    ]
  },
  {
    name: "Liam O'Connor",
    email: "liam.oconnor@protonmail.com",
    phone: "+353 87 123 4567",
    linkedin: "linkedin.com/in/liam-oconnor-backend",
    github: "github.com/liamoc",
    role: "Senior Backend Developer",
    location: "Remote",
    experience: "10 years",
    skills: ["Go", "Kubernetes", "Docker", "gRPC", "Redis", "Kafka", "MySQL", "Google Cloud Platform", "Microservices"],
    history: [
      {
        role: "Staff Backend Architect",
        company: "Shopify",
        dates: "2021 - Present",
        details: "Designed distributed transaction services in Go handling over 50k requests per second. Set up message queues via Kafka. Orchestrated Kubernetes clusters on GCP."
      },
      {
        role: "Senior Software Engineer",
        company: "Workday",
        dates: "2017 - 2021",
        details: "Developed enterprise API structures using Java and Spring Boot. Guided the team's microservices migration project."
      },
      {
        role: "Software Developer",
        company: "Decave Inc",
        dates: "2016 - 2017",
        details: "Maintained SQL database schemas, optimized slow querying profiles, and built server routing logic."
      }
    ]
  },

  // 2. UI/UX Designers
  {
    name: "Sofia Rodriguez",
    email: "sofia.rod@designstudio.io",
    phone: "650-339-4402",
    linkedin: "linkedin.com/in/sofia-rodriguez-design",
    github: "github.com/sofia-design",
    role: "Senior UI/UX Designer",
    location: "New York, NY",
    experience: "7 years",
    skills: ["Figma", "Adobe Creative Suite", "Wireframing", "User Research", "Prototyping", "Design Systems", "HTML/CSS", "Usability Testing"],
    history: [
      {
        role: "Principal Product Designer",
        company: "Squarespace",
        dates: "2023 - Present",
        details: "Led design systems redesign utilized by 20+ cross-functional teams. Conducted 40+ user interviews to identify usability gaps, leading to a 20% conversion rate increase."
      },
      {
        role: "Senior UX Designer",
        company: "InVision",
        dates: "2020 - 2023",
        details: "Created high-fidelity prototypes for mobile and web products. Worked alongside frontend engineers to verify layout consistency."
      },
      {
        role: "Product Designer",
        company: "CreativeCorp",
        dates: "2019 - 2020",
        details: "Designed client websites and digital marketing layouts. Iterated design assets based on user testing telemetry."
      }
    ]
  },
  {
    name: "Marcus Vance",
    email: "marcus.vance@visuals.com",
    phone: "312-555-8819",
    linkedin: "linkedin.com/in/marcus-vance-visuals",
    github: "github.com/marcusvance",
    role: "Product Designer",
    location: "Chicago, IL",
    experience: "4 years",
    skills: ["Figma", "Sketch", "Interaction Design", "User Flow Diagrams", "HTML", "CSS", "Responsive Design", "Illustrator"],
    history: [
      {
        role: "UI/UX Designer",
        company: "Groupon",
        dates: "2023 - Present",
        details: "Designed consumer mobile application flows. Restructured checkout screen configurations, reducing cart abandonment rate by 12%."
      },
      {
        role: "Junior UX Designer",
        company: "Sprout Social",
        dates: "2022 - 2023",
        details: "Collaborated on social analytics dashboard designs. Built comprehensive wireframes and site maps."
      }
    ]
  },

  // 3. Product & Project Managers
  {
    name: "Sarah Jenkins",
    email: "sarah.jenkins@acme.com",
    phone: "212-555-4039",
    linkedin: "linkedin.com/in/sarah-jenkins-pm",
    github: "github.com/sjenkins-pm",
    role: "Senior Product Manager",
    location: "Boston, MA",
    experience: "9 years",
    skills: ["Product Roadmap", "Agile/Scrum", "Jira", "SQL", "Amplitude", "User Analytics", "Market Research", "Cross-Functional Leadership"],
    history: [
      {
        role: "Lead Product Manager",
        company: "HubSpot",
        dates: "2021 - Present",
        details: "Own product roadmap for customer onboarding services. Scaled active monthly users from 1M to 3M. Led a cross-functional squad of 10 engineers, 2 designers, and 2 marketers."
      },
      {
        role: "Product Manager",
        company: "Wayfair",
        dates: "2018 - 2021",
        details: "Managed checkout funnel features. Executed 30+ A/B tests yielding over $2.5M in incremental revenue. Wrote comprehensive PRDs and user stories."
      },
      {
        role: "Product Owner",
        company: "LogMeIn",
        dates: "2017 - 2018",
        details: "Worked with developer squads to prioritize product backlogs. Handled release schedules and product documentation."
      }
    ]
  },
  {
    name: "Vikram Naidu",
    email: "v.naidu@enterprise.org",
    phone: "+91 98110 54321",
    linkedin: "linkedin.com/in/vikram-naidu-pm",
    github: "github.com/vnaidu-pm",
    role: "Project Manager",
    location: "Mumbai, India",
    experience: "5 years",
    skills: ["Scrum Master", "Jira", "MS Project", "Risk Management", "Budgeting", "Agile Methodologies", "Resource Allocation", "Stakeholder Management"],
    history: [
      {
        role: "IT Project Manager",
        company: "Tata Consultancy Services",
        dates: "2023 - Present",
        details: "Coordinate software delivery timelines for major European retail clients. Managed annual project budgets exceeding $1.2M. Achieved 98% on-time milestone delivery metrics."
      },
      {
        role: "Scrum Master",
        company: "Wipro",
        dates: "2021 - 2023",
        details: "Facilitated sprint planning, retrospectives, and standups for 3 distributed development teams. Removed blocker dependencies and tracked team velocity."
      }
    ]
  },

  // 4. Sales & Account Managers
  {
    name: "Chloe Dubois",
    email: "chloe.dubois@salesforce-hustle.com",
    phone: "415-555-7732",
    linkedin: "linkedin.com/in/chloe-dubois-sales",
    github: "github.com/chloesales",
    role: "Enterprise Sales Director",
    location: "Denver, CO",
    experience: "11 years",
    skills: ["Salesforce", "Enterprise Software Deals", "Negotiation", "B2B Sales", "Lead Generation", "Revenue Strategy", "Account Retention"],
    history: [
      {
        role: "Enterprise Account Executive",
        company: "Salesforce",
        dates: "2021 - Present",
        details: "Achieved 140% of quota in 2023 and 2024. Closed $4M+ ARR in net-new accounts. Managed complex multi-stakeholder contract negotiations for Fortune 500 accounts."
      },
      {
        role: "Senior Sales Representative",
        company: "Slack Technologies",
        dates: "2017 - 2021",
        details: "Pioneered mid-market sales approaches in the central region. Expanded existing accounts ARR by 45% through upselling enterprise modules."
      },
      {
        role: "B2B Sales Representative",
        company: "Yelp",
        dates: "2015 - 2017",
        details: "Conducted high-volume outbound calls to local businesses. Consistent top 10% performer in monthly sales competitions."
      }
    ]
  },
  {
    name: "James Cooper",
    email: "james.cooper@partnerships.net",
    phone: "720-555-9018",
    linkedin: "linkedin.com/in/james-cooper-accounts",
    github: "github.com/jcooper-sales",
    role: "Account Manager",
    location: "Austin, TX",
    experience: "4 years",
    skills: ["Customer Relationship Management", "Account Retention", "Upselling", "Presentations", "HubSpot", "Contract Renewals", "Project Scoping"],
    history: [
      {
        role: "Customer Success Account Manager",
        company: "Atlassian",
        dates: "2023 - Present",
        details: "Manage portfolio of 60+ mid-market corporate clients representing $1.8M ARR. Maintained customer retention rate of 97.4%."
      },
      {
        role: "Account Executive",
        company: "Miro",
        dates: "2022 - 2023",
        details: "Conducted product demonstrations for incoming leads. Managed trial onboarding workflows for corporate workspaces."
      }
    ]
  },

  // 5. Operations & Customer Support
  {
    name: "Elena Rostova",
    email: "elena.rost@supportpro.com",
    phone: "+49 176 9901882",
    linkedin: "linkedin.com/in/elena-rostova-ops",
    github: "github.com/elenarost",
    role: "Customer Support Manager",
    location: "Berlin, Germany",
    experience: "6 years",
    skills: ["Zendesk", "Intercom", "Customer Experience", "Team Management", "Technical Troubleshooting", "KPI Tracking", "SLA Enforcement"],
    history: [
      {
        role: "Customer Support Team Lead",
        company: "N26",
        dates: "2023 - Present",
        details: "Supervise a team of 15 support specialists. Redesigned routing rules in Zendesk, reducing median resolution time by 25%. Monitored team CSAT scores, maintaining a 94.8% approval rate."
      },
      {
        role: "Senior Customer Support Agent",
        company: "Contentful",
        dates: "2020 - 2023",
        details: "Handled tier-2 technical API integrations support queries. Authored 30+ internal knowledge base articles to facilitate agent onboarding."
      }
    ]
  },
  {
    name: "Tyler Jenkins",
    email: "tyler.j@operations.org",
    phone: "617-555-0103",
    linkedin: "linkedin.com/in/tyler-jenkins-ops",
    github: "github.com/tylerops",
    role: "Operations Specialist",
    location: "Boston, MA",
    experience: "3 years",
    skills: ["Logistics", "Process Optimization", "Vendor Management", "Excel", "Data Analysis", "Project Tracking", "Supply Chain"],
    history: [
      {
        role: "Operations Coordinator",
        company: "Toast Tab",
        dates: "2024 - Present",
        details: "Streamlined hardware supply chain delivery pipelines, cutting dispatch overhead cost by 8%. Standardized supplier vendor review protocols."
      },
      {
        role: "Operations Associate",
        company: "Amazon Logistics",
        dates: "2023 - 2024",
        details: "Audited warehouse performance metrics and coordinated local carrier scheduling. Resolving delivery logistics exception blocks."
      }
    ]
  }
];

// Generate extra candidate variants programmatically to reach 28 resumes
const departments = ["Engineering", "Design", "Management", "Sales", "Operations"];
const cities = ["San Francisco, CA", "Seattle, WA", "New York, NY", "Austin, TX", "Boston, MA", "Chicago, IL", "Denver, CO", "Remote", "London, UK", "Toronto, ON"];
const firstNames = ["Daniel", "Grace", "Oliver", "Sophia", "Lucas", "Ava", "Mason", "Mia", "Ethan", "Isabella", "Alexander", "Charlotte", "Ryan", "Emma", "Jacob", "Harper"];
const lastNames = ["Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis"];
const skillsPool = {
  "Engineering": ["React", "Node.js", "Python", "TypeScript", "SQL", "Docker", "AWS", "Java", "C++", "C#", "Spring", "Angular", "Vue", "Kubernetes", "Linux", "MongoDB"],
  "Design": ["Figma", "Sketch", "UI Design", "UX Research", "Wireframing", "Interaction Design", "Photoshop", "Illustrator", "Design Systems", "Prototyping"],
  "Management": ["Agile", "Scrum", "Product Strategy", "Jira", "Market Research", "Project Roadmap", "SQL", "KPI Metrics", "Budget Planning", "Risk Management"],
  "Sales": ["Salesforce", "B2B Sales", "Cold Calling", "Negotiation", "CRM", "Lead Generation", "Client Relations", "HubSpot", "Deal Closing", "Account Management"],
  "Operations": ["Process Optimization", "Zendesk", "Intercom", "Customer Success", "Data Analysis", "Logistics", "SLA Monitoring", "Vendor Management", "Excel"]
};

// Generate candidates up to 28
while (candidates.length < 28) {
  const dept = departments[Math.floor(Math.random() * departments.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const name = `${firstName} ${lastName}`;
  const slug = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  
  const email = `${slug}@${Math.random() > 0.4 ? 'gmail.com' : 'outlook.com'}`;
  const phone = `+1 (${Math.floor(200+Math.random()*700)}) 555-${Math.floor(1000+Math.random()*9000)}`;
  const linkedin = `linkedin.com/in/${slug}`;
  const github = Math.random() > 0.3 ? `github.com/${slug.replace('.', '')}` : null;
  const location = cities[Math.floor(Math.random() * cities.length)];
  
  const expYears = Math.floor(1 + Math.random() * 12);
  let role = "";
  if (dept === "Engineering") {
    role = expYears > 6 ? "Senior Software Engineer" : (expYears > 2 ? "Software Engineer" : "Junior Developer");
  } else if (dept === "Design") {
    role = expYears > 5 ? "Lead Product Designer" : "UI/UX Designer";
  } else if (dept === "Management") {
    role = expYears > 5 ? "Senior Product Manager" : "Project Coordinator";
  } else if (dept === "Sales") {
    role = expYears > 5 ? "Account Director" : "Sales Representative";
  } else if (dept === "Operations") {
    role = expYears > 5 ? "Customer Experience Lead" : "Operations Associate";
  }
  
  // Pick 5-8 random skills from department pool
  const deptSkills = skillsPool[dept];
  const numSkills = 5 + Math.floor(Math.random() * 4);
  const skills = [];
  while (skills.length < numSkills) {
    const s = deptSkills[Math.floor(Math.random() * deptSkills.length)];
    if (!skills.includes(s)) skills.push(s);
  }
  
  // Setup simple history
  const history = [
    {
      role: role,
      company: `${firstName}Tech Solutions`,
      dates: `${2026 - Math.floor(expYears / 2)} - Present`,
      details: `Lead development and operational execution of core client requests in ${dept}. Streamlined pipeline structures by ${10 + Math.floor(Math.random()*20)}% over standard periods. Oversee cross-team collaborations.`
    }
  ];
  
  if (expYears > 4) {
    history.push({
      role: `Associate ${role.split(' ').pop()}`,
      company: `OldCorp Inc`,
      dates: `${2026 - expYears} - ${2026 - Math.floor(expYears / 2)}`,
      details: `Handled support, design, and coordination features. Conducted daily scrum workflows and maintained client satisfaction metrics above 95%.`
    });
  }

  candidates.push({
    name,
    email,
    phone,
    linkedin,
    github,
    role,
    location,
    experience: `${expYears} years`,
    skills,
    history
  });
}

// Write resumes to directory
const OUTPUT_DIR = path.join(__dirname, '..', 'test_resumes');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

console.log(`Generating 28 fake resumes in ${OUTPUT_DIR}...`);

candidates.forEach((c, index) => {
  // Use older PDF 1.4 standard and disable compression for maximum compatibility with pdf-parse 1.1.1
  const doc = new PDFDocument({ 
    margin: 50,
    pdfVersion: '1.4',
    compress: false
  });
  
  const filename = `${c.name.replace(/\s+/g, '_')}_Resume.pdf`;
  const filePath = path.join(OUTPUT_DIR, filename);
  
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  
  // Title
  doc.fontSize(22).font('Helvetica-Bold').text(c.name, { align: 'center' });
  doc.moveDown(0.2);
  
  // Subtitle / Contact Header
  doc.fontSize(10).fillColor('#64748b').font('Helvetica');
  let contactString = `${c.email} | ${c.phone}\n${c.linkedin}`;
  if (c.github) contactString += ` | ${c.github}`;
  doc.text(contactString, { align: 'center' });
  doc.moveDown(1.5);
  
  // Section Divider
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(562, doc.y).stroke();
  doc.moveDown(1.0);
  
  // Target Role / Location
  doc.fillColor('#0f172a');
  doc.fontSize(14).font('Helvetica-Bold').text(`${c.role}`, { continued: true });
  doc.fontSize(11).fillColor('#6366f1').font('Helvetica').text(` - Based in ${c.location} (${c.experience} Experience)`, { align: 'left' });
  doc.moveDown(1.0);
  
  // Skills Section
  doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('PROFESSIONAL SKILLS');
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#334155').font('Helvetica').text(c.skills.join(', '));
  doc.moveDown(1.2);
  
  // Experience Section
  doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('WORK HISTORY');
  doc.moveDown(0.5);
  
  c.history.forEach((h) => {
    doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text(`${h.role}`, { continued: true });
    doc.fontSize(10).fillColor('#64748b').font('Helvetica').text(` at ${h.company} (${h.dates})`);
    doc.moveDown(0.2);
    doc.fontSize(10).fillColor('#334155').text(h.details);
    doc.moveDown(0.8);
  });
  
  // Education Section
  doc.moveDown(0.4);
  doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text('EDUCATION');
  doc.moveDown(0.3);
  doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text('Bachelor of Science / Business Administration');
  doc.fontSize(10).fillColor('#64748b').font('Helvetica').text('State University - Graduation Year 2018');
  
  doc.end();
  
  stream.on('finish', () => {
    if (index === candidates.length - 1) {
      console.log('All resumes generated successfully!');
    }
  });
});
