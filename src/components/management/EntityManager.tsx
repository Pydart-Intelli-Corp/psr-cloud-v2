'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import EntityForm from '@/components/forms/EntityForm';
import { FlowerSpinner } from '@/components';

interface Entity {
  id: number;
  name: string;
  dairy_id?: string;
  bmc_id?: string;
  society_id?: string;
  dairyId?: string;
  bmcId?: string;
  societyId?: string;
  location?: string;
  capacity?: number;
  contact_person?: string;
  president_name?: string;
}

interface EntityManagerProps {
  entityType: 'dairy' | 'bmc' | 'society';
  title: string;
  icon: React.ReactNode;
  apiEndpoint: string;
}

const entityConfigs = {
  dairy: {
    fields: [
      { name: 'name', label: 'Dairy Name', type: 'text' as const, required: true, placeholder: 'Enter dairy name' },
      { name: 'dairyId', label: 'Dairy ID', type: 'text' as const, required: true, placeholder: 'Enter unique dairy ID' },
      { name: 'password', label: 'Password', type: 'password' as const, required: true, placeholder: 'Enter secure password' },
      { name: 'location', label: 'Location', type: 'text' as const, placeholder: 'Enter location (optional)' },
      { name: 'contactPerson', label: 'Contact Person', type: 'text' as const, placeholder: 'Enter contact person name' },
      { name: 'phone', label: 'Phone', type: 'tel' as const, placeholder: 'Enter phone number' },
      { name: 'email', label: 'Email', type: 'email' as const, placeholder: 'Enter email address' }
    ]
  },
  bmc: {
    fields: [
      { name: 'name', label: 'BMC Name', type: 'text' as const, required: true, placeholder: 'Enter BMC name' },
      { name: 'bmcId', label: 'BMC ID', type: 'text' as const, required: true, placeholder: 'Enter unique BMC ID' },
      { name: 'password', label: 'Password', type: 'password' as const, required: true, placeholder: 'Enter secure password' },
      { name: 'location', label: 'Location', type: 'text' as const, placeholder: 'Enter location (optional)' },
      { name: 'capacity', label: 'Capacity (Liters)', type: 'number' as const, placeholder: 'Enter capacity in liters' },
      { name: 'dairyFarmId', label: 'Dairy Farm', type: 'select' as const, options: [] }
    ]
  },
  society: {
    fields: [
      { name: 'name', label: 'Society Name', type: 'text' as const, required: true, placeholder: 'Enter society name' },
      { name: 'societyId', label: 'Society ID', type: 'text' as const, required: true, placeholder: 'Enter unique society ID' },
      { name: 'password', label: 'Password', type: 'password' as const, required: true, placeholder: 'Enter secure password' },
      { name: 'location', label: 'Location', type: 'text' as const, placeholder: 'Enter location (optional)' },
      { name: 'presidentName', label: 'President Name', type: 'text' as const, placeholder: 'Enter president name' },
      { name: 'contactPhone', label: 'Contact Phone', type: 'tel' as const, placeholder: 'Enter contact phone' },
      { name: 'bmcId', label: 'BMC', type: 'select' as const, options: [] }
    ]
  }
};

export default function EntityManager({ entityType, title, icon, apiEndpoint }: EntityManagerProps) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [dairyFarms, setDairyFarms] = useState([]);
  const [bmcs, setBmcs] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      await fetchEntities();
      if (entityType === 'bmc') {
        await fetchDairyFarms();
      } else if (entityType === 'society') {
        await fetchBmcs();
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, apiEndpoint]);

  const fetchEntities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/${apiEndpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setEntities(result.data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${entityType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDairyFarms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/dairy', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setDairyFarms(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching dairy farms:', error);
    }
  };

  const fetchBmcs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/bmc', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setBmcs(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching BMCs:', error);
    }
  };

  const handleSubmit = async (formData: Record<string, string | number>) => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/user/${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        await fetchEntities();
        // Show success message
        alert(`${title} added successfully!`);
      } else {
        const error = await response.json();
        alert(error.error || `Failed to add ${entityType}`);
      }
    } catch (error) {
      console.error(`Error adding ${entityType}:`, error);
      alert(`Failed to add ${entityType}`);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare form fields with options
  const formConfig = { ...entityConfigs[entityType] };
  if (entityType === 'bmc') {
    const dairyField = formConfig.fields.find(f => f.name === 'dairyFarmId');
    if (dairyField) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dairyField as any).options = dairyFarms.map((dairy: Entity) => ({
        value: dairy.id,
        label: dairy.name
      }));
    }
  } else if (entityType === 'society') {
    const bmcField = formConfig.fields.find(f => f.name === 'bmcId');
    if (bmcField) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (bmcField as any).options = bmcs.map((bmc: Entity) => ({
        value: bmc.id,
        label: bmc.name
      }));
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
            {entities.length}
          </span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add {title}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl placeholder-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all duration-200"
          style={{ 
            color: '#111827',
            backgroundColor: '#ffffff',
            WebkitTextFillColor: '#111827'
          }}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FlowerSpinner size={32} />
        </div>
      ) : (
        <>
          {/* Entities Grid */}
          {filteredEntities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntities.map((entity) => (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 truncate">{entity.name}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-emerald-600 transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">ID:</span> {entity[`${entityType}_id`] || entity[`${entityType}Id`]}</p>
                    {entity.location && <p><span className="font-medium">Location:</span> {entity.location}</p>}
                    {entity.capacity && <p><span className="font-medium">Capacity:</span> {entity.capacity}L</p>}
                    {entity.contact_person && <p><span className="font-medium">Contact:</span> {entity.contact_person}</p>}
                    {entity.president_name && <p><span className="font-medium">President:</span> {entity.president_name}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">{icon}</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No {title}s Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No ${title.toLowerCase()}s match your search.` 
                  : `Start by adding your first ${title.toLowerCase()}.`
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Add {title}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <EntityForm
            title={`Add New ${title}`}
            fields={formConfig.fields}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            loading={formLoading}
            submitText={`Add ${title}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
}