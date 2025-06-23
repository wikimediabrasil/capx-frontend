import Link from 'next/link';
import CapacityProfileNoUser from './CapacityProfileNoUser';
import CapacityProfileUserList from './CapacityProfileUserList';
import { capitalizeFirstLetter } from '@/lib/utils/stringUtils';

interface CapacityProfileViewProps {
  darkMode: boolean;
  selectedCapacityData: any;
  pageContent: any;
  userId: string;
}

export default function CapacityProfileView({
  darkMode,
  selectedCapacityData,
  pageContent,
  userId,
}: CapacityProfileViewProps) {
  if (selectedCapacityData === undefined) {
    return (
      <div className="w-full space-y-20 pt-10">
        <div className="space-y-6">
          <div
            className={
              (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
              'w-2/6 h-10 rounded-lg animate-pulse'
            }
          ></div>
          <div
            className={
              (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
              'w-full px-8 py-4 rounded-lg animate-pulse'
            }
          >
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'w-2/6 h-8 rounded-lg animate-pulse'
              }
            ></div>
          </div>
        </div>
        <div className="space-y-14">
          <div className="space-y-4">
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'w-2/6 h-8 rounded-lg animate-pulse'
              }
            ></div>
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'grid grid-cols-10 w-full min-h-40 p-8 rounded-lg animate-pulse'
              }
            ></div>
          </div>
          <div className="space-y-4">
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'w-2/6 h-8 rounded-lg animate-pulse'
              }
            ></div>
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'grid grid-cols-10 w-full min-h-40 p-8 rounded-lg animate-pulse'
              }
            ></div>
          </div>
          <div className="space-y-4">
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'w-2/6 h-8 rounded-lg animate-pulse'
              }
            ></div>
            <div
              className={
                (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
                'grid grid-cols-10 w-full min-h-40 p-8 rounded-lg animate-pulse'
              }
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-20 pt-10">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-4xl font-extrabold leading-tight">
            {capitalizeFirstLetter(selectedCapacityData.name)} [
            <a
              href={`https://www.wikidata.org/wiki/${selectedCapacityData.wd_code}`}
              target="_blank"
              className="text-capx-primary-green underline"
            >
              {selectedCapacityData.wd_code}
            </a>
            ]
          </h1>
          <Link className="my-auto" href={'/capacity'}>
            <div className="rounded-full p-2">
              <svg
                className={
                  'w-6 h-6 ' + (darkMode ? 'text-capx-primary-yellow' : 'text-capx-primary-red')
                }
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18 17.94 6M18 18 6.06 6"
                />
              </svg>
            </div>
          </Link>
        </div>
        {selectedCapacityData.description ? (
          <div
            className={
              (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
              'w-full px-8 py-4 rounded-lg'
            }
          >
            <p className="text-xl sm:text-base">{selectedCapacityData.description}</p>
          </div>
        ) : null}
      </div>
      <div className="space-y-14">
        {selectedCapacityData.users.wanted?.length > 0 ? (
          // If there is only one person and it is the user himself
          selectedCapacityData.users.wanted.length === 1 &&
          selectedCapacityData.users.wanted[0].id === userId ? (
            <CapacityProfileNoUser
              darkMode={darkMode}
              title={pageContent['body-capacity-wanted-user-list-title']}
              noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
            />
          ) : (
            <CapacityProfileUserList
              darkMode={darkMode}
              title={pageContent['body-capacity-wanted-user-list-title']}
              data={selectedCapacityData.users.wanted}
              userId={userId}
            />
          )
        ) : (
          <CapacityProfileNoUser
            darkMode={darkMode}
            title={pageContent['body-capacity-wanted-user-list-title']}
            noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
          />
        )}
        {selectedCapacityData.users.known?.length > 0 ? (
          // If there is only one person and it is the user himself
          selectedCapacityData.users.known.length === 1 &&
          selectedCapacityData.users.known[0].id === userId ? (
            <CapacityProfileNoUser
              darkMode={darkMode}
              title={pageContent['body-capacity-known-user-list-title']}
              noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
            />
          ) : (
            <CapacityProfileUserList
              darkMode={darkMode}
              title={pageContent['body-capacity-known-user-list-title']}
              data={selectedCapacityData.users.known}
              userId={userId}
            />
          )
        ) : (
          <CapacityProfileNoUser
            darkMode={darkMode}
            title={pageContent['body-capacity-known-user-list-title']}
            noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
          />
        )}
        {selectedCapacityData.users.available?.length > 0 ? (
          // If there is only one person and it is the user himself
          selectedCapacityData.users.available.length === 1 &&
          selectedCapacityData.users.available[0].id === userId ? (
            <CapacityProfileNoUser
              darkMode={darkMode}
              title={pageContent['body-capacity-available-user-list-title']}
              noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
            />
          ) : (
            <CapacityProfileUserList
              darkMode={darkMode}
              title={pageContent['body-capacity-available-user-list-title']}
              data={selectedCapacityData.users.available}
              userId={userId}
            />
          )
        ) : (
          <CapacityProfileNoUser
            darkMode={darkMode}
            title={pageContent['body-capacity-available-user-list-title']}
            noUserMessage={pageContent['body-capacity-user-list-fallback-message']}
          />
        )}
      </div>
    </div>
  );
}
