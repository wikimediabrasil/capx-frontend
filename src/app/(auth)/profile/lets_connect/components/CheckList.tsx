import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

type ChecklistProps = {
  title: string;
  other: string;
  placeholder?: string;
  description?: string;
  itemsList?: string[];
  showOther?: boolean;
  multiple?: boolean;
  setFormData: (item: string | string[]) => void;
};

export default function Checklist({
  title,
  other,
  placeholder,
  description,
  itemsList = [],
  multiple = false,
  showOther = false,
  setFormData,
}: ChecklistProps) {
  const [items, setItems] = useState(
    itemsList.map((item) => ({ label: item, checked: false }))
  );
  const [otherText, setOtherText] = useState("");
  const { darkMode } = useTheme();

  const toggleCheck = (index: number) => {
    let newItems;
  
    if (!multiple) {
      newItems = items.map((item, i) => ({
        ...item,
        checked: i === index ? !item.checked : false,
      }));
  
      // If the checkbox is checked and there is text in the 'other' field, clear the text
      const isChecked = newItems[index].checked;
  
      // If the checkbox is checked and there is text in the 'other' field, clear the text
      if (isChecked && otherText.trim()) {
        setOtherText(""); // Clear the text in the 'other' field
      }
  
      // Update the formData correctly
      const selected = newItems.find((item) => item.checked);
      setFormData(selected ? selected.label : "");
    } else {
      newItems = [...items];
      newItems[index].checked = !newItems[index].checked;
    }
  
    setItems(newItems);
  
    // In multiple mode, keep the existing logic for the selected items
    if (multiple) {
      const selectedItems = newItems
        .filter((item) => item.checked)
        .map((item) => item.label);
  
      const combined = otherText.trim()
        ? [...selectedItems, otherText.trim()]
        : selectedItems;
  
      setFormData(combined);
    }
  };
  
  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOtherText(value);
  
    if (multiple) {
      const selectedItems = items
        .filter((item) => item.checked)
        .map((item) => item.label);
  
      const combined = value.trim()
        ? [...selectedItems, value.trim()]
        : selectedItems;
  
      setFormData(combined);
    } else {
      // If you are typing, unmark all checkboxes
      if (value.trim()) {
        const clearedItems = items.map((item) => ({ ...item, checked: false }));
        setItems(clearedItems);
      }
      setFormData(value.trim());
    }
  };

  return (
    <div className={`w-full sm:px-6 md:px-1 rounded-md py-6 space-y-4 ${
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
                : "text-[#829BA4]"
        }`}>
            {description}
        </p>
      )}

      <ul className="space-y-3">
        {items?.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center text-[12px] border-b font-[Montserrat] border-gray-100 pb-2 md:text-[18px]"
          >
            <label htmlFor={`check-${index}`} className={` ${
                darkMode
                ? "text-[#FFFFFF]"
                : "text-[#053749]"
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
                : "text-[#053749]"
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
              onChange={handleOtherTextChange}
            />
          </li>
        )}
      </ul>
    </div>
  );
}
