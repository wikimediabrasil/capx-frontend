import { useMessageList } from '@/hooks/useMessageList';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { PaginationButtons } from '@/components/PaginationButtons';
import { useState, useEffect } from 'react';
import { Message } from '@/types/message';

import LoadingState from '@/components/LoadingState';
import SentMessageCard from './SentMessageCard';
import ActionButtons from '@/components/ActionButton';
import SendIcon from '@/public/static/images/send.svg';
import HomeIcon from '@/public/static/images/home_icon.svg';
import { ViewType } from './NavBar';
import { useRouter } from 'next/navigation';

interface SentMessagesListProps {
  setCurrentView: any;
}

export default function SentMessagesList({ setCurrentView }: SentMessagesListProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { messages, isLoading, error } = useMessageList();
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedMessages, setPaginatedMessages] = useState<Message[]>([]);
  const router = useRouter();

  const itemsPerPage = 5;
  const totalPages = Math.ceil((messages?.length || 0) / itemsPerPage);

  const handleAhead = () => {
    setCurrentView(ViewType.WRITE);
  };

  const handleBack = () => {
    router.push(`/home`);
  };

  useEffect(() => {
    if (messages) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setPaginatedMessages(messages.slice(startIndex, endIndex));
    }
  }, [currentPage, messages]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4">
      {paginatedMessages.length === 0 ? (
        <div
          className={`p-4 rounded-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}
        >
          {pageContent['message-no-submissions']}
        </div>
      ) : (
        paginatedMessages.map(message => <SentMessageCard key={message.id} submission={message} />)
      )}
      <ActionButtons
        handleAhead={handleAhead}
        labelButtonAhead={pageContent['message-sent-send-new-message']}
        iconAhead={SendIcon}
        iconAltAhead={pageContent['message-alt-icon']}
        handleBack={handleBack}
        labelButtonBack={pageContent['message-sent-back-to-home']}
        iconBack={HomeIcon}
        iconAltBack={pageContent['message-alt-back-to-home']}
      />
      {totalPages > 1 && (
        <PaginationButtons
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </section>
  );
}
