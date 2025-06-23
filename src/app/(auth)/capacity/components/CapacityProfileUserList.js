import CapacityProfileUserPreview from './CapacityProfileUserPreview';

export default function CapacityProfileUserList({ darkMode, title, data = undefined, userId }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold mb-4">{title}</h2>
      <div
        className={
          (darkMode ? 'bg-capx-dark-box-bg ' : 'bg-capx-light-box-bg ') +
          'grid grid-cols-3 sm:grid-cols-10 w-full p-4 rounded-lg'
        }
      >
        {data.map((userData, index) => {
          return userData.id !== userId ? (
            <CapacityProfileUserPreview key={index} darkMode={darkMode} userData={userData} />
          ) : null;
        })}
      </div>
    </div>
  );
}
