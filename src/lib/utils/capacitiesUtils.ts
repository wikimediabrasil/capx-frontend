import OrganizationalIcon from "@/public/static/images/corporate_fare.svg";
import CommunicationIcon from "@/public/static/images/communication.svg";
import LearningIcon from "@/public/static/images/local_library.svg";
import CommunityIcon from "@/public/static/images/communities.svg";
import SocialIcon from "@/public/static/images/cheer.svg";
import StrategicIcon from "@/public/static/images/chess_pawn.svg";
import TechnologyIcon from "@/public/static/images/wifi_tethering.svg";
import { Dispatch, SetStateAction } from "react";
import axios from "axios";

const colorMap: Record<string, string> = {
  organizational: "#0078D4",
  communication: "#BE0078",
  learning: "#00965A",
  community: "#8E44AD",
  social: "#D35400",
  strategic: "#3498DB",
  technology: "#27AE60",
};

const filterMap: Record<string, string> = {
  "#0078D4":
    "invert(46%) sepia(66%) saturate(2299%) hue-rotate(187deg) brightness(102%) contrast(101%)", // organizational
  "#BE0078":
    "invert(21%) sepia(91%) saturate(3184%) hue-rotate(297deg) brightness(89%) contrast(96%)", // communication - novo ajuste para rosa
  "#00965A":
    "invert(48%) sepia(85%) saturate(385%) hue-rotate(115deg) brightness(97%) contrast(101%)", // learning
  "#8E44AD":
    "invert(29%) sepia(67%) saturate(860%) hue-rotate(225deg) brightness(89%) contrast(88%)", // community
  "#D35400":
    "invert(45%) sepia(95%) saturate(1480%) hue-rotate(347deg) brightness(98%) contrast(96%)", // social
  "#3498DB":
    "invert(50%) sepia(80%) saturate(850%) hue-rotate(187deg) brightness(95%) contrast(92%)", // strategic
  "#27AE60":
    "invert(56%) sepia(75%) saturate(436%) hue-rotate(93deg) brightness(132%) contrast(98%)", // technology
};

export const getHueRotate = (color: string | undefined): string => {
  if (!color) return "";

  if (color.startsWith("#")) {
    return filterMap[color];
  }
  // get the filter based on the category name
  const filter = filterMap[colorMap[color]];

  if (filter) {
    return filter;
  }

  return "";
};

export const getCapacityColor = (color: string): string => {
  // if the color is a category (ex: "communication"), get the hex from colorMap
  const hexColor = colorMap[color];

  return hexColor || color || "#000000";
};

export const getCapacityIcon = (code: number): string => {
  const iconMap: Record<string, string> = {
    "10": OrganizationalIcon,
    "36": CommunicationIcon,
    "50": LearningIcon,
    "56": CommunityIcon,
    "65": SocialIcon,
    "74": StrategicIcon,
    "106": TechnologyIcon,
  };

  return iconMap[code] || "";
};

export const toggleChildCapacities = async (
  parentCode: string,
  expandedCapacities: Record<string, boolean>,
  setExpandedCapacities: Dispatch<SetStateAction<Record<string, boolean>>>,
  fetchCapacitiesByParent: (code: string) => Promise<any[]>,
  fetchCapacityDescription?: (code: number) => Promise<void>
) => {
  if (expandedCapacities[parentCode]) {
    setExpandedCapacities((prev) => ({ ...prev, [parentCode]: false }));
    return;
  }

  const children = await fetchCapacitiesByParent(parentCode);

  if (fetchCapacityDescription) {
    for (const child of children) {
      if (child.code) {
        fetchCapacityDescription(Number(child.code));
      }
    }
  }

  setExpandedCapacities((prev) => ({ ...prev, [parentCode]: true }));
};

export const fetchWikidata = async (codes: any, language: string) => {
  try {
    // Continue with Wikidata query...
    const wdCodeList = codes.map((code) => "wd:" + code.wd_code);
    const queryText = `SELECT ?item ?itemLabel ?itemDescription WHERE {VALUES ?item {${wdCodeList.join(
      " "
    )}} SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'.}}`;

    const wikidataResponse = await axios.get(
      `https://query.wikidata.org/bigdata/namespace/wdq/sparql?format=json&query=${queryText}`
    );

    return (wikidataResponse.data.results.bindings || [])
      .filter(
        (wdItem) =>
          wdItem.item &&
          wdItem.item.value &&
          wdItem.itemLabel &&
          wdItem.itemLabel.value
      )
      .map((wdItem) => ({
        wd_code: wdItem.item.value.split("/").slice(-1)[0],
        name: wdItem.itemLabel.value,
        description: wdItem.itemDescription?.value || "",
      }));
  } catch (error) {
    console.error("Error in fetchWikidata:", error);
    return [];
  }
};

export const fetchMetabase = async (codes: any, language: string) => {
  try {
    if (!codes || codes.length === 0) {
      return [];
    }

    const mbQueryText = `PREFIX wbt:<https://metabase.wikibase.cloud/prop/direct/>  
  SELECT ?item ?itemLabel ?itemDescription ?value WHERE {  
    VALUES ?value {${codes.map((code) => `"${code.wd_code}"`).join(" ")}}  
    ?item wbt:P1 ?value.  
    SERVICE wikibase:label { bd:serviceParam wikibase:language '${language},en'. }}`;

    const response = await axios.post(
      "https://metabase.wikibase.cloud/query/sparql?format=json&query=" +
        encodeURIComponent(mbQueryText),
      {
        headers: {
          "Content-Type": "application/sparql-query",
          Accept: "application/sparql-results+json",
          "User-Agent": "CapX/1.0",
        },
      }
    );

    return (response.data.results.bindings || [])
      .filter(
        (mbItem) =>
          mbItem.value &&
          mbItem.value.value &&
          mbItem.itemLabel &&
          mbItem.itemLabel.value
      )
      .map((mbItem) => ({
        code: codes.find((c) => c.wd_code === mbItem.value.value)?.code,
        wd_code: mbItem.value.value,
        name: mbItem.itemLabel.value,
        description: mbItem.itemDescription?.value || "",
      }));
  } catch (error) {
    console.error("Error in fetchMetabase:", error);
    console.error("Error stack:", error.stack);
    return [];
  }
};
