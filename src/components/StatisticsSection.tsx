"use client";

import { useStatistics } from "@/hooks/useStatistics";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useState, useEffect } from "react";

// Colors for the charts
const COLORS = [
  "#0070b9", // capx-primary-blue
  "#02AE8C", // capx-primary-green
  "#D43420", // capx-primary-red
  "#f0c626", // capx-primary-yellow
  "#851d6a", // capx-secondary-purple
  "#053749", // capx-secondary-gray
  "#D43831", // capx-primary-orange
  "#05a300", // capx-secondary-green
];

const AnimatedPieChart = ({
  total,
  newValue,
  color,
}: {
  total: number;
  newValue: number;
  color: string;
}) => {
  const { darkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const percentage = (newValue / total) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isVisible
    ? circumference - (percentage / 100) * circumference
    : circumference;

  useEffect(() => {
    // Trigger animation after component mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <svg
        className="w-[192px] h-[192px] transform -rotate-90"
        viewBox="0 0 192 192"
      >
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="transparent"
          className="stroke-capx-primary-blue opacity-80"
          strokeWidth="16"
        />
        {/* Animated foreground circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          fill="transparent"
          className="stroke-capx-secondary-gray transition-all duration-[1500ms] ease-in-out"
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transformOrigin: "center",
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-capx-text-5xl font-bold ${
            darkMode ? "text-capx-dark-text" : "text-capx-light-text"
          }`}
        >
          {total}
        </span>
        <span
          className={`text-capx-text-xl mt-2 ${
            darkMode ? "text-capx-dark-text" : "text-capx-light-text"
          }`}
        >
          +{Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
};

export default function StatisticsSection() {
  const { data, isLoading, error } = useStatistics();
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Transform data to the BarChart format
  const barData = data
    ? [
        {
          name: "Users",
          total: data.total_users,
          novos: data.new_users,
        },
        {
          name: "Capacities",
          total: data.total_capacities,
          novos: data.new_capacities,
        },
        {
          name: "Messages",
          total: data.total_messages,
          novos: data.new_messages,
        },
        {
          name: "Organizations",
          total: data.total_organizations,
          novos: data.new_organizations,
        },
      ]
    : [];

  // Data for the pie chart
  const pieData = data
    ? [
        { name: "Users", value: data.total_users },
        { name: "Capacities", value: data.total_capacities },
        { name: "Messages", value: data.total_messages },
        { name: "Organizations", value: data.total_organizations },
      ]
    : [];

  // Text style based on the theme
  const textColor = darkMode ? "#FFFFFF" : "#053749";

  // Type for the StatCard
  interface StatCardProps {
    title: string;
    value: number;
    newValue: number;
    color: string;
    type: "users" | "capacities" | "messages" | "organizations";
  }

  // Stats cards to show main numbers
  const StatCard = ({ title, value, newValue, color, type }: StatCardProps) => {
    const getLinkDetails = () => {
      switch (type) {
        case "capacities":
          return {
            href: "/capacity",
            text: pageContent["navbar-link-capacities"],
          };
        case "organizations":
          return {
            href: "/organization_list",
            text: pageContent["navbar-link-organizations"],
          };
        default:
          return null;
      }
    };

    const linkDetails = getLinkDetails();

    return (
      <div
        className={`p-4 bg-transparent flex flex-col items-center justify-center`}
      >
        {type === "users" ? (
          <AnimatedPieChart total={value} newValue={newValue} color={color} />
        ) : (
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center mb-2"
            style={{ backgroundColor: color }}
          >
            <span className="text-white text-capx-text-4xl font-bold">
              {value}
            </span>
          </div>
        )}
        <h3
          className={`text-capx-text-xl font-semibold mt-2 ${
            darkMode ? "text-capx-dark-text" : "text-capx-light-text"
          }`}
        >
          {title}
        </h3>
        {newValue > 0 && (
          <p
            className={`text-capx-text-xl font-semibold mt-1 ${
              darkMode ? "text-capx-dark-text" : "text-capx-light-text"
            }`}
          >
            +{newValue} {pageContent["statistics-new-label"]}
          </p>
        )}
        {linkDetails && (
          <a
            href={linkDetails.href}
            className={`mt-2 text-capx-text-xl hover:underline text-center ${
              darkMode ? "text-capx-dark-link" : "text-capx-light-link"
            }`}
          >
            {linkDetails.text}
          </a>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <section
        className={`w-full py-16 px-4 ${
          darkMode
            ? "bg-capx-dark-box-bg text-white"
            : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"></div>
            <p className="ml-2">{pageContent["statistics-loading-text"]}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section
        className={`w-full py-16 px-4 ${
          darkMode
            ? "bg-capx-dark-box-bg text-white"
            : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">
              {pageContent["statistics-error-text"]}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="statistics-section"
      className={`w-full py-16 px-4 ${
        darkMode ? "bg-capx-dark-box-bg" : "bg-gray-50"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-capx-text-4xl font-bold mb-8 text-center ${
            darkMode ? "text-capx-dark-text" : "text-capx-light-text"
          }`}
        >
          {pageContent["statistics-section-title"]}
        </h2>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title={pageContent["statistics-users-title"]}
            value={data.total_users}
            newValue={data.new_users}
            color={COLORS[0]}
            type="users"
          />
          <StatCard
            title={pageContent["statistics-capacities-title"]}
            value={data.total_capacities}
            newValue={data.new_capacities}
            color={COLORS[1]}
            type="capacities"
          />
          <StatCard
            title={pageContent["statistics-messages-title"]}
            value={data.total_messages}
            newValue={data.new_messages}
            color={COLORS[2]}
            type="messages"
          />
          <StatCard
            title={pageContent["statistics-organizations-title"]}
            value={data.total_organizations}
            newValue={data.new_organizations}
            color={COLORS[3]}
            type="organizations"
          />
        </div>

        {/* Data source */}
        <div className="mt-8 text-center">
          <p
            className={`text-capx-text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {pageContent["statistics-source-text"]}
          </p>
        </div>
      </div>
    </section>
  );
}
