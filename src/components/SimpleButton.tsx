interface SimpleButtonProps {
  children: React.ReactNode;
  type: 'button' | 'submit' | 'reset';
  onClick: () => void;
  to?: string;
  class_name?: string;
  bg_color?: string;
  text_color?: string;
  disabled?: boolean;
}

export default function SimpleButton({
  children,
  type,
  onClick,
  to,
  disabled = false,
  class_name,
  bg_color = 'bg-capx-secondary-purple hover:bg-capx-primary-green',
  text_color = 'text-[#F6F6F6] hover:text-capx-dark-bg',
}: SimpleButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={
        class_name
          ? class_name
          : 'flex w-fit h-fit tracking-wider text-sm px-4 sm:px-5 py-2 rounded-full ' +
            bg_color +
            ' ' +
            text_color
      }
      onClick={onClick}
      {...(to && { href: to })}
    >
      <div>{children}</div>
    </button>
  );
}
