
import React from 'react';
import type { Role } from '../types';

interface RoleSelectorProps {
  roles: Role[];
  selectedRole: Role | null;
  onSelect: (role: Role) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ roles, selectedRole, onSelect }) => {
  return (
    <section>
      <h2 className="text-2xl font-bold mb-2">1. 직무 선택</h2>
      <p className="text-slate-500 mb-6">가장 잘 맞는 직무 하나를 선택해주세요.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {roles.map((role) => {
          const isSelected = selectedRole?.id === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role)}
              aria-pressed={isSelected}
              className={`p-5 border-2 rounded-xl text-left cursor-pointer transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-indigo-400'
                }`}
            >
              <div className="flex items-center mb-2">
                <Icon className={`w-7 h-7 mr-3 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                <h3 className="font-bold text-lg text-slate-800">{role.name}</h3>
              </div>
              <p className="text-sm text-slate-500">{role.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default RoleSelector;
