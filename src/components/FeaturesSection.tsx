import illustration01 from '@/public/static/images/learn_capacities_illustration.svg';
import illustration02 from '@/public/static/images/connect_wikimedians_illustration.svg';
import illustration03 from '@/public/static/images/exchange_knowledge_illustration.svg';
import Image, { StaticImageData } from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

const Row = (illustration: StaticImageData, description: string, index: number, total: number) => {
  const getBorderClass = () => {
    if (index === 0) return 'border-t border-b';
    if (index === total - 1) return 'border-t border-b';
    return '';
  };

  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  return (
    <div
      className={`flex flex-row w-full border-solid ${getBorderClass()} ${
        darkMode ? 'border-capx-light-bg' : 'border-capx-secondary-purple'
      } `}
    >
      <div className="flex flex-row items-center justify-between lg:justify-evenly  w-full mx-4 md:mx-8 lg:mx-16 xl:mx-32 2xl:mx-64 3xl:mx-96 4xl:mx-128 ">
        <div className="max-w-screen-xl shrink-0 w-[150px] md:w-[200px] h-[150px] md:h-[200px] lg:w-[300px] lg:h-[300px] flex items-center justify-center py-8 md:py-12">
          <div className="relative w-full h-full">
            <Image
              src={illustration}
              alt={pageContent['alt-illustration']?.replace('{description}', description) || description || 'Feature illustration'}
              className="object-contain"
              fill
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-start">
          <p
            className={`font-[Montserrat] text-[20px] md:text-[36px] not-italic font-extrabold leading-[normal] ${
              darkMode ? 'text-capx-dark-text' : 'text-capx-light-text'
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FeaturesSection() {
  const { pageContent } = useApp();
  const features = [
    {
      illustration: illustration01,
      description: pageContent['body-home-feature-section-capacity'],
    },
    {
      illustration: illustration02,
      description: pageContent['body-home-feature-section-connect'],
    },
    {
      illustration: illustration03,
      description: pageContent['body-home-feature-section-knowledge'],
    },
  ];
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex flex-col w-full mx-auto ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
      }`}
    >
      {features.map((feature, index) => (
        <div key={`feature-${index}`}>
          {Row(feature.illustration, feature.description, index, features.length)}
        </div>
      ))}
    </div>
  );
}