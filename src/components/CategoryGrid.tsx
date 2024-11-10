import React from 'react';
import { Product, Category } from '../types';
import { ProductCard } from './ProductCard';

interface CategoryGridProps {
  products: Product[];
  category: Category;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ products, category }) => {
  const filteredProducts = products.filter(
    (product) => product.category === category
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products available in {category}.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};