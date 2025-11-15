'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';
import MentorshipProgramCard from './components/MentorshipProgramCard';
import { MentorshipProgram } from '@/types/mentorship';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

// Mock data
const mockPrograms: MentorshipProgram[] = [
  {
    id: 1,
    name: 'Africa Wiki Women',
    logo: null, // Placeholder - will show initial letter
    location: 'Global',
    status: 'open',
    description:
      'An initiative to increase the presence of African women on Wikipedia. We offer mentorship, training, and support to help women contribute to Wikipedia and other Wikimedia projects.',
    format: 'in-person',
    capacities: ['datagraphic', 'budgeting'],
    languages: ['english', 'portuguese'],
    subscribers: 24,
  },
  {
    id: 2,
    name: 'Wikipedia & Education User Group',
    logo: null, // Placeholder - will show initial letter
    location: 'Global',
    status: 'closed',
    description:
      'A user group that aims to connect Wikipedia with formal education. We support teachers and students in using Wikipedia as a learning tool and contributing to knowledge.',
    format: 'online',
    capacities: ['datagraphic', 'budgeting'],
    languages: ['english', 'portuguese'],
    subscribers: 15,
  },
  {
    id: 3,
    name: 'Latin America & Caribbean Mentorship',
    logo: null, // Placeholder - will show initial letter
    location: 'Latin America & Caribbean (LAC)',
    status: 'open',
    description:
      'A regional mentorship program focused on supporting Wikimedia contributors in Latin America and the Caribbean. We provide guidance and resources for new and experienced editors.',
    format: 'hybrid',
    capacities: ['editing', 'outreach'],
    languages: ['spanish', 'portuguese', 'english'],
    subscribers: 42,
  },
  {
    id: 4,
    name: 'EMENA Mentorship Network',
    logo: null, // Placeholder - will show initial letter
    location: 'Europe, Middle East and North Africa (EMENA)',
    status: 'open',
    description:
      'Connecting mentors and mentees across Europe, the Middle East, and North Africa. Our program supports diverse Wikimedia communities and helps build local capacity.',
    format: 'online',
    capacities: ['translation', 'community-building'],
    languages: ['english', 'arabic', 'french'],
    subscribers: 38,
  },
];

export default function MentorshipPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { showSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [programs] = useState<MentorshipProgram[]>(mockPrograms);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubscribe = (programId: number, role: 'mentor' | 'mentee') => {
    const program = programs.find(p => p.id === programId);
    showSnackbar(
      `Successfully subscribed to ${program?.name} as ${role}`,
      'success'
    );
    console.log('Subscribe:', { programId, role });
  };

  const handleLearnMore = (programId: number) => {
    const program = programs.find(p => p.id === programId);
    showSnackbar(`Learn more about ${program?.name}`, 'info');
    console.log('Learn more:', programId);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <div
        className={`w-full py-12 md:py-16 ${
          darkMode ? 'bg-[#053749]' : 'bg-[#053749]'
        }`}
      >
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative w-16 h-16 md:w-24 md:h-24 mb-4">
              {/* Placeholder for smartphone icon with W */}
              <div
                className={`w-full h-full rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-gray-700' : 'bg-white'
                }`}
              >
                <span className="text-2xl md:text-4xl font-bold text-[#053749]">
                  W
                </span>
              </div>
            </div>
            <h1
              className={`text-2xl md:text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-white'
              }`}
            >
              {pageContent['mentorship-programs'] || 'Mentorship Programs'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`w-full py-8 md:py-12 ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
        }`}
      >
        <div className="container mx-auto px-4 max-w-screen-xl">
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onFilterClick={() => setShowFilters(!showFilters)}
            searchPlaceholder={
              pageContent['search-by-mentorships'] || 'Search by mentorships'
            }
            filterAriaLabel={
              pageContent['filter-mentorship-programs'] ||
              'Filter mentorship programs'
            }
          />

          {/* Programs Grid */}
          {filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map(program => (
                <MentorshipProgramCard
                  key={program.id}
                  program={program}
                  onSubscribe={handleSubscribe}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              <p>
                {pageContent['no-mentorship-programs-found'] ||
                  'No mentorship programs found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

