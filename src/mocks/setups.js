export const mockSetups = [
  { date: '2025-09-28', title: 'Breakfast', wells: [
    { temp: 'Hot', pan: 'Full Shallow', food: 'Donut Burger', utensil: 'Tongs' },
    { temp: 'Cold', pan: 'Full Deep', food: 'Pears', utensil: 'Tongs' },
    { temp: 'Hot', pan: 'Narrow Metal', food: 'Scrambled Eggs', utensil: 'Spoodle' },
  ], shotgun: 'Extra fruit, condiments' },
  { date: '2025-09-29', title: 'Lunch', wells: [
    { temp: 'Cold', pan: 'Full Deep', food: 'Lettuce Wraps', utensil: 'Tongs' },
    { temp: 'Hot', pan: 'Top Shallow', food: 'Ground Beef', utensil: 'Spoodle' },
  ], shotgun: 'Salsa, Sour Cream, Jalapeños' },
  { date: '2025-09-30', title: 'Breakfast', wells: [
    { temp: 'Hot', pan: 'Full Shallow', food: 'Waffles', utensil: 'Tongs' },
    { temp: 'Hot', pan: 'Narrow Metal', food: 'Sausage Links', utensil: 'Tongs' },
    { temp: 'Cold', pan: 'Bottom Deep', food: 'Peaches', utensil: 'Scoop' },
  ], shotgun: 'Syrup, Butter, Whipped Cream' },
];

export const panTypes = ['Full Shallow', 'Full Deep', 'Narrow Metal', 'Narrow Plastic', 'Top Shallow', 'Top Deep', 'Bottom Shallow', 'Bottom Deep'];
export const utensils = ['Spoodle', 'Tongs', 'Ladle', 'Scoop'];