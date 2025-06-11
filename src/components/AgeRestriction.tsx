import { Users } from 'lucide-react';
import React from 'react';

interface AgeRestrictionProps {
  minAge: number | null | undefined;
}

const getAgeRestrictionText = (minAge: number | null | undefined): string => {
  if (minAge === null || minAge === undefined) return 'Age requirement unknown';
  switch (minAge) {
    case 0:
      return 'All Ages';
    case 18:
      return '18+';
    case 21:
      return '21+';
    default:
      return `${minAge}+`;
  }
};

export const AgeRestriction: React.FC<AgeRestrictionProps> = ({ minAge }) => (
  <div className="flex items-center text-sm text-gray-500">
    <Users className="mr-2 h-4 w-4" />
    {getAgeRestrictionText(minAge)}
  </div>
);

