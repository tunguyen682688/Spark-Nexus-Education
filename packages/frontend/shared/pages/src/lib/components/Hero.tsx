import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subheadingRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const heading = headingRef.current;
    const subheading = subheadingRef.current;
    const cta = ctaRef.current;
    const image = imageRef.current;

    if (heading) heading.classList.add("animate-slide-down");
    if (subheading) {
      setTimeout(() => {
        subheading.classList.add("animate-slide-down");
      }, 200);
    }
    if (cta) {
      setTimeout(() => {
        cta.classList.add("animate-fade-in");
      }, 400);
    }
    if (image) {
      setTimeout(() => {
        image.classList.add("animate-scale-in");
      }, 300);
    }
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden dark:bg-gray-800">
      {/* Background decoration */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent dark:from-gray-900"
        aria-hidden="true"
      ></div>
      <div
        className="absolute inset-0 bg-dots opacity-25 dark:opacity-50"
        aria-hidden="true"
      ></div>

      <div className="container-padding max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero content */}
          <div className="flex flex-col space-y-8">
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium opacity-0 animate-slide-down dark:bg-gray-700 dark:text-gray-300">
              The smart way to master English
            </span>
            <h1
              ref={headingRef}
              className="heading-1 opacity-0 dark:text-white"
            >
              Master English{" "}
              <span className="text-blue-600 dark:text-blue-400">
                at your own pace
              </span>
            </h1>
            <p
              ref={subheadingRef}
              className="text-xl text-muted-foreground leading-relaxed opacity-0 dark:text-gray-400"
            >
              A personalized learning experience that adapts to your needs,
              schedule, and goals. Learn English effectively through daily
              practice and smart techniques.
            </p>
            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-4 opacity-0"
            >
              <a
                href="#get-started"
                className="btn-primary dark:bg-blue-700 dark:text-white"
              >
                Start learning now
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
              <a
                href="#methods"
                className="btn-outline dark:border-gray-600 dark:text-gray-300"
              >
                Explore methods
              </a>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6 opacity-0 animate-fade-in animate-delay-500">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  5M+
                </span>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  Learners
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  200+
                </span>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  Lessons
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  96%
                </span>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  Success rate
                </span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div ref={imageRef} className="relative opacity-0">
            <div className="relative mx-auto lg:ml-auto w-full max-w-lg">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur-xl opacity-30 animate-pulse-soft dark:from-gray-700 dark:to-gray-900"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-hard">
                <div className="aspect-video bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center dark:from-gray-800 dark:to-gray-900">
                  <div className="relative h-full w-full bg-neutral-50 rounded-lg m-4 glass shadow-inner-soft overflow-hidden dark:bg-gray-800">
                    <div className="absolute top-0 left-0 right-0 h-10 bg-neutral-100 flex items-center px-4 dark:bg-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-gray-600"></div>
                        <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-gray-600"></div>
                        <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-gray-600"></div>
                      </div>
                    </div>
                    <div className="pt-12 px-4 pb-4">
                      <div className="h-12 w-3/4 bg-blue-100 rounded-md mb-3 dark:bg-gray-700"></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-24 bg-neutral-100 rounded-md dark:bg-gray-700"></div>
                        <div className="h-24 bg-neutral-100 rounded-md dark:bg-gray-700"></div>
                        <div className="h-24 bg-neutral-100 rounded-md dark:bg-gray-700"></div>
                        <div className="h-24 bg-neutral-100 rounded-md dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
