
import { MasterItem } from './types';

export const MASTER_ITEMS: MasterItem[] = [
  // Staples
  { id: '1', name: 'Rice', tanglishName: 'Arisi', category: 'Staples', defaultUnit: 'kg', defaultPrice: 60 },
  { id: '2', name: 'Toor Dal', tanglishName: 'Thuvaram Paruppu', category: 'Staples', defaultUnit: 'kg', defaultPrice: 160 },
  { id: '3', name: 'Urad Dal', tanglishName: 'Ulundhu', category: 'Staples', defaultUnit: 'kg', defaultPrice: 140 },
  { id: '4', name: 'Moong Dal', tanglishName: 'Paasi Paruppu', category: 'Staples', defaultUnit: 'kg', defaultPrice: 120 },
  { id: '5', name: 'Sugar', tanglishName: 'Sarkarai', category: 'Staples', defaultUnit: 'kg', defaultPrice: 45 },
  { id: '6', name: 'Salt', tanglishName: 'Uppu', category: 'Staples', defaultUnit: 'packet', defaultPrice: 20 },
  { id: '7', name: 'Wheat Flour', tanglishName: 'Godhumai Maavu', category: 'Staples', defaultUnit: 'kg', defaultPrice: 55 },
  { id: '8', name: 'Oil (Sunflower)', tanglishName: 'Ennai', category: 'Staples', defaultUnit: 'litre', defaultPrice: 130 },
  { id: '9', name: 'Oil (Gingelly)', tanglishName: 'Nallennai', category: 'Staples', defaultUnit: 'litre', defaultPrice: 380 },
  { id: '10', name: 'Ghee', tanglishName: 'Nei', category: 'Staples', defaultUnit: 'packet', defaultPrice: 120 },

  // Spices & Condiments
  { id: '11', name: 'Tamarind', tanglishName: 'Puliyampoo', category: 'Spices', defaultUnit: 'kg', defaultPrice: 180 },
  { id: '12', name: 'Dry Chili', tanglishName: 'Varamilagai', category: 'Spices', defaultUnit: 'kg', defaultPrice: 250 },
  { id: '13', name: 'Mustard', tanglishName: 'Kadugu', category: 'Spices', defaultUnit: 'packet', defaultPrice: 25 },
  { id: '14', name: 'Cumin', tanglishName: 'Seeragam', category: 'Spices', defaultUnit: 'packet', defaultPrice: 50 },
  { id: '15', name: 'Turmeric Powder', tanglishName: 'Manjal Thool', category: 'Spices', defaultUnit: 'packet', defaultPrice: 30 },
  { id: '16', name: 'Chili Powder', tanglishName: 'Milagai Thool', category: 'Spices', defaultUnit: 'packet', defaultPrice: 45 },
  { id: '17', name: 'Pepper', tanglishName: 'Milagu', category: 'Spices', defaultUnit: 'packet', defaultPrice: 80 },
  { id: '18', name: 'Garlic', tanglishName: 'Poondu', category: 'Spices', defaultUnit: 'kg', defaultPrice: 200 },
  { id: '19', name: 'Ginger', tanglishName: 'Inji', category: 'Spices', defaultUnit: 'kg', defaultPrice: 120 },
  { id: '20', name: 'Asafoetida', tanglishName: 'Perungayam', category: 'Spices', defaultUnit: 'piece', defaultPrice: 50 },

  // Vegetables
  { id: '21', name: 'Onion', tanglishName: 'Vengayam', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 40 },
  { id: '22', name: 'Tomato', tanglishName: 'Thakkali', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 30 },
  { id: '23', name: 'Potato', tanglishName: 'Urulaikilangu', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 35 },
  { id: '24', name: 'Green Chili', tanglishName: 'Pachai Milagai', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 60 },
  { id: '25', name: 'Carrot', tanglishName: 'Carrot', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 70 },
  { id: '26', name: 'Beans', tanglishName: 'Beans', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 80 },
  { id: '27', name: 'Brinjal', tanglishName: 'Kathirikkai', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 50 },
  { id: '28', name: 'Drumstick', tanglishName: 'Murungakkai', category: 'Vegetables', defaultUnit: 'piece', defaultPrice: 10 },
  { id: '29', name: 'Cabbage', tanglishName: 'Muttaikose', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 40 },
  { id: '30', name: 'Lady Finger', tanglishName: 'Vendakkai', category: 'Vegetables', defaultUnit: 'kg', defaultPrice: 45 },

  // Dairy & Bakery
  { id: '31', name: 'Milk', tanglishName: 'Paal', category: 'Dairy', defaultUnit: 'packet', defaultPrice: 30 },
  { id: '32', name: 'Curd', tanglishName: 'Thayir', category: 'Dairy', defaultUnit: 'packet', defaultPrice: 25 },
  { id: '33', name: 'Bread', tanglishName: 'Bread', category: 'Bakery', defaultUnit: 'packet', defaultPrice: 45 },
  { id: '34', name: 'Egg', tanglishName: 'Muttai', category: 'Dairy', defaultUnit: 'piece', defaultPrice: 6 },
  { id: '35', name: 'Butter', tanglishName: 'Butter', category: 'Dairy', defaultUnit: 'packet', defaultPrice: 55 },

  // Cleaning
  { id: '36', name: 'Dish Soap', tanglishName: 'Pathiram Soap', category: 'Cleaning', defaultUnit: 'piece', defaultPrice: 15 },
  { id: '37', name: 'Washing Powder', tanglishName: 'Thuni Soap Thool', category: 'Cleaning', defaultUnit: 'packet', defaultPrice: 90 },
  { id: '38', name: 'Toilet Cleaner', tanglishName: 'Toilet Cleaner', category: 'Cleaning', defaultUnit: 'piece', defaultPrice: 85 },
  { id: '39', name: 'Floor Cleaner', tanglishName: 'Tharai Cleaner', category: 'Cleaning', defaultUnit: 'piece', defaultPrice: 70 },
  { id: '40', name: 'Broom', tanglishName: 'Thuvappam', category: 'Cleaning', defaultUnit: 'piece', defaultPrice: 60 },

  // Personal Care
  { id: '41', name: 'Bath Soap', tanglishName: 'Kuliya Soap', category: 'Care', defaultUnit: 'piece', defaultPrice: 40 },
  { id: '42', name: 'Shampoo', tanglishName: 'Shampoo', category: 'Care', defaultUnit: 'packet', defaultPrice: 2 },
  { id: '43', name: 'Toothpaste', tanglishName: 'Toothpaste', category: 'Care', defaultUnit: 'piece', defaultPrice: 60 },
  { id: '44', name: 'Hair Oil', tanglishName: 'Thalai Ennai', category: 'Care', defaultUnit: 'piece', defaultPrice: 50 },

  // Extra common items for elder-friendly variety
  { id: '45', name: 'Coconut', tanglishName: 'Thengai', category: 'Vegetables', defaultUnit: 'piece', defaultPrice: 25 },
  { id: '46', name: 'Lemon', tanglishName: 'Elumichai', category: 'Vegetables', defaultUnit: 'piece', defaultPrice: 5 },
  { id: '47', name: 'Curry Leaves', tanglishName: 'Kariveppilai', category: 'Vegetables', defaultUnit: 'bundle', defaultPrice: 5 },
  { id: '48', name: 'Coriander Leaves', tanglishName: 'Kothamalli', category: 'Vegetables', defaultUnit: 'bundle', defaultPrice: 10 },
  { id: '49', name: 'Mint Leaves', tanglishName: 'Pudhina', category: 'Vegetables', defaultUnit: 'bundle', defaultPrice: 10 },
  { id: '50', name: 'Tea Dust', tanglishName: 'Tea Thool', category: 'Staples', defaultUnit: 'packet', defaultPrice: 110 },
  { id: '51', name: 'Coffee Powder', tanglishName: 'Coffee Thool', category: 'Staples', defaultUnit: 'packet', defaultPrice: 150 },
  { id: '52', name: 'Biscuits', tanglishName: 'Biscuits', category: 'Snacks', defaultUnit: 'packet', defaultPrice: 20 },
  { id: '53', name: 'Peanuts', tanglishName: 'Verkadalai', category: 'Snacks', defaultUnit: 'kg', defaultPrice: 160 },
  { id: '54', name: 'Jaggery', tanglishName: 'Vellam', category: 'Staples', defaultUnit: 'kg', defaultPrice: 70 },
];
