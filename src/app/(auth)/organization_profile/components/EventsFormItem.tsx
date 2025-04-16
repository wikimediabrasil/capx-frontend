"use client";

import { useTheme } from "@/contexts/ThemeContext";
import ImagesModeIcon from "@/public/static/images/images_mode.svg";
import AddLinkIcon from "@/public/static/images/add_link.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import Image from "next/image";
import { Event } from "@/types/event";
import { useApp } from "@/contexts/AppContext";
import BaseSelect from "@/components/BaseSelect";
import { useState, useEffect, useMemo } from 'react';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { Capacity } from '@/types/capacity';
import BaseButton from '@/components/BaseButton';
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";


interface EventFormItemProps {
  eventData: Event;
  index: number;
  onDelete: (id: number) => void;
  onChange: (index: number, field: keyof Event, value: string) => void;
}

const DateSelector = ({ length }: { length: number }) => {
  const { darkMode } = useTheme();
  return (
    <select
      className={`w-full bg-transparent mx-2 border border-2 rounded-md p-2 
    appearance-none 
    bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%23${
      darkMode ? "fff" : "053749"
    }%22%2F%3E%3C%2Fsvg%3E')] 
    bg-no-repeat 
    bg-[length:32px] 
    bg-[position:right_10px_center]
    pr-12
    ${
      darkMode ? "border-white text-white" : "border-[#053749] text-[#053749]"
    }`}
    >
      {Array.from({ length: length }, (_, i) => (
        <option key={i} value={i}>
          {i.toString().padStart(2, "0")}
        </option>
      ))}
    </select>
  );
};

const validateImageUrl = (url: string) => {
  if (!url) return url;

  try {
    url = url.replace(/^@/, "");

    const urlObj = new URL(url);

    if (
      urlObj.hostname === "commons.wikimedia.org" &&
      url.includes("/wiki/File:")
    ) {
      return url;
    } else if (
      urlObj.hostname === "upload.wikimedia.org" &&
      url.includes("/wikipedia/commons/")
    ) {
      return url;
    }
    return "";
  } catch {
    return "";
  }
};

export default function EventsFormItem({
  eventData,
  index,
  onDelete,
  onChange,
}: EventFormItemProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);
  
  // Renderizar os componentes de forma consistente, independente das condições
  const [showMobile, setShowMobile] = useState(false);
  
  // Usar useMemo para processar os dados apenas quando necessário
  const parsedRelatedSkills = useMemo(() => {
    if (!eventData.related_skills) return [];
    
    try {
      if (typeof eventData.related_skills === 'string') {
        return JSON.parse(eventData.related_skills);
      }
      return Array.isArray(eventData.related_skills) ? eventData.related_skills : [];
    } catch (error) {
      console.error("Erro ao analisar related_skills:", error);
      return [];
    }
  }, [eventData.related_skills]);

  // Efeito para atualizar o estado de exibição baseado no tamanho da tela
  useEffect(() => {
    setShowMobile(isMobile);
  }, [isMobile]);

  // Efeito para inicializar capacidades selecionadas
  useEffect(() => {
    // Inicializar capacidades selecionadas se eventData.related_skills existir
    if (parsedRelatedSkills.length > 0) {
      // Lógica para mapear IDs para objetos de capacidade
      // Como não temos acesso à função getCapacityById, isso seria feito em uma implementação real
    }
  }, [parsedRelatedSkills]);

  const handleCapacitySelect = (capacity: Capacity) => {
    if (!selectedCapacities.find(cap => cap.code === capacity.code)) {
      const newCapacities = [...selectedCapacities, capacity];
      setSelectedCapacities(newCapacities);
      
      // Update related_skills in event
      const skillIds = newCapacities.map(cap => cap.code);
      onChange(index, "related_skills", JSON.stringify(skillIds));
    }
    
    setIsModalOpen(false);
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    const newCapacities = selectedCapacities.filter(cap => cap.code !== capacityCode);
    setSelectedCapacities(newCapacities);
    
    // Update related_skills in event
    const skillIds = newCapacities.map(cap => cap.code);
    onChange(index, "related_skills", JSON.stringify(skillIds));
  };

  const handleChange = (field: keyof Event, value: string) => {
    onChange(index, field, value);
  };

  // Renderizar o componente de delete (sempre disponível)
  const DeleteButton = () => (
    <button onClick={() => onDelete(eventData.id || 0)}>
      <div className="relative w-[24px] h-[24px]">
        <Image
          src={darkMode ? CancelIconWhite : CancelIcon}
          alt="Delete icon"
          className="object-contain"
          width={24}
          height={24}
        />
      </div>
    </button>
  );

  // Separar o componente mobile
  const MobileView = () => (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row gap-2 w-full items-center text-[12px] md:text-[24px] text-[16px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={pageContent["organization-profile-event-name"]}
            value={eventData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#053749] placeholder-[#829BA4]"
            }`}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
            <div className="relative w-[24px] h-[24px]">
              <Image
                src={ImagesModeIcon}
                alt="Project image icon"
                width={24}
                height={24}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
          </div>
        </div>
      </div>
      <DeleteButton />
    </div>
  );

  // Separar o componente desktop
  const DesktopView = () => (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <h2
          className={`text-[24px] font-Montserrat font-bold py-2 ${
            darkMode ? "text-white" : "text-[#053749]"
          }`}
        >
          {pageContent["organization-profile-event-url-title"]}
        </h2>
        <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={
              pageContent["organization-profile-event-url-placeholder"]
            }
            className={`w-full bg-transparent border-none outline-none ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#829BA4] placeholder-[#829BA4]"
            }`}
            value={eventData.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
          />
        </div>
        <p
          className={`text-[20px] ${
            darkMode ? "text-white" : "text-[#829BA4]"
          }`}
        >
          {pageContent["organization-profile-event-url-tooltip"]}
        </p>
      </div>
      <DeleteButton />
    </div>
  );

  // Condicional usando variável de estado em vez de verificar isMobile diretamente
  return showMobile ? <MobileView /> : <DesktopView />;
}
