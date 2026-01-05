import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import axios from 'axios';

export function useProfileForm(initialData: any, session: any) {
  const router = useRouter();
  const [formData, setFormData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationUsername, setConfirmationUsername] = useState('');
  const [updatingData, setUpdatingData] = useState(false);

  const handleTextInputChange = (value: string, element: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      userData: {
        ...prev.userData,
        [element.name]: value,
      },
    }));
  };

  const handleSingleSelectInputChange = (selectedOption: any, element: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      userData: {
        ...prev.userData,
        [element.name]: selectedOption.value,
      },
    }));
  };

  const handleMultiSelectInputChange = (selectedOptions: any[], element: { name: string }) => {
    const newUserData = {
      ...formData.userData,
      [element.name]: selectedOptions.map(option => option.value),
    };

    if (element.name === 'skills_known') {
      const previousSkillsKnown = formData.userData.skills_known;
      const removedSkills = previousSkillsKnown.filter(
        skill => !newUserData.skills_known.includes(skill)
      );

      if (removedSkills.length > 0) {
        newUserData.skills_available = formData.userData.skills_available.filter(
          skill => !removedSkills.includes(skill)
        );
      }
    }

    setFormData(prev => ({ ...prev, userData: newUserData }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingData(true);

    if (session.sessionStatus === 'authenticated') {
      try {
        await axios.put('/api/profile', formData.userData, {
          params: {
            userId: session.sessionData.user.id,
            username: session.sessionData.user.username,
            language: session.sessionData.user.language,
          },
          headers: {
            Authorization: `Token ${session.sessionData.user.token}`,
          },
        });
        router.push('/profile');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setUpdatingData(false);
      }
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.userData.user.username !== confirmationUsername ||
      session.sessionStatus !== 'authenticated'
    ) {
      alert('Usernames do not match');
      return;
    }

    try {
      await axios.delete('/api/profile', {
        headers: {
          Authorization: `Token ${session.sessionData.user.token}`,
        },
        data: {
          user: {
            id: formData.userData.user.id,
          },
        },
      });
      setIsModalOpen(false);
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleLoadPictures = async (
    inputValue: string,
    callback: (images: { value: string; label: string; thumbnail: string }[]) => void
  ) => {
    const response = await axios.get(`/api/profile_image?query=${encodeURIComponent(inputValue)}`);
    const images = response.data.map(image => ({
      value: image,
      label: image,
      thumbnail: null,
    }));
    callback(images);

    // Asynchronously load thumbnails
    images.forEach(async (image, index) => {
      const encodedImageValue = encodeURIComponent(image.value);
      const thumbnailResponse = await axios.get(
        `/api/profile_image?thumb=true&title=${encodedImageValue}`
      );
      images[index].thumbnail = thumbnailResponse.data.image;
      const valueResponse = await axios.get(`/api/profile_image?title=${encodedImageValue}`);
      images[index].value = valueResponse.data.image;
      callback([...images]); // Trigger re-render with the updated thumbnails
    });
  };

  return {
    formData,
    isModalOpen,
    confirmationUsername,
    updatingData,
    setIsModalOpen,
    setConfirmationUsername,
    handleTextInputChange,
    handleSingleSelectInputChange,
    handleMultiSelectInputChange,
    handleSubmit,
    handleDelete,
    handleLoadPictures,
  };
}
