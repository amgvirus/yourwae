import React from 'react';
import { Link } from 'react-router-dom';

const CategoryChip = ({ icon, label, category }) => {
  return (
    <Link className="category-chip" to={`/stores?cat=${category}`}>
      <span className="chip-icon">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default CategoryChip;
