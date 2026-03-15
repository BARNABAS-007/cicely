import { Facebook, Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-orange-400">Cicely</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              A Global Culinary Experience in Vijayawada. Premium multi-cuisine restaurant serving Italian, Asian, and Continental dishes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-orange-400 transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('menu')} className="hover:text-orange-400 transition-colors">
                  Menu
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('reservation')} className="hover:text-orange-400 transition-colors">
                  Reservations
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-orange-400 transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Dine-in</li>
              <li>Takeaway</li>
              <li>No-contact Delivery</li>
              <li>Private Events</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-600 p-2 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-600 p-2 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-orange-600 p-2 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:info@cicely.com"
                className="bg-gray-800 hover:bg-orange-600 p-2 rounded-full transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <p className="text-gray-400 text-sm">
              <strong>Phone:</strong> +91 92949 42828
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Open Daily until 10:30 PM
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Cicely Restaurant. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Best Restaurant in Vijayawada | Multi Cuisine Restaurant
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
