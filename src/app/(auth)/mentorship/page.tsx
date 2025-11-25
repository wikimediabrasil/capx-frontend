'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';
import MentorshipProgramCard from './components/MentorshipProgramCard';
import { MentorshipProgram } from '@/types/mentorship';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import Banner from '@/components/Banner';
import MentorshipProgramsIcon from '@/public/static/images/mentorship_programs.svg';

// Mock data with dynamic forms
const mockPrograms: MentorshipProgram[] = [
  {
    id: 1,
    name: 'Africa Wiki Women',
    logo: null,
    location: 'Global',
    status: 'open',
    description:
      'An initiative to increase the presence of African women on Wikipedia and within the Wikimedia movement. It offers mentorship, training, and support to create content about African women and in driving their female leadership in open knowledge.',
    format: 'in-person',
    capacities: ['mentorship', 'budgeting'],
    languages: ['english', 'portuguese'],
    subscribers: 34,
    forms: {
      mentor: {
        role: 'mentor',
        fields: [
          {
            id: 'complete_name',
            label: 'Complete Name',
            type: 'text',
            required: true,
            placeholder: 'Your full name',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'your@email.com',
          },
          {
            id: 'phone',
            label: 'Phone number (optional)',
            type: 'tel',
            required: false,
            placeholder: '(55) 21 9999-9999',
          },
          {
            id: 'wikimedia_username',
            label: 'Wikimedia Username',
            type: 'text',
            required: true,
            placeholder: 'Your wiki username',
          },
          {
            id: 'years_experience',
            label: 'Years of experience in Wikimedia projects',
            type: 'select',
            required: true,
            placeholder: 'Select experience...',
            options: [
              { label: 'Less than 1 year', value: '0-1' },
              { label: '1-3 years', value: '1-3' },
              { label: '3-5 years', value: '3-5' },
              { label: '5-10 years', value: '5-10' },
              { label: 'More than 10 years', value: '10+' },
            ],
          },
          {
            id: 'areas_expertise',
            label: 'Areas of expertise',
            type: 'textarea',
            required: true,
            placeholder:
              'E.g.: Wikipedia article writing, Wikidata queries, Commons photography, community management, technical tools, event organization...',
          },
          {
            id: 'what_can_teach',
            label: 'What can you teach?',
            type: 'textarea',
            required: true,
            placeholder: "Describe what skills, knowledge or experience you can share with mentees. Include specific topics, tools, or methodologies you're comfortable teaching.",
          },
          {
            id: 'availability_start',
            label: 'Availability for mentoring (start time)',
            type: 'time',
            required: true,
            hint: 'When are you typically available to mentor? You can add more time slots later.',
          },
          {
            id: 'availability_end',
            label: 'Availability for mentoring (end time)',
            type: 'time',
            required: true,
          },
          {
            id: 'mentees_capacity',
            label: 'How many mentees can you support?',
            type: 'select',
            required: true,
            placeholder: 'Select capacity...',
            options: [
              { label: '1 mentee', value: 1 },
              { label: '2-3 mentees', value: 2 },
              { label: '4-5 mentees', value: 4 },
              { label: '6-10 mentees', value: 6 },
              { label: 'More than 10 mentees', value: 10 },
            ],
          },
          {
            id: 'previous_experience',
            label: 'Previous mentoring experience',
            type: 'textarea',
            required: false,
            placeholder:
              'Have you mentored others before? In Wikimedia projects or elsewhere? Tell about your experience guiding and teaching others.',
          },
          {
            id: 'languages',
            label: 'Languages you mentor in',
            type: 'text',
            required: true,
            placeholder: 'E.g.: Portuguese, English, Spanish...',
          },
          {
            id: 'capacities',
            label: 'Capacities',
            type: 'multiselect',
            required: true,
            placeholder: 'Choose the capacities you can mentor in mentorships.',
            options: [
              { label: 'Communication', value: 'communication' },
              { label: 'Mentorship', value: 'mentorship' },
              { label: 'Budgeting', value: 'budgeting' },
              { label: 'Outreach', value: 'outreach' },
              { label: 'Community Building', value: 'community-building' },
            ],
            hint: 'Choose the capacities you can mentor in mentorships.',
          },
        ],
        submitButtonLabel: 'Apply as Mentor',
      },
      mentee: {
        role: 'mentee',
        fields: [
          {
            id: 'complete_name',
            label: 'Complete Name',
            type: 'text',
            required: true,
            placeholder: 'Your full name',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'your@email.com',
          },
          {
            id: 'wikimedia_username',
            label: 'Wikimedia Username',
            type: 'text',
            required: true,
            placeholder: 'Your wiki username',
          },
          {
            id: 'experience_level',
            label: 'Experience Level',
            type: 'select',
            required: true,
            placeholder: 'Select your level...',
            options: [
              { label: 'Beginner', value: 'beginner' },
              { label: 'Intermediate', value: 'intermediate' },
              { label: 'Advanced', value: 'advanced' },
            ],
          },
          {
            id: 'support_needed',
            label: 'What kind of support do you need?',
            type: 'textarea',
            required: true,
            placeholder:
              'I need guidance on editing and creating articles about African women on Wikipedia, finding reliable sources, understanding Wikipedia policies, and learning outreach project management skills.',
            hint: 'Tell us how this mentorship/training can best support your goals.',
          },
          {
            id: 'availability_start',
            label: 'Schedule availability (start time)',
            type: 'time',
            required: true,
            hint: 'Please indicate the days and times you are usually available for mentorship sessions.',
          },
          {
            id: 'availability_end',
            label: 'Schedule availability (end time)',
            type: 'time',
            required: true,
          },
          {
            id: 'goals',
            label: 'Your goals for this mentorship',
            type: 'textarea',
            required: true,
            placeholder: 'Tell us what you hope to achieve through this mentorship program...',
          },
        ],
        submitButtonLabel: 'Apply as Mentee',
      },
    },
  },
  {
    id: 2,
    name: 'Wikipedia & Education User Group',
    logo: null,
    location: 'Global',
    status: 'closed',
    description:
      'A global group that connects Wikipedia with formal education. It supports teachers, students, and institutions in integrating Wikipedia into educational projects, promoting open learning and collaborative knowledge production.',
    format: 'online',
    capacities: ['autography', 'budgeting'],
    languages: ['english', 'portuguese'],
    subscribers: 34,
    forms: {
      mentor: {
        role: 'mentor',
        fields: [
          {
            id: 'complete_name',
            label: 'Complete Name',
            type: 'text',
            required: true,
            placeholder: 'Your full name',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'your@email.com',
          },
          {
            id: 'years_experience',
            label: 'Years of experience in Wiki',
            type: 'select',
            required: true,
            placeholder: 'Select experience...',
            options: [
              { label: 'Less than 1 year', value: '0-1' },
              { label: '1-3 years', value: '1-3' },
              { label: '3-5 years', value: '3-5' },
              { label: '5-10 years', value: '5-10' },
              { label: 'More than 10 years', value: '10+' },
            ],
          },
          {
            id: 'mentees_capacity',
            label: 'How many mentees can you support?',
            type: 'select',
            required: true,
            placeholder: 'Select capacity...',
            options: [
              { label: '1 mentee', value: 1 },
              { label: '2-3 mentees', value: 2 },
              { label: '4-5 mentees', value: 4 },
              { label: '6-10 mentees', value: 6 },
            ],
          },
          {
            id: 'availability_start',
            label: 'Schedule availability (start time)',
            type: 'time',
            required: true,
            hint: 'Please indicate the days and times you are usually available for mentorship sessions.',
          },
          {
            id: 'availability_end',
            label: 'Schedule availability (end time)',
            type: 'time',
            required: true,
          },
          {
            id: 'capacities',
            label: 'Capacities',
            type: 'multiselect',
            required: true,
            placeholder: 'Choose the capacities you can mentor in mentorships.',
            options: [
              { label: 'Communication', value: 'communication' },
              { label: 'Autography', value: 'autography' },
              { label: 'Budgeting', value: 'budgeting' },
            ],
            hint: 'Choose the capacities you can mentor in mentorships.',
          },
        ],
        submitButtonLabel: 'Subscribe',
      },
      mentee: {
        role: 'mentee',
        fields: [
          {
            id: 'complete_name',
            label: 'Complete Name',
            type: 'text',
            required: true,
            placeholder: 'Your full name',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            required: true,
            placeholder: 'your@email.com',
          },
          {
            id: 'availability_start',
            label: 'Schedule availability (start time)',
            type: 'time',
            required: true,
            hint: 'Please indicate the days and times you are usually available for mentorship sessions.',
          },
          {
            id: 'availability_end',
            label: 'Schedule availability (end time)',
            type: 'time',
            required: true,
          },
        ],
        submitButtonLabel: 'Subscribe',
      },
    },
  },
  {
    id: 3,
    name: 'Latin America & Caribbean Mentorship',
    logo: null,
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
    logo: null,
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
    showSnackbar(`Learn more about ${program?.name}`, 'success');
    console.log('Learn more:', programId);
  };

  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      {/* Banner Section */}
      <Banner
        image={MentorshipProgramsIcon}
        title={pageContent['mentorship-programs'] || 'Mentorship Programs'}
        alt={pageContent['mentorship-programs-alt'] || 'Mentorship Programs'}
      />

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
    </section>
  );
}

