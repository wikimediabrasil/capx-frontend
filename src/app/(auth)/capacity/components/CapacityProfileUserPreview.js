import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CapacityProfileUserPreview({ darkMode, userData }) {
  const [data, setData] = useState(undefined);

  useEffect(() => {
    setData(userData);
  }, [userData]);

  if (data === undefined) {
    return (
      <div className="w-full h-full rounded-full p-4 space-y-2 animate-pulse">
        <Image
          width={64}
          height={64}
          src="https://upload.wikimedia.org/wikipedia/commons/c/cd/CapX-icon.svg"
          className="rounded-full"
          alt="CapX logo"
        />
        <div className="space-y-0.5">
          <div
            className={
              (darkMode ? 'bg-capx-dark-bg ' : 'bg-capx-light-bg ') +
              'w-full h-4 rounded-lg animate-pulse'
            }
          ></div>
          <div
            className={
              (darkMode ? 'bg-capx-dark-bg ' : 'bg-capx-light-bg ') +
              'w-full h-4 rounded-lg animate-pulse'
            }
          ></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 space-y-2">
      <Link href={'/profile/' + data.id}>
        <Image
          width={64}
          height={64}
          src={
            data.profile_image
              ? data.profile_image
              : 'https://upload.wikimedia.org/wikipedia/commons/c/cd/CapX-icon.svg'
          }
          className={
            (darkMode ? 'hover:border-capx-light-bg ' : 'hover:border-capx-dark-bg ') +
            'rounded-full border-2 cursor-pointer hover:border-dotted'
          }
          alt="CapX logo"
        />
      </Link>
      <p className="text-xs text-center">{data.username}</p>
    </div>
  );
}
