import {
  CallToAction,
  Features,
  Footer,
  Hero,
  Navbar,
  Testimonials,
} from './components';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, MessageSquare, GraduationCap, Globe } from 'lucide-react';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

const MethodSection = () => {
  const methods = [
    {
      title: 'Comprehensive Vocabulary Building',
      description:
        'Expand your vocabulary through context-based learning, spaced repetition, and real-world usage examples.',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Immersive Listening Practice',
      description:
        'Train your ear with authentic audio materials, podcasts, and conversations at various speeds and accents.',
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-green-50 text-green-700',
    },
    {
      title: 'Structured Grammar Approach',
      description:
        'Master English grammar through clear explanations, examples, and practical exercises that reinforce concepts.',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-700',
    },
    {
      title: 'Cultural Context Integration',
      description:
        'Understand the cultural nuances of English through idioms, slang, and cultural references from English-speaking countries.',
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <section id="methods" className="section-padding bg-white dark:bg-gray-900">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 dark:bg-gray-700 dark:text-gray-300">
            Our Methodology
          </span>
          <h2 className="heading-2 mb-4">How our approach works</h2>
          <p className="subtitle mx-auto max-w-3xl dark:text-gray-400">
            Our proven self-study methodology combines effective learning
            techniques with modern technology to help you achieve fluency
            efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {methods.map((method, index) => (
            <div
              key={index}
              className="flex opacity-0 animate-slide-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className={`${method.color} p-3 rounded-lg h-fit mr-4`}>
                {method.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{method.title}</h3>
                <p className="text-muted-foreground dark:text-gray-400">
                  {method.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-16 bg-blue-50 rounded-xl p-8 opacity-0 animate-fade-in dark:bg-gray-800"
          style={{ animationDelay: '800ms' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-3">
                The 3-Step Learning Process
              </h3>
              <p className="text-muted-foreground mb-6 dark:text-gray-400">
                Our approach follows a proven 3-step process that maximizes
                retention and practical application.
              </p>

              <div className="space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-medium mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Discover</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Learn new concepts through engaging, multimedia lessons.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-medium mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Practice</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Reinforce learning through varied exercises and real-world
                      application.
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-medium mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Master</h4>
                    <p className="text-sm text-muted-foreground dark:text-gray-400">
                      Apply knowledge in practical situations and receive
                      feedback to improve.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-soft p-6 border border-neutral-100 dark:bg-gray-800 dark:border-gray-700">
              <h4 className="font-semibold mb-4">Weekly Study Plan</h4>
              <div className="space-y-3">
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <span className="text-sm">Monday</span>
                  <span className="text-sm font-medium">Vocabulary</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <span className="text-sm">Tuesday</span>
                  <span className="text-sm font-medium">Grammar</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <span className="text-sm">Wednesday</span>
                  <span className="text-sm font-medium">Reading</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <span className="text-sm">Thursday</span>
                  <span className="text-sm font-medium">Listening</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-100">
                  <span className="text-sm">Friday</span>
                  <span className="text-sm font-medium">Speaking</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Weekend</span>
                  <span className="text-sm font-medium">Practice & Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FAQSection = () => {
  const faqs = [
    {
      question: 'How much time should I dedicate to learning each day?',
      answer:
        'Consistency is more important than duration. We recommend 20-30 minutes of focused study daily rather than several hours once a week. Our platform is designed to make even short study sessions productive.',
    },
    {
      question: 'Can I really learn English effectively through self-study?',
      answer:
        'Absolutely! Our platform is designed specifically for self-study success. With structured lessons, interactive exercises, and progress tracking, you can learn efficiently on your own schedule.',
    },
    {
      question: 'What level of English proficiency is required to start?',
      answer:
        'Our platform accommodates all levels from complete beginners to advanced learners. The initial assessment will place you at the appropriate starting point for your current ability.',
    },
    {
      question: 'How long will it take to become fluent?',
      answer:
        'Progress varies based on several factors including your starting level, study consistency, and language learning aptitude. Many learners see significant improvement within 3-6 months of regular practice.',
    },
    {
      question: 'Is there any way to practice speaking with others?',
      answer:
        'Yes! Our community feature allows you to connect with other learners for conversation practice. We also offer optional speaking sessions with tutors for an additional fee.',
    },
    {
      question: 'Can I access the platform on multiple devices?',
      answer:
        'Yes, our platform is fully responsive and works on computers, tablets, and smartphones. Your progress synchronizes across all your devices automatically.',
    },
  ];

  return (
    <section
      id="faq"
      className="section-padding bg-neutral-50 dark:bg-gray-900"
    >
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 dark:bg-gray-700 dark:text-gray-300">
            FAQ
          </span>
          <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
          <p className="subtitle mx-auto max-w-3xl dark:text-gray-400">
            Find answers to common questions about our English self-study
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-soft border border-neutral-100 opacity-0 animate-fade-in dark:bg-gray-800 dark:border-gray-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
              <p className="text-muted-foreground dark:text-gray-400">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their personal dashboard
  // (dashboard route is inside MainLayout which provides QueryClientProvider)
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const smoothScroll = (e: MouseEvent) => {
      const target = e.target as HTMLAnchorElement;
      if (target && target.tagName === 'A' && target.hash) {
        const element = document.querySelector(target.hash);
        if (element) {
          e.preventDefault();
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 80,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', smoothScroll);
    return () => document.removeEventListener('click', smoothScroll);
  }, []);

  // While auth is being checked or user is being redirected, show nothing to avoid flash
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <MethodSection />
      <Testimonials />
      <FAQSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default HomePage;
