'use client';

import { useState, useEffect, useMemo } from 'react';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';
import MentorshipProgramCard from './components/MentorshipProgramCard';
import { MentorshipProgram } from '@/types/mentorship';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import Banner from '@/components/Banner';
import MentorshipProgramsIcon from '@/public/static/images/mentorship_programs.svg';
import { mentorshipService } from '@/services/mentorshipService';
import { formBuilderJsonToMentorshipForm } from '@/utils/formBuilderToMentorshipForm';

import { useDarkMode, usePageContent } from '@/stores';

function buildProgramsFromApi(
  partners: Awaited<ReturnType<typeof mentorshipService.getPartners>>,
  mentorForms: Awaited<ReturnType<typeof mentorshipService.getMentorForms>>,
  menteeForms: Awaited<ReturnType<typeof mentorshipService.getMenteeForms>>
): MentorshipProgram[] {
  const withMentorship = partners.filter(p => p.mentorship);
  return withMentorship.map(partner => {
    const orgId = partner.id;
    const mentorForm = mentorForms.find(f => f.organization === orgId);
    const menteeForm = menteeForms.find(f => f.organization === orgId);
    const forms: MentorshipProgram['forms'] = {};
    if (mentorForm?.json?.length) {
      const converted = formBuilderJsonToMentorshipForm(mentorForm.json, 'mentor');
      forms.mentor = { ...converted, formId: mentorForm.id };
    }
    if (menteeForm?.json?.length) {
      const converted = formBuilderJsonToMentorshipForm(menteeForm.json, 'mentee');
      forms.mentee = { ...converted, formId: menteeForm.id };
    }
    const mentorCount = mentorForm?.counter ?? 0;
    const menteeCount = menteeForm?.counter ?? 0;
    const subscribers = mentorCount + menteeCount;
    const displayName = partner.name || `Partner ${orgId}`;
    return {
      id: orgId,
      name: displayName,
      logo: partner.profile_image || null,
      location: partner.territory_names?.length ? partner.territory_names.join(', ') : 'Global',
      status: 'open',
      description: partner.description?.trim() || `Mentorship program by ${displayName}.`,
      format: 'online',
      capacities: partner.capacities || [],
      languages: [],
      subscribers,
      forms: Object.keys(forms).length ? forms : undefined,
    };
  });
}

export default function MentorshipPage() {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const { showSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      mentorshipService.getPartners(),
      mentorshipService.getMentorForms(),
      mentorshipService.getMenteeForms(),
    ])
      .then(([partners, mentorForms, menteeForms]) => {
        if (cancelled) return;
        // #region agent log
        fetch('http://127.0.0.1:7342/ingest/11168b70-41f9-46b5-ac84-2020f4caa4bc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '6d77d0' },
          body: JSON.stringify({
            sessionId: '6d77d0',
            location: 'mentorship/page.tsx:fetch.then',
            message: 'Partners and forms loaded',
            data: {
              partnersLength: Array.isArray(partners) ? partners.length : 'not-array',
              firstPartner: Array.isArray(partners) && partners[0] ? { id: partners[0].id, name: (partners[0] as { name?: string }).name, description: (partners[0] as { description?: string }).description, territory_names: (partners[0] as { territory_names?: string[] }).territory_names, capacities: (partners[0] as { capacities?: string[] }).capacities, mentorship: (partners[0] as { mentorship?: boolean }).mentorship } : null,
              mentorFormsLength: Array.isArray(mentorForms) ? mentorForms.length : 0,
              menteeFormsLength: Array.isArray(menteeForms) ? menteeForms.length : 0,
              firstMentorFormOrg: Array.isArray(mentorForms) && mentorForms[0] ? (mentorForms[0] as { organization?: number }).organization : null,
            },
            timestamp: Date.now(),
            hypothesisId: 'H1-H5',
          }),
        }).catch(() => {});
        // #endregion
        const built = buildProgramsFromApi(partners, mentorForms, menteeForms);
        // #region agent log
        fetch('http://127.0.0.1:7342/ingest/11168b70-41f9-46b5-ac84-2020f4caa4bc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '6d77d0' },
          body: JSON.stringify({
            sessionId: '6d77d0',
            location: 'mentorship/page.tsx:buildProgramsFromApi',
            message: 'Programs built',
            data: { programsLength: built.length, firstProgram: built[0] ? { id: built[0].id, name: built[0].name, description: built[0].description, location: built[0].location, capacitiesLength: built[0].capacities?.length } : null },
            timestamp: Date.now(),
            hypothesisId: 'H4-H5',
          }),
        }).catch(() => {});
        // #endregion
        setPrograms(built);
      })
      .catch(err => {
        if (cancelled) return;
        const message = err?.response?.data?.detail || err?.message || 'Failed to load mentorship programs';
        setLoadError(message);
        setPrograms([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPrograms = useMemo(
    () =>
      programs.filter(
        program =>
          program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (program.description && program.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (program.location && program.location.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [programs, searchTerm]
  );

  const handleSubscribe = (programId: number, role: 'mentor' | 'mentee') => {
    const program = programs.find(p => p.id === programId);
    showSnackbar(`Successfully subscribed to ${program?.name} as ${role}`, 'success');
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
      <div className={`w-full py-8 md:py-12 ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'}`}>
        <div className="container mx-auto px-4 max-w-screen-xl">
          {/* Search Bar */}
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onFilterClick={() => setShowFilters(!showFilters)}
            searchPlaceholder={pageContent['search-by-mentorships'] || 'Search by mentorships'}
            filterAriaLabel={
              pageContent['filter-mentorship-programs'] || 'Filter mentorship programs'
            }
          />

          {/* Programs Grid */}
          {loading ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>Loading mentorship programs...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-12 text-red-600">
              <p>{loadError}</p>
            </div>
          ) : filteredPrograms.length > 0 ? (
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
            <div className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>{pageContent['no-mentorship-programs-found'] || 'No mentorship programs found'}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
