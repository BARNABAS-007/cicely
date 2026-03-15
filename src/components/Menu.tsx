import { useState } from 'react';
import { menuData } from '../data/menuData';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState(0);

  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our extensive menu featuring dishes from Italian, Chinese, Continental, Korean, and Asian cuisines
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {menuData.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(index)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === index
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {menuData[selectedCategory].title}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {menuData[selectedCategory].items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-200 pb-4"
              >
                <span className="text-gray-800 font-medium">{item.name}</span>
                <span className="text-orange-600 font-semibold">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            All prices are in Indian Rupees (₹). Multiple prices indicate different portion sizes or variants.
          </p>
        </div>
      </div>
    </section>
  );
}
