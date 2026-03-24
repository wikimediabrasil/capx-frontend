'use client';

import { useState, useEffect } from 'react';
import MentorshipProgramCard from './components/MentorshipProgramCard';
import { MentorshipProgram, MentorshipStatus } from '@/types/mentorship';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import Banner from '@/components/Banner';
import MentorshipProgramsIcon from '@/public/static/images/mentorship_programs.svg';
import { mentorshipService } from '@/services/mentorshipService';
import { formBuilderJsonToMentorshipForm } from '@/utils/formBuilderToMentorshipForm';
import { useDarkMode, usePageContent } from '@/stores';

// Build programs from partner_mentorship_settings + mentor/mentee form APIs (both form APIs are used)
function buildProgramsFromSettings(
  settings: Awaited<ReturnType<typeof mentorshipService.getMentorshipSettings>>,
  mentorForms: Awaited<ReturnType<typeof mentorshipService.getMentorForms>>,
  menteeForms: Awaited<ReturnType<typeof mentorshipService.getMenteeForms>>
): MentorshipProgram[] {
  const now = new Date();
  return settings.map(setting => {
    const orgId = setting.organization;
    const mentorForm =
      setting.mentor_form != null ? mentorForms.find(f => f.id === setting.mentor_form) : undefined;
    const menteeForm =
      setting.mentee_form != null ? menteeForms.find(f => f.id === setting.mentee_form) : undefined;
    const forms: MentorshipProgram['forms'] = {};
    if (mentorForm?.json?.length) {
      const converted = formBuilderJsonToMentorshipForm(mentorForm.json, 'mentor');
      forms.mentor = { ...converted, formId: mentorForm.id, rawJson: mentorForm.json };
    }
    if (menteeForm?.json?.length) {
      const converted = formBuilderJsonToMentorshipForm(menteeForm.json, 'mentee');
      forms.mentee = { ...converted, formId: menteeForm.id, rawJson: menteeForm.json };
    }
    const mentorCount = mentorForm?.counter ?? 0;
    const menteeCount = menteeForm?.counter ?? 0;
    const subscribers = mentorCount + menteeCount;
    const displayName = setting.name?.trim() || `Partner ${orgId}`;
    const territoryNames = Array.isArray(setting.territory_names) ? setting.territory_names : [];
    const location = territoryNames.length > 0 ? territoryNames.join(', ') : 'Global';
    const rawProfileImage =
      (setting as { profile_image?: string | null }).profile_image ??
      (setting as { profileImage?: string | null }).profileImage ??
      (setting as { organization?: { profile_image?: string | null } }).organization?.profile_image;
    const profileImage =
      rawProfileImage != null && typeof rawProfileImage === 'string' ? rawProfileImage.trim() : '';
    const logo = profileImage !== '' ? profileImage : null;
    const description = setting.description?.trim() || `Mentorship program by ${displayName}.`;
    const capacities = Array.isArray(setting.skills) ? setting.skills : [];
    const languages = Array.isArray(setting.language_names) ? setting.language_names : [];

    const openDateRaw = setting.registration_open_date ?? null;
    const closeDateRaw = setting.registration_close_date ?? null;
    const openDateObj = openDateRaw ? new Date(openDateRaw) : null;
    const closeDateObj = closeDateRaw ? new Date(closeDateRaw) : null;

    let status: MentorshipStatus = 'open';
    if (openDateObj || closeDateObj) {
      if (openDateObj && now < openDateObj) {
        status = 'upcoming';
      } else if (closeDateObj && now > closeDateObj) {
        status = 'closed';
      } else {
        status = 'open';
      }
    }
    return {
      id: orgId,
      name: displayName,
      logo,
      location,
      openDate: openDateRaw,
      closeDate: closeDateRaw,
      status,
      description,
      format: 'online',
      capacities,
      languages,
      subscribers,
      forms: Object.keys(forms).length ? forms : undefined,
    };
  });
}

export default function MentorshipPage() {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const { showSnackbar } = useSnackbar();
  const [programs, setPrograms] = useState<MentorshipProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    Promise.all([
      mentorshipService.getMentorshipSettings(),
      mentorshipService.getMentorForms(),
      mentorshipService.getMenteeForms(),
    ])
      .then(([settings, mentorForms, menteeForms]) => {
        if (cancelled) return;
        const built = buildProgramsFromSettings(settings, mentorForms, menteeForms);
        setPrograms(built);
      })
      .catch(err => {
        if (cancelled) return;
        const message =
          err?.response?.data?.detail || err?.message || 'Failed to load mentorship programs';
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

  const handleSubscribe = (programId: number, role: 'mentor' | 'mentee') => {
    const program = programs.find(p => p.id === programId);
    showSnackbar(`Successfully subscribed to ${program?.name} as ${role}`, 'success');
    console.log('Subscribe:', { programId, role });
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
          {/* Programs Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div
                className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-[#851970]"
                data-testid="loading-spinner"
                aria-label="Loading"
              />
            </div>
          ) : loadError ? (
            <div className="text-center py-12 text-red-600">
              <p>{loadError}</p>
            </div>
          ) : programs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map(program => (
                <MentorshipProgramCard
                  key={program.id}
                  program={program}
                  onSubscribe={handleSubscribe}
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
