import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
  const handleCall = () => {
    window.location.href = 'tel:+919294942828';
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/919294942828', '_blank');
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Visit Us</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Come experience the best multi-cuisine dining in Vijayawada
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ground floor, Food Republic Lane<br />
                  40-3/1-43, near Fortune Murali Park<br />
                  Mogalrajapuram, Sidhartha Nagar<br />
                  Labbipet, Vijayawada<br />
                  Andhra Pradesh 520010, India
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Google Maps: GJ2W+QP Vijayawada
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Phone className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">+91 92949 42828</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Opening Hours</h3>
                <p className="text-gray-600">Open Daily until 10:30 PM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCall}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <Phone size={20} className="mr-2" />
                Call Now
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                <MessageCircle size={20} className="mr-2" />
                WhatsApp
              </button>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg h-96">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3825.5684!2d80.64655!3d16.50192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDMwJzA2LjkiTiA4MMKwMzgnNDcuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Cicely Restaurant Location"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
