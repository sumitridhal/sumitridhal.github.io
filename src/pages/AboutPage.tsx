import { useI18n } from '@/contexts/I18nContext'

export function AboutPage() {
  const { t } = useI18n()

  return (
    <article className="about-page">
      <section className="about-page__section" aria-labelledby="about-heading">
        <h1 id="about-heading" className="about-page__title">
          {t('pages.about.title')}
        </h1>
        <p>
          Principal Engineer working on agentic UX and AI. I build agentic
          workflows and AI-first product experiences: the systems and interfaces
          that make human-AI collaboration reliable, plus the cloud-native
          architecture and delivery automation underneath them.
        </p>
        <p>
          In my personal time I build developer tools and visual experiments,
          which I open source when they are ready. I am interested in practical
          tools that give people more control over how they build, write, and
          work with coding agents.
        </p>
      </section>

      <section className="about-page__section" aria-labelledby="journey-heading">
        <h2 id="journey-heading">How I got here</h2>
        <p className="about-page__path">
          Software Engineering → Product Platforms → Agentic UX and AI.
        </p>
        <p>
          I started out building analytics, reconciliation, and monitoring tools,
          then moved deeper into product engineering—modernizing frontend
          architecture, improving web and kiosk performance, and leading
          design-system work that made teams faster.
        </p>
        <p>
          Later I built full-stack product experiences for more than 10,000
          enterprise users. That work ranged from Node.js and PostgreSQL
          platforms to cloud-native services and CI/CD pipelines. As AI systems
          became useful in production, my focus shifted toward agentic workflows,
          evaluations, guardrails, and the interaction patterns people need to
          trust them.
        </p>
        <p>Now I build AI systems full-time.</p>
      </section>

      <section className="about-page__section" aria-labelledby="site-heading">
        <h2 id="site-heading">This site</h2>
        <p>
          This site collects my public work on agents and developer tooling,
          along with writings, reading notes, and visual experiments.
        </p>
        <p>
          You can find me on{' '}
          <a
            href={t('pages.footer.social.githubHref')}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('pages.footer.social.githubLabel')}
          </a>{' '}
          and{' '}
          <a
            href={t('pages.footer.social.linkedinHref')}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('pages.footer.social.linkedinLabel')}
          </a>
          .
        </p>
      </section>
    </article>
  )
}
