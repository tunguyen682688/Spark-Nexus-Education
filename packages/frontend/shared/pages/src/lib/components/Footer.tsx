import { Mail, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: "Platform",
      links: [
        { name: "Features", href: "#features" },
        { name: "Methods", href: "#methods" },
        { name: "Pricing", href: "#get-started" },
        { name: "Testimonials", href: "#testimonials" },
        { name: "FAQ", href: "#faq" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", href: "#" },
        { name: "Learning Guides", href: "#" },
        { name: "Community", href: "#" },
        { name: "Grammar Library", href: "#" },
        { name: "Vocabulary Lists", href: "#" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "Contact", href: "#" },
      ]
    }
  ];

  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="container-padding max-w-7xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and info */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center space-x-1 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-semibold text-white">E</span>
              </span>
              <span className="text-lg font-semibold">EnglishSelf</span>
            </a>
            <p className="text-muted-foreground mb-4 max-w-md">
              A comprehensive platform for self-study English learners, providing 
              effective tools and resources to achieve language fluency.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/EnglishSelf"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/EnglishSelf"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://github.com/EnglishSelf"
                className="text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={20} />
              </a>
              <a
                href="mailto:hello@englishself.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((column, i) => (
            <div key={i}>
              <h3 className="font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a 
                      href={link.href} 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0 dark:text-gray-400">
            © {currentYear} EnglishSelf. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors dark:text-gray-400 dark:hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors dark:text-gray-400 dark:hover:text-white">
              Terms of Service
            </a>
            <a href="/cookie-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors dark:text-gray-400 dark:hover:text-white">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
