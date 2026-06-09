import { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetElement = ctaRef.current;
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

    if (targetElement) {
      observer.observe(targetElement);
    }

    return () => {
      if (targetElement) {
        observer.unobserve(targetElement);
      }
    };
  }, []);

  const benefits = [
    'Personalized learning path',
    'Progress tracking & analytics',
    'Native speaker pronunciation guides',
    'Supportive community',
    'Regular updates & new content',
    'Access on all devices',
  ];

  return (
    <section
      id="get-started"
      className="section-padding bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container-padding max-w-7xl mx-auto">
        <div
          ref={ctaRef}
          className="rounded-2xl overflow-hidden shadow-medium bg-white border border-neutral-100 opacity-0 dark:bg-gray-800 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="heading-2 mb-4">Ready to improve your English?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg dark:text-gray-400">
                Start your self-study journey today and join thousands of
                learners who are achieving their language goals with our proven
                methods.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to={ROUTES.PLANS} className="btn-primary">
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-12 flex items-center justify-center dark:from-gray-800 dark:to-gray-900">
              <div className="bg-white/10 backdrop-blur-xs p-6 md:p-8 rounded-xl border border-white/20 text-white max-w-md dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-2xl font-semibold mb-6">
                  Choose your plan
                </h3>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Monthly</h4>
                      <span className="text-xl font-bold">$12.99</span>
                    </div>
                    <p className="text-sm text-white/80 dark:text-gray-400">
                      Full access to all features. Cancel anytime.
                    </p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-5 border border-white/10 relative hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="absolute -top-3 right-4 bg-blue-400 text-xs px-3 py-1 rounded-full text-white font-bold">
                      BEST VALUE
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Annual</h4>
                      <div className="text-right">
                        <span className="text-xl font-bold">$7.99</span>
                        <span className="text-xs block text-white/80">
                          per month
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-white/80 dark:text-gray-400">
                      Save 38% with annual billing. All features included.
                    </p>
                  </div>
                </div>

                <div className="mt-6 text-sm text-white/70">
                  No credit card required to start your 7-day free trial.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
