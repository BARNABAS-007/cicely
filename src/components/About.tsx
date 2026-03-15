import { Star } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-20 bg-cream-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Restaurant interior"
              className="rounded-lg shadow-xl w-full h-auto"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Welcome to Cicely
            </h2>
            <div className="flex items-center mb-4">
              <div className="flex text-orange-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <span className="ml-2 text-gray-600 font-medium">4.4 (1000+ reviews)</span>
            </div>
            <p className="text-gray-700 text-lg mb-4 leading-relaxed">
              Cicely is a premium multi-cuisine restaurant in the heart of Vijayawada,
              known for serving exceptional Italian, Asian, and Continental dishes in a
              cozy and elegant atmosphere.
            </p>
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Whether you're looking for a romantic dinner, a family gathering, or a
              casual meal with friends, Cicely offers the perfect ambience paired with
              world-class flavors that will delight your taste buds.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-3xl font-bold text-orange-600">5+</p>
                <p className="text-gray-600 text-sm">Cuisines</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-3xl font-bold text-orange-600">100+</p>
                <p className="text-gray-600 text-sm">Dishes</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-3xl font-bold text-orange-600">1000+</p>
                <p className="text-gray-600 text-sm">Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
