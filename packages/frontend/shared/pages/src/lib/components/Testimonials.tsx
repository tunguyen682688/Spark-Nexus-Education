import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  index: number;
}

const Testimonial: React.FC<TestimonialProps> = ({ content, author, role, index }) => {
  const testimonialRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in');
            }, index * 150);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (testimonialRef.current) {
      observer.observe(testimonialRef.current);
    }
    
    return () => {
      if (testimonialRef.current) {
        observer.unobserve(testimonialRef.current);
      }
    };
  }, [index]);

  return (
    <div 
      ref={testimonialRef}
      className="p-6 rounded-xl bg-white shadow-soft border border-neutral-100 opacity-0 card-hover dark:bg-gray-800 dark:border-gray-700"
    >
      <div className="mb-4 text-4xl text-blue-400 font-serif">"</div>
      <p className="mb-6 text-foreground dark:text-gray-400">{content}</p>
      <div className="flex items-center">
        <div className="rounded-full bg-blue-100 h-12 w-12 flex items-center justify-center text-blue-600 font-semibold">
          {author.charAt(0)}
        </div>
        <div className="ml-4">
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground dark:text-gray-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const testimonialCategories = [
    { name: "Beginners", id: 0 },
    { name: "Intermediate", id: 1 },
    { name: "Advanced", id: 2 },
  ];
  
  const testimonialData = [
    // Beginners
    [
      {
        content: "As a complete beginner, I was intimidated by learning English. This platform made it approachable with bite-sized lessons and supportive community.",
        author: "Ming Wei",
        role: "Student, China",
      },
      {
        content: "The interactive exercises helped me build my confidence. Now I can have basic conversations after just 3 months of consistent practice.",
        author: "Sofia Rodriguez",
        role: "Chef, Spain",
      },
      {
        content: "I tried many apps before, but this one actually helped me remember vocabulary through context and spaced repetition.",
        author: "Akira Tanaka",
        role: "Software Developer, Japan",
      },
    ],
    // Intermediate
    [
      {
        content: "The platform's focus on real-world situations helped me break through the intermediate plateau. My conversational skills improved dramatically.",
        author: "Hans Mueller",
        role: "Business Analyst, Germany",
      },
      {
        content: "I love how the lessons incorporate current events and cultural topics. It's made learning more engaging and relevant to my daily life.",
        author: "Camille Dubois",
        role: "Marketing Manager, France",
      },
      {
        content: "The feedback on my pronunciation was invaluable. I finally overcame my accent issues that had been holding me back for years.",
        author: "Antonio Rossi",
        role: "Architect, Italy",
      },
    ],
    // Advanced
    [
      {
        content: "Even as an advanced learner, I found tremendous value in the nuanced lessons on idioms, cultural contexts, and professional English.",
        author: "Elena Petrova",
        role: "University Professor, Russia",
      },
      {
        content: "The writing workshops and detailed feedback helped me refine my skills to near-native level. I even published my first article in English!",
        author: "Paulo Mendes",
        role: "Journalist, Brazil",
      },
      {
        content: "The advanced business English section prepared me perfectly for international negotiations and presentations in my company.",
        author: "Fatima Al-Sayed",
        role: "Senior Executive, UAE",
      },
    ],
  ];
  
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
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="testimonials" className="section-padding dark:bg-gray-900">
      <div className="container-padding max-w-7xl mx-auto">
        <div className="text-center mb-12 opacity-0" ref={sectionRef}>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 dark:bg-gray-700 dark:text-gray-300">
            Success Stories
          </span>
          <h2 className="heading-2 mb-4">What our learners say</h2>
          <p className="subtitle mx-auto max-w-3xl dark:text-gray-400">
            Join thousands of satisfied learners who have transformed their English skills
            through our comprehensive self-study platform.
          </p>
        </div>
        
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {testimonialCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeTab === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-foreground hover:bg-neutral-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonialData[activeTab].map((testimonial, index) => (
            <Testimonial
              key={index}
              content={testimonial.content}
              author={testimonial.author}
              role={testimonial.role}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
