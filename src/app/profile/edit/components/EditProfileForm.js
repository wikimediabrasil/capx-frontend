"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import TextArea from "./TextArea";
import TextInput from "./TextInput";
import SingleSelectInput from "./SingleSelectInput";
import SubmitButton from "./SubmitButton";
import LoadingSection from "../../components/LoadingSection";
import MultiSelectInput from "./MultiSelectInput";

const fetchData = async (queryData) => {
  try {
    const [userData, formData, territoryData, languageData, affiliationData, wikiProjectData, skillData] = await Promise.all([
      axios.get("/api/profile", queryData),
      axios.options("/api/profile", queryData),
      axios.get('/api/list/territory', queryData),
      axios.get('/api/list/language', queryData),
      axios.get('/api/list/organizations', queryData),
      axios.get('/api/list/wikimedia_project', queryData),
      axios.get('/api/list/skills', queryData)
    ]);

    return {
      userData: userData.data,
      formData: formData.data,
      territoryData: territoryData.data,
      languageData: languageData.data,
      affiliationData: affiliationData.data,
      wikiProjectData: wikiProjectData.data,
      skillData: skillData.data
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { userData: null, formData: null, affiliationData: null };
  }
};

export default function EditProfileForm({ session, language, pageContent, darkMode }) {
  const router = useRouter();
  const { status, data } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [updatingData, setUpdatingData] = useState(false);
  const [currentUserData, setCurrentUserData] = useState({});
  const [myData, setMyData] = useState({ userData: null, FormData: null, territoryData: null, languageData: null, affiliationData: null, wikiProjectData: null, skillData: null });

  const pronouns = [
    { value: "he-him", label: "He/Him" },
    { value: "she-her", label: "She/Her" },
    { value: "they-them", label: "They/Them" },
    { value: "not-specified", label: "Not Specified" },
    { value: "other", label: "Other" }
  ]

  useEffect(() => {
    if (status === "authenticated") {
      const queryData = {
        params: { userId: data.user.id },
        headers: { 'Authorization': `Token ${data.user.token}` }
      }

      const getData = async (queryData) => {
        const fetchedData = await fetchData(queryData);
        setMyData(fetchedData);
        setIsLoading(false);
      };

      getData(queryData);

    }
  }, [status]);

  const handleTextInputChange = (e, chosenState = null) => {
    const { name, value } = e.target;

    if (chosenState == null) {
      const newUserData = {
        ...myData.userData,
        [name]: value
      };
      setMyData({ ...myData, userData: newUserData });
    }
  };

  const handleSingleSelectInputChange = (selectedOption, element) => {
    setCurrentUserData({ ...newUserData, [element.name]: selectedOption.value });
  };

  const handleMultiSelectInputChange = (selectedOptions, element) => {
    const newUserData = {
      ...myData.userData,
      affiliation: selectedOptions.map(option => option.value)
    };
    setMyData({ ...myData, userData: newUserData })
  }

  const handleSubmit = async (e) => {
    setUpdatingData(true);
    if (status == "authenticated") {
      e.preventDefault();
      const queryResponse = await axios.post("/api/profile",
        myData.userData,
        {
          headers: {
            'Authorization': `Token ${data.user.token}`,
          }
        }
      ).then(() => {
        router.push("/profile");
      });
    }
  };

  if (status === "authenticated") {
    return (
      <section className={"flex flex-wrap flex-col w-10/12 h-fit mx-auto place-content-start py-32"}>
        <form onSubmit={handleSubmit} className="w-full">
          {/* Profile Picture */}
          <TextInput
            id={"profile_image"}
            key={"profile_image"}
            data={myData.userData.profile_image ?? ""}
            placeholder={"e.g. https://upload.wikimedia.org/..."}
            onChange={handleTextInputChange}
            type={"url"}
            maxLength={200}
          >
            Profile Picture
          </TextInput>
          {/* Display Name */}
          <TextInput
            id={"display_name"}
            key={"display_name"}
            data={myData.userData.display_name ?? ""}
            placeholder={"e.g. Name Surname"}
            onChange={handleTextInputChange}
            type={"text"}
            maxLength={300}
          >
            Display Name
          </TextInput>
          <SubmitButton updatingData={updatingData}>Update</SubmitButton>
        </form>
      </section>
    )
  }
}