import { Star, Quote } from 'lucide-react';
import { reviews } from '../data/reviews';

export default function Reviews() {
  return (
    <section className="py-20 bg-orange-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Read reviews from our satisfied customers who have experienced Cicely's exceptional dining
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 relative hover:shadow-xl transition-shadow"
            >
              <Quote className="absolute top-4 right-4 text-orange-200" size={40} />
              <div className="flex items-center mb-4">
                <div className="flex text-orange-500 mr-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">({review.rating}.0)</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "{review.text}"
              </p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{review.name}</p>
                <p className="text-gray-500 text-sm">{review.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://www.google.com/maps/search/?api=1&query=GJ2W+QP+Vijayawada"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-md font-medium transition-colors"
          >
            Read More Reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
}
