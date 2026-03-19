import { useState } from 'react';
import { menuData } from '../../data/menuData';
import { Plus, Trash2, CreditCard as Edit2, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number | string;
  category: string;
}

export default function MenuTab() {
  const [items, setItems] = useState<MenuItem[]>(
    menuData.flatMap((cat) =>
      cat.items.map((item) => ({
        ...item,
        description: item.description || '',
        category: cat.category,
      }))
    )
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const categories = Array.from(new Set(items.map((item) => item.category)));

  const handleAddClick = () => {
    setFormData({
      id: Math.random().toString(),
      name: '',
      description: '',
      price: '',
      category: categories[0] || '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData) return;

    if (editingId) {
      setItems(items.map((item) => (item.id === editingId ? formData : item)));
    } else {
      setItems([...items, formData]);
    }

    setShowForm(false);
    setFormData(null);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Menu Management</h2>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {showForm && formData && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Item' : 'Add New Item'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 h-24"
            />
            <input
              type="text"
              placeholder="Price (e.g., ₹159 or ₹299 / ₹349)"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Save
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-orange-500 mb-4 capitalize">
              {category}
            </h3>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-orange-400 font-semibold">
                            {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1 text-blue-400 hover:bg-blue-900/20 rounded transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-red-400 hover:bg-red-900/20 rounded transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-blue-200 text-sm">
          Note: Menu changes here are for demonstration. To persist menu changes to the database,
          a backend integration would be needed.
        </p>
      </div>
    </div>
  );
}
