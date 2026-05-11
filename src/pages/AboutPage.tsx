import { useI18n } from '@/contexts/I18nContext'

type ExperienceRole = {
  title: string
  period: string
  highlights: string[]
}

type ExperienceItem = {
  company: string
  location: string
  roles: ExperienceRole[]
}

type AboutContent = {
  headline: string
  lead: string
  highlights: string[]
  experience: ExperienceItem[]
}

const aboutContent: AboutContent = {
  headline: 'Principal Software Engineer',
  lead: '11+ years building full-stack products, microservices, and AI-powered experiences. I currently lead agentic workflow and AI UX/UI initiatives at Red Hat.',
  highlights: [
    'Architected cloud-native microservices on Kubernetes and Docker, improving deployment flexibility and efficiency by 30%.',
    'Built Tekton and GitHub Actions pipelines that reduced deployment lead time by 80%.',
    'Designed high-performance Node.js and GraphQL middleware that reduced data-fetch latency by 40%.',
  ],
  experience: [
    {
      company: 'Red Hat',
      location: 'Bangalore, India',
      roles: [
        {
          title: 'Principal Software Engineer',
          period: 'Apr 2024 - Present',
          highlights: [
            'Architecting intelligent agentic workflows with the Vercel AI SDK for autonomous execution and stateful orchestration.',
            'Leading AI-first UX patterns and interface systems for human-AI collaboration.',
            'Driving reliability and CI/CD improvements through cloud-native architecture and automation.',
          ],
        },
        {
          title: 'Senior Software Engineer',
          period: 'Mar 2021 - Apr 2024',
          highlights: [
            'Improved user satisfaction by 25% through interface modernization and cross-functional delivery.',
            'Built a custom form schema platform with Node.js, KoaJS, and PostgreSQL, improving data handling efficiency by 25%.',
            'Architected integrated product experiences for 10,000+ enterprise users.',
          ],
        },
      ],
    },
    {
      company: 'Western Union',
      location: 'Pune, India',
      roles: [
        {
          title: 'Senior Associate',
          period: 'Nov 2017 - Mar 2021',
          highlights: [
            'Led design system initiatives that reduced new feature development time by 25%.',
            'Modernized frontend architecture from Angular 1.x to Angular 6.',
            'Improved kiosk and web performance with code-splitting and lazy loading.',
          ],
        },
      ],
    },
    {
      company: 'Tech Mahindra',
      location: 'Pune, India',
      roles: [
        {
          title: 'Software Engineer',
          period: 'Mar 2014 - Nov 2017',
          highlights: [
            'Designed analytics dashboards that reduced reporting time by 40%.',
            'Automated reconciliation workflows, saving 10+ hours of manual effort per week.',
            'Integrated monitoring with Nagios, improving infrastructure uptime by 15%.',
          ],
        },
      ],
    },
  ],
}

export function AboutPage() {
  const { t } = useI18n()

  return (
    <article className="about-page">
      <section className="about-page__intro">
        <p className="about-page__kicker">{t('pages.about.kicker')}</p>
        <h1 className="about-page__headline">{aboutContent.headline}</h1>
        <p className="about-page__lead">{aboutContent.lead}</p>
        <ul className="about-page__highlights">
          {aboutContent.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="about-page__experience">
        <h2 className="about-page__section-title">{t('pages.about.experienceHeading')}</h2>
        <div className="about-page__experience-list">
          {aboutContent.experience.map((entry) => (
            <article key={entry.company} className="about-page__experience-item">
              <header className="about-page__experience-header">
                <h3>{entry.company}</h3>
                <p>{entry.location}</p>
              </header>
              {entry.roles.map((role) => (
                <section key={role.title} className="about-page__role">
                  <div className="about-page__role-head">
                    <h4>{role.title}</h4>
                    <span>{role.period}</span>
                  </div>
                  <ul>
                    {role.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </article>
          ))}
        </div>
      </section>
    </article>
  )
}
