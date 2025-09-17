
import React from 'react';
import type { AgencySize, Location, SelectOption } from '../types';

// --- Icon components defined locally to avoid creating new files ---
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.023.994-2.13.994-3.292m-5.144 4.818a1.5 1.5 0 01-2.06-1.873 1.5 1.5 0 011.873-2.06m6.035 4.935a1.5 1.5 0 01-2.06-1.873 1.5 1.5 0 011.873-2.06m-1.873 2.06a1.5 1.5 0 01-1.873-2.06 1.5 1.5 0 012.06 1.873m-1.873 2.06a1.5 1.5 0 01-2.06-1.873 1.5 1.5 0 011.873-2.06M9 13.5a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 6.75zM9 12.75h6.375a.375.375 0 01.375.375v1.5a.375.375 0 01-.375.375H9a.375.375 0 01-.375-.375v-1.5A.375.375 0 019 12.75z" />
    </svg>
);

const CityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m6.75 4.5V21H16.5" />
    </svg>
);

const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.916 17.916 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
);


interface CompanyInfoSelectorProps {
  sizes: SelectOption<AgencySize>[];
  locations: SelectOption<Location>[];
  selectedSize: AgencySize;
  selectedLocation: Location;
  onSelectSize: (size: AgencySize) => void;
  onSelectLocation: (location: Location) => void;
}

const InfoCard: React.FC<{
  label: string;
  isSelected: boolean;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ label, isSelected, description, icon, onClick }) => {
    
    const baseClasses = "relative w-full text-center p-6 border rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400";
    const selectedClasses = "border-indigo-600 bg-indigo-50 shadow-md";
    const unselectedClasses = "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm hover:-translate-y-1";

    return (
      <button
        onClick={onClick}
        aria-pressed={isSelected}
        className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      >
        {isSelected && (
           <CheckCircleIcon className="absolute top-2 right-2 w-6 h-6 text-indigo-600" aria-label="Selected" />
        )}
        <div className={`mx-auto ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
            {icon}
        </div>
        <h4 className={`font-bold mt-2 text-lg ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>{label}</h4>
        {description && <p className={`text-sm mt-1 ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>{description}</p>}
      </button>
    );
};


export const CompanyInfoSelector: React.FC<CompanyInfoSelectorProps> = ({ 
  sizes, 
  locations,
  selectedSize,
  selectedLocation,
  onSelectSize,
  onSelectLocation
}) => {
    
    const sizeIcons: Record<AgencySize, React.FC<React.SVGProps<SVGSVGElement>>> = {
        small: UserIcon,
        medium: UsersIcon,
        large: BuildingIcon,
    };
    
    const locationIcons: Record<Location, React.FC<React.SVGProps<SVGSVGElement>>> = {
        seoul: CityIcon,
        other: GlobeIcon,
    };

    return (
        <section>
            <h2 className="text-2xl font-bold mb-6">3. 회사 정보 선택</h2>
            <div className="space-y-10">
                <fieldset>
                    <legend className="text-lg font-bold text-slate-800 mb-4">예상 회사 규모</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {sizes.map(size => {
                            const Icon = sizeIcons[size.id];
                            return (
                                <InfoCard
                                    key={size.id}
                                    icon={<Icon className="w-8 h-8" />}
                                    label={size.name}
                                    description={size.description}
                                    isSelected={selectedSize === size.id}
                                    onClick={() => onSelectSize(size.id)}
                                />
                            );
                        })}
                    </div>
                </fieldset>
                <fieldset>
                    <legend className="text-lg font-bold text-slate-800 mb-4">예상 근무 지역</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {locations.map(loc => {
                            const Icon = locationIcons[loc.id];
                            return (
                                <InfoCard
                                    key={loc.id}
                                    icon={<Icon className="w-8 h-8" />}
                                    label={loc.name}
                                    description={loc.description}
                                    isSelected={selectedLocation === loc.id}
                                    onClick={() => onSelectLocation(loc.id)}
                                />
                            );
                        })}
                    </div>
                </fieldset>
            </div>
        </section>
    );
};
