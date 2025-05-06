import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type ChecklistProps = {
  title: string;
  other: string;
  placeholder?: string;
  description?: string;
  initialItems?: string[];
  showOther?: boolean;
};

export default function Checklist({
  title,
  other,
  placeholder,
  description,
  initialItems = [],
  showOther = false,
}: ChecklistProps) {
  const [items, setItems] = useState(
    initialItems.map((item) => ({ label: item, checked: false }))
  );
    const [otherText, setOtherText] = useState("");
    const { darkMode } = useTheme();


  const toggleCheck = (index: number) => {
    const newItems = [...items];
    newItems[index].checked = !newItems[index].checked;
    setItems(newItems);
  };

  return (
    <div className={`w-full px-4 sm:px-6 md:px-1 rounded-md py-6 space-y-4 ${
        darkMode
            ? "bg-[#04222F]"
            : "bg-[#EFEFEF]"
        }`}>
        <h2 className={`text-[12px] font-[Montserrat] font-bold text-start text-[#04222F] md:text-[24px] ${
            darkMode
            ? "text-[#FFFFFF]"
            : "text-[#053749]"
        }`}>
            {title}
        </h2>

      {description && (
        <p className={`text-[10px] md:text-[18px] text-start font-[Montserrat] ${
            darkMode
                ? "text-[#829BA4]"
                : "text-[#053749]"
        }`}>
            {description}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center border-b font-[Montserrat] border-gray-100 pb-2"
          >
            <label htmlFor={`check-${index}`} className={` ${
                darkMode
                ? "text-[#FFFFFF]"
                : "text-[#829BA4]"
            }`}>
              {item.label}
            </label>
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleCheck(index)}
              id={`check-${index}`}
              className="w-5 h-5 text-[#02AE8C] border-md border-[#829BA4] rounded-md focus:ring-2 focus:ring-[#829BA4] cursor-pointer"
            />
          </li>
        ))}

        {showOther && (
          <li className="pt-4">
            <h2 className={`text-[12px] font-[Montserrat] font-bold text-start md:text-[18px] ${
                darkMode
                ? "text-[#FFFFFF]"
                : "text-[#829BA4]"
            }`}>
                {other}
            </h2>
            <input
              type="text"
              id="other"
              className={`w-full border-b-2 font-[Montserrat] border-[#829BA4] focus:border-[#04222F] outline-none py-1 px-0 bg-transparent ${
                darkMode
                ? "focus:border-[#829BA4] text-[#FFFFFF]"
                : "focus:border-[#04222F] text-[#04222F]"
              }`}
              placeholder={placeholder}
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
            />
          </li>
        )}
      </ul>
    </div>
  );
}
