export default function LoadingSection({ darkMode, message }) {
  return (
    <section
      className={
        (darkMode ? 'bg-capx-dark-bg ' : 'bg-capx-light-bg ') +
        'w-full h-screen place-content-center text-center'
      }
    >
      <div className="space-y-4">
        <div
          className={
            (darkMode
              ? 'border-l-white border-r-white border-b-white border-t-capx-primary-green '
              : 'border-l-capx-light-box-bg border-r-capx-light-box-bg border-b-capx-light-box-bg border-t-capx-secondary-purple ') +
            'animate-spin ease-linear h-10 w-10 rounded-full border-8 mx-auto'
          }
        ></div>
        {message ? (
          <h2 className={(darkMode ? 'text-capx-light-bg ' : 'text-capx-dark-bg ') + 'text-sm'}>
            LOADING {message}, PLEASE WAIT
          </h2>
        ) : null}
      </div>
    </section>
  );
}
