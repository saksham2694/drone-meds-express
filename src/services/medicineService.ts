
import { Medicine } from '@/types';

// Mock medicines data (will be replaced with Supabase data)
const medicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    description: 'Pain reliever and fever reducer',
    price: 5.99,
    imageUrl: '/medicines/paracetamol.jpg',
    category: 'Pain Relief',
  },
  {
    id: '2',
    name: 'Ibuprofen',
    description: 'Anti-inflammatory pain relief',
    price: 6.99,
    imageUrl: '/medicines/ibuprofen.jpg',
    category: 'Pain Relief',
  },
  {
    id: '3',
    name: 'Cetirizine',
    description: 'Antihistamine for allergy relief',
    price: 8.49,
    imageUrl: '/medicines/cetirizine.jpg',
    category: 'Allergy',
  },
  {
    id: '4',
    name: 'Amoxicillin',
    description: 'Antibiotic for bacterial infections',
    price: 12.99,
    imageUrl: '/medicines/amoxicillin.jpg',
    category: 'Antibiotics',
  },
  {
    id: '5',
    name: 'Omeprazole',
    description: 'Reduces stomach acid production',
    price: 9.99,
    imageUrl: '/medicines/omeprazole.jpg',
    category: 'Digestive Health',
  },
  {
    id: '6',
    name: 'Loratadine',
    description: 'Non-drowsy allergy relief',
    price: 7.49,
    imageUrl: '/medicines/loratadine.jpg',
    category: 'Allergy',
  },
  {
    id: '7',
    name: 'Aspirin',
    description: 'Pain reliever, anti-inflammatory',
    price: 4.99,
    imageUrl: '/medicines/aspirin.jpg',
    category: 'Pain Relief',
  },
  {
    id: '8',
    name: 'Vitamin D3',
    description: 'Supports bone and immune health',
    price: 11.99,
    imageUrl: '/medicines/vitamind.jpg',
    category: 'Vitamins',
  }
];

// Get all medicines
export const getAllMedicines = async (): Promise<Medicine[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return medicines;
};

// Get medicine by ID
export const getMedicineById = async (id: string): Promise<Medicine | undefined> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return medicines.find(medicine => medicine.id === id);
};

// Get medicines by category
export const getMedicinesByCategory = async (category: string): Promise<Medicine[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return medicines.filter(medicine => medicine.category === category);
};

// Get all categories
export const getAllCategories = async (): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return Array.from(new Set(medicines.map(medicine => medicine.category)));
};
