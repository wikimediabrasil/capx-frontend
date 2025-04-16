import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect, useMemo } from "react";
import { Event } from "@/types/event";
import { Capacity } from "@/types/capacity";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import DeleteIcon from "@/public/static/images/delete.svg";
import BaseButton from "@/components/BaseButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatISO } from "date-fns";
import CapacityChip from "./CapacityChip";
import { CapacitySelectionModal } from "@/components/CapacitySelectionModal";

interface EventsFormItemProps {
  eventData: Event;
  index: number;
  onDelete: (index: number) => void;
  onChange: (index: number, field: keyof Event, value: string) => void;
  capacities?: Capacity[];
}

export default function EventsFormItem({
  eventData,
  index,
  onDelete,
  onChange,
  capacities = [],
}: EventsFormItemProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  
  // Estados para os campos do formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Obter as capacidades selecionadas
  const selectedCapacities = useMemo(() => {
    if (!eventData.related_skills || !Array.isArray(eventData.related_skills) || !capacities) {
      return [];
    }
    
    return capacities.filter(cap => 
      eventData.related_skills.includes(cap.code)
    );
  }, [eventData.related_skills, capacities]);
  
  // Manipuladores de eventos
  const handleDateChange = (field: 'time_begin' | 'time_end', date: Date | null) => {
    if (date) {
      onChange(index, field, formatISO(date));
    }
  };
  
  const handleCapacitySelect = (capacity: Capacity) => {
    // Verificar se a capacidade já está selecionada
    const currentSkills = Array.isArray(eventData.related_skills) 
      ? [...eventData.related_skills] 
      : [];
    
    if (!currentSkills.includes(capacity.code)) {
      const updatedSkills = [...currentSkills, capacity.code];
      onChange(index, 'related_skills', JSON.stringify(updatedSkills));
    }
    
    setIsModalOpen(false);
  };
  
  const handleRemoveCapacity = (capacityCode: number | string) => {
    const currentSkills = Array.isArray(eventData.related_skills) 
      ? [...eventData.related_skills] 
      : [];
    
    const updatedSkills = currentSkills.filter(code => code !== capacityCode);
    onChange(index, 'related_skills', JSON.stringify(updatedSkills));
  };

  // Função para renderizar o DatePicker
  const renderDatePicker = (field: 'time_begin' | 'time_end', label: string) => {
    const date = eventData[field] ? new Date(eventData[field]) : null;
    
    return (
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          {label}
        </label>
        <DatePicker
          selected={date}
          onChange={(date) => handleDateChange(field, date)}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="yyyy-MM-dd HH:mm"
          className={`w-full p-2 rounded-md border ${
            darkMode 
              ? 'bg-capx-dark-box-bg text-white border-gray-700' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
          placeholderText={`Selecione a data e hora de ${field === 'time_begin' ? 'início' : 'fim'}`}
        />
      </div>
    );
  };

  return (
    <div className={`p-4 mb-4 rounded-lg ${
      darkMode ? 'bg-capx-dark-box-bg text-white' : 'bg-white text-gray-700 border border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {pageContent["organization-profile-event-name"] || "Nome do evento"}
          </label>
          <input
            type="text"
            value={eventData.name || ''}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            className={`w-full p-2 rounded-md border ${
              darkMode 
                ? 'bg-capx-dark-box-bg text-white border-gray-700' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
            placeholder="Digite o nome do evento"
          />
        </div>
        {onDelete && (
          <BaseButton
            onClick={() => onDelete(index)}
            customClass="ml-2 p-2 rounded-md hover:bg-red-100"
            imageUrl={DeleteIcon}
            imageAlt="Excluir"
            imageWidth={24}
            imageHeight={24}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {pageContent["organization-profile-event-description"] || "Descrição"}
          </label>
          <textarea
            value={eventData.description || ''}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            className={`w-full p-2 rounded-md border ${
              darkMode 
                ? 'bg-capx-dark-box-bg text-white border-gray-700' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
            rows={4}
            placeholder="Descreva o evento"
          />

          <div className="mt-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              {pageContent["organization-profile-event-url"] || "URL"}
            </label>
            <input
              type="url"
              value={eventData.url || ''}
              onChange={(e) => onChange(index, 'url', e.target.value)}
              className={`w-full p-2 rounded-md border ${
                darkMode 
                  ? 'bg-capx-dark-box-bg text-white border-gray-700' 
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
              placeholder="https://"
            />
          </div>
        </div>

        <div>
          {renderDatePicker('time_begin', pageContent["organization-profile-event-start-date"] || "Data de início")}
          {renderDatePicker('time_end', pageContent["organization-profile-event-end-date"] || "Data de término")}

          <div className="mt-4">
            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              {pageContent["organization-profile-event-capacities"] || "Capacidades"}
            </label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCapacities.map(capacity => (
                <CapacityChip
                  key={capacity.code}
                  name={capacity.name}
                  onRemove={() => handleRemoveCapacity(capacity.code)}
                />
              ))}
              
              {selectedCapacities.length === 0 && (
                <p className="text-sm text-gray-500">
                  {pageContent["organization-profile-event-no-capacities"] || "Nenhuma capacidade selecionada"}
                </p>
              )}
            </div>
            
            <BaseButton
              label={pageContent["organization-profile-event-add-capacity"] || "Adicionar capacidade"}
              onClick={() => setIsModalOpen(true)}
              customClass={`mt-2 py-1 px-3 text-sm rounded-md border ${
                darkMode 
                  ? 'border-white text-white' 
                  : 'border-gray-300 text-gray-700'
              }`}
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CapacitySelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleCapacitySelect}
          title={pageContent["organization-profile-event-select-capacity"] || "Selecionar capacidade"}
        />
      )}
    </div>
  );
} 