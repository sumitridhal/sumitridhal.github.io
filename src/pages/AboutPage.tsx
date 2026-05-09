import { useMemo } from 'react'

import { useI18n } from '@/contexts/I18nContext'
import type { Locale } from '@/i18n/routes'

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
  skills: string[]
  education: string
  community: string[]
}

export function AboutPage() {
  const { locale, t } = useI18n()

  const content = useMemo<Record<Locale, AboutContent>>(() => {
    return {
      en: {
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
        skills: [
          'Agentic Workflows',
          'Vercel AI SDK',
          'React 18',
          'TypeScript 5',
          'Node.js 18',
          'GraphQL',
          'PostgreSQL',
          'Kubernetes',
          'Docker',
          'GitHub Actions',
        ],
        education:
          'B.Tech. in Computer Science, Guru Gobind Singh Indraprastha University (2013)',
        community: [
          'Organizer, Pune JavaScript Group (2022 - Present)',
          'Hackathon Mentor, TechFest India (2022 - 2023)',
          'Volunteer, Natural History Society of Northumbria (2023)',
        ],
      },
      de: {
        headline: 'Principal Software Engineer',
        lead: 'Mehr als 11 Jahre Erfahrung in Full-Stack-Produkten, Microservices und KI-gestuetzten Anwendungen. Aktuell leite ich bei Red Hat Initiativen fuer agentische Workflows sowie KI-UX/UI.',
        highlights: [
          'Architektur cloud-nativer Microservices auf Kubernetes und Docker mit 30% besserer Deployment-Effizienz.',
          'Aufbau von Tekton- und GitHub-Actions-Pipelines mit 80% kuerzerer Deployment-Lead-Time.',
          'Entwicklung performanter Node.js- und GraphQL-Middleware mit 40% schnelleren Datenabrufen.',
        ],
        experience: [
          {
            company: 'Red Hat',
            location: 'Bangalore, Indien',
            roles: [
              {
                title: 'Principal Software Engineer',
                period: 'Apr 2024 - Heute',
                highlights: [
                  'Konzeption intelligenter agentischer Workflows mit dem Vercel AI SDK fuer autonome Ausfuehrung und zustandsbehaftete Orchestrierung.',
                  'Leitung von KI-zentrierten UX-Mustern und Interface-Systemen fuer die Zusammenarbeit von Mensch und KI.',
                  'Steigerung von Zuverlaessigkeit und CI/CD-Qualitaet durch cloud-native Architektur und Automatisierung.',
                ],
              },
              {
                title: 'Senior Software Engineer',
                period: 'Maerz 2021 - Apr 2024',
                highlights: [
                  'Steigerung der Nutzerzufriedenheit um 25% durch Modernisierung zentraler Oberflaechen.',
                  'Entwicklung einer Form-Schema-Plattform mit Node.js, KoaJS und PostgreSQL mit 25% effizienterer Datenverarbeitung.',
                  'Architektur integrierter Produktflaechen fuer mehr als 10.000 Enterprise-Nutzer.',
                ],
              },
            ],
          },
          {
            company: 'Western Union',
            location: 'Pune, Indien',
            roles: [
              {
                title: 'Senior Associate',
                period: 'Nov 2017 - Maerz 2021',
                highlights: [
                  'Aufbau eines Design-Systems, das die Entwicklungszeit neuer Features um 25% reduzierte.',
                  'Modernisierung des Frontends von Angular 1.x auf Angular 6.',
                  'Verbesserung von Kiosk- und Web-Performance durch Code-Splitting und Lazy Loading.',
                ],
              },
            ],
          },
          {
            company: 'Tech Mahindra',
            location: 'Pune, Indien',
            roles: [
              {
                title: 'Software Engineer',
                period: 'Maerz 2014 - Nov 2017',
                highlights: [
                  'Konzeption von Analytics-Dashboards mit 40% schnellerem Reporting.',
                  'Automatisierung von Reconciliation-Prozessen mit Einsparung von ueber 10 Stunden manueller Arbeit pro Woche.',
                  'Integration von Monitoring mit Nagios und Verbesserung der Infrastruktur-Verfuegbarkeit um 15%.',
                ],
              },
            ],
          },
        ],
        skills: [
          'Agentische Workflows',
          'Vercel AI SDK',
          'React 18',
          'TypeScript 5',
          'Node.js 18',
          'GraphQL',
          'PostgreSQL',
          'Kubernetes',
          'Docker',
          'GitHub Actions',
        ],
        education:
          'Bachelor of Technology in Informatik, Guru Gobind Singh Indraprastha University (2013)',
        community: [
          'Organizer, Pune JavaScript Group (2022 - Heute)',
          'Hackathon Mentor, TechFest India (2022 - 2023)',
          'Volunteer, Natural History Society of Northumbria (2023)',
        ],
      },
      fr: {
        headline: 'Ingénieur logiciel principal',
        lead: "Plus de 11 ans à construire des produits full-stack, des microservices et des expériences pilotées par l'IA. J'anime les initiatives workflows agentiques et UX/UI IA chez Red Hat.",
        highlights: [
          'Architecture de microservices cloud-native sur Kubernetes et Docker (+30 % efficacité de déploiement).',
          'Pipelines Tekton et GitHub Actions réduisant le délai de mise en ligne de 80 %.',
          'Middleware Node.js et GraphQL haute performance, latence données -40 %.',
        ],
        experience: [
          {
            company: 'Red Hat',
            location: 'Bangalore, Inde',
            roles: [
              {
                title: 'Ingénieur logiciel principal',
                period: 'Avr 2024 - Présent',
                highlights: [
                  'Conception de workflows agentiques avec le Vercel AI SDK (exécution autonome, orchestration).',
                  'Direction des patterns UX IA et systèmes d’interface pour la collaboration homme-machine.',
                  'Fiabilisation CI/CD et architecture cloud-native.',
                ],
              },
              {
                title: 'Ingénieur logiciel senior',
                period: 'Mars 2021 - Avr 2024',
                highlights: [
                  '+25 % satisfaction utilisateur via modernisation UI et livraison transverse.',
                  'Plateforme de schémas de formulaires Node.js, KoaJS, PostgreSQL (+25 % efficacité données).',
                  'Expériences produit pour 10 000+ utilisateurs enterprise.',
                ],
              },
            ],
          },
          {
            company: 'Western Union',
            location: 'Pune, Inde',
            roles: [
              {
                title: 'Senior Associate',
                period: 'Nov 2017 - Mars 2021',
                highlights: [
                  'Design system réduisant le temps de développement de fonctionnalités de 25 %.',
                  'Modernisation Angular 1.x → Angular 6.',
                  'Performances kiosk et web (code splitting, lazy loading).',
                ],
              },
            ],
          },
          {
            company: 'Tech Mahindra',
            location: 'Pune, Inde',
            roles: [
              {
                title: 'Ingénieur logiciel',
                period: 'Mars 2014 - Nov 2017',
                highlights: [
                  'Tableaux analytics (-40 % temps de reporting).',
                  'Automatisation des workflows de reconciliation (-10 h/semaine).',
                  'Monitoring Nagios et disponibilité infrastructure +15 %.',
                ],
              },
            ],
          },
        ],
        skills: [
          'Workflows agentiques',
          'Vercel AI SDK',
          'React 18',
          'TypeScript 5',
          'Node.js 18',
          'GraphQL',
          'PostgreSQL',
          'Kubernetes',
          'Docker',
          'GitHub Actions',
        ],
        education:
          'B.Tech informatique, Guru Gobind Singh Indraprastha University (2013)',
        community: [
          'Organisateur, Pune JavaScript Group (2022 - présent)',
          'Mentor hackathon, TechFest India (2022 - 2023)',
          'Bénévole, Natural History Society of Northumbria (2023)',
        ],
      },
      hi: {
        headline: 'प्रमुख सॉफ्टवेयर इंजीनियर',
        lead: 'फुल-स्टैक प्रोडक्ट, माइक्रोसर्विस और AI से चलने वाले अनुभव बनाने में 11 से अधिक वर्ष। वर्तमान में Red Hat पर एजेंटिक वर्कफ़्लो और AI UX/UI की दिशा तय करना।',
        highlights: [
          'Kubernetes और Docker पर क्लाउड-नेटिव माइक्रोसर्विस आर्किटेक्चर — डिप्लॉय फ्लेक्सिबिलिटी ~30% बेहतर।',
          'Tekton और GitHub Actions पाइपलाइन — डिप्लॉय लीड-टाइम में ~80% कमी।',
          'Node.js और GraphQL मिडिलवेयर — डेटा-फ़ेच लेटेंसी ~40% कम।',
        ],
        experience: [
          {
            company: 'Red Hat',
            location: 'बैंगलोर, भारत',
            roles: [
              {
                title: 'Principal Software Engineer',
                period: 'अप्रैल 2024 - वर्तमान',
                highlights: [
                  'Vercel AI SDK के साथ एजेंटिक वर्कफ़्लो — स्वायत्त निष्पादन और ऑर्केस्ट्रेशन।',
                  'मानव-AI सहयोग के लिए AI-फ़र्स्ट UX पैटर्न और इंटरफ़ेस सिस्टम का नेतृत्व।',
                  'क्लाउड-नेटिव आर्किटेक्चर और ऑटोमेशन के ज़रिए विश्वसनीयता और CI/CD सुधार।',
                ],
              },
              {
                title: 'Senior Software Engineer',
                period: 'मार्च 2021 - अप्रैल 2024',
                highlights: [
                  'इंटरफ़ेस आधुनिकीकरण से उपयोगकर्ता संतुष्टि ~25% बढ़ाई।',
                  'Node.js, KoaJS, PostgreSQL पर कस्टम फ़ॉर्म स्कीमा प्लेटफ़ॉर्म — डेटा हैंडलिंग दक्षता ~25%।',
                  '10,000+ एंटरप्राइज़ उपयोगकर्ताओं के लिए एकीकृत प्रोडक्ट अनुभव का आर्किटेक्चर।',
                ],
              },
            ],
          },
          {
            company: 'Western Union',
            location: 'पुणे, भारत',
            roles: [
              {
                title: 'Senior Associate',
                period: 'नवंबर 2017 - मार्च 2021',
                highlights: [
                  'डिज़ाइन सिस्टम पहल — नई सुविधा विकास समय ~25% कम।',
                  'फ़्रंटएंड Angular 1.x से Angular 6 तक आधुनिकीकरण।',
                  'कोड-स्प्लिटिंग और लेज़ी लोडिंग से कीओस्क और वेब प्रदर्शन सुधार।',
                ],
              },
            ],
          },
          {
            company: 'Tech Mahindra',
            location: 'पुणे, भारत',
            roles: [
              {
                title: 'Software Engineer',
                period: 'मार्च 2014 - नवंबर 2017',
                highlights: [
                  'एनालिटिक्स डैशबोर्ड — रिपोर्टिंग समय ~40% कम।',
                  'सुलह वर्कफ़्लो ऑटोमेशन — प्रति सप्ताह 10+ घंटे बचत।',
                  'Nagios मॉनिटरिंग एकीकरण — इन्फ़्रास्ट्रक्चर अपटाइम ~15% बेहतर।',
                ],
              },
            ],
          },
        ],
        skills: [
          'Agentic Workflows',
          'Vercel AI SDK',
          'React 18',
          'TypeScript 5',
          'Node.js 18',
          'GraphQL',
          'PostgreSQL',
          'Kubernetes',
          'Docker',
          'GitHub Actions',
        ],
        education:
          'कंप्यूटर साइंस में B.Tech, गुरु गोबिंद सिंह इंद्रप्रस्थ विश्वविद्यालय (2013)',
        community: [
          'आयोजक, Pune JavaScript Group (2022 - वर्तमान)',
          'हैकाथॉन मेंटॉर, TechFest India (2022 - 2023)',
          'स्वयंसेवक, Natural History Society of Northumbria (2023)',
        ],
      },
    }
  }, [])

  const localized = content[locale]

  return (
    <article className="about-page">
      <section className="about-page__intro">
        <p className="about-page__kicker">{t('pages.about.kicker')}</p>
        <h1 className="about-page__headline">{localized.headline}</h1>
        <p className="about-page__lead">{localized.lead}</p>
        <ul className="about-page__highlights">
          {localized.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="about-page__experience">
        <h2 className="about-page__section-title">{t('pages.about.experienceHeading')}</h2>
        <div className="about-page__experience-list">
          {localized.experience.map((entry) => (
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

      <section className="about-page__meta-grid">
        <article className="about-page__meta-card">
          <h2>{t('pages.about.skillsHeading')}</h2>
          <ul className="about-page__skills">
            {localized.skills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        </article>
        <article className="about-page__meta-card">
          <h2>{t('pages.about.educationHeading')}</h2>
          <p>{localized.education}</p>
          <h2>{t('pages.about.communityHeading')}</h2>
          <ul>
            {localized.community.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </article>
  )
}
