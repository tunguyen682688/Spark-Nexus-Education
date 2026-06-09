import React, { useEffect, useRef } from 'react';
import { BookOpen, Globe, GraduationCap, MessageSquare } from 'lucide-react';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}

const Feature: React.FC<FeatureProps> = ({
  title,
  description,
  icon,
  index,
}) => {
  const featureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentFeature = featureRef.current;
    if (currentFeature) {
      observer.observe(currentFeature);
    }

    return () => {
      if (currentFeature) {
        observer.unobserve(currentFeature);
      }
    };
  }, [index]);

  return (
    <div
      ref={featureRef}
      className="p-6 rounded-xl bg-white shadow-soft border border-neutral-100 opacity-0 dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground dark:text-gray-400">{description}</p>
    </div>
  );
};

const Features = () => {
  const featuresData = [
    {
      title: 'Personalized Learning',
      description:
        'Adaptive learning paths that adjust to your proficiency level, learning style, and pace.',
      icon: <GraduationCap size={24} />,
    },
    {
      title: 'Real-world Conversations',
      description:
        'Practice with authentic dialogues and scenarios to improve your speaking and listening skills.',
      icon: <MessageSquare size={24} />,
    },
    {
      title: 'Comprehensive Resources',
      description:
        'Access a wide variety of materials including lessons, exercises, audio, and video content.',
      icon: <BookOpen size={24} />,
    },
    {
      title: 'Cultural Context',
      description:
        'Learn English within cultural contexts to understand idioms, expressions, and cultural nuances.',
      icon: <Globe size={24} />,
    },
  ];

  const sectionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, []);

  return (
    <section
      id="features"
      className="section-padding bg-neutral-50 dark:bg-gray-900"
    >
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-12 opacity-0" ref={sectionRef}>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 dark:bg-gray-700 dark:text-gray-300">
            Features
          </span>
          <h2 className="heading-2 mb-4">Everything you need to succeed</h2>
          <p className="subtitle mx-auto max-w-3xl dark:text-gray-400">
            Our platform offers a comprehensive set of tools and resources
            designed to make your English learning journey effective, engaging,
            and enjoyable.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresData.map((feature, index) => (
            <Feature
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
