import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PersonalStatsCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  darkIconColor: string;
  darkIconBgColor: string;
}

const PersonalStatsCard: React.FC<PersonalStatsCardProps> = ({
  title,
  value,
  Icon,
  iconColor,
  iconBgColor,
  darkIconColor,
  darkIconBgColor,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`${iconBgColor} dark:${darkIconBgColor} p-3 rounded-lg`}>
          <Icon className={`${iconColor} dark:${darkIconColor}`} size={24} />
        </div>
      </div>
    </div>
  );
};

export default PersonalStatsCard; 