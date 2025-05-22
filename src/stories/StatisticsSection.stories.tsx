import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import { Statistics } from "@/types/statistics";
import React from "react";

// We're creating a mock version of the StatisticsSection component for Storybook
// rather than using the actual component which relies on a hook we can't easily mock

// Mock data for the different scenarios
const defaultData: Statistics = {
  total_users: 1250,
  new_users: 120,
  total_capacities: 450,
  new_capacities: 35,
  total_messages: 3200,
  new_messages: 580,
  total_organizations: 75,
  new_organizations: 8,
};

const highNumbersData: Statistics = {
  total_users: 12500,
  new_users: 1200,
  total_capacities: 4500,
  new_capacities: 350,
  total_messages: 32000,
  new_messages: 5800,
  total_organizations: 750,
  new_organizations: 80,
};

const lowNumbersData: Statistics = {
  total_users: 25,
  new_users: 5,
  total_capacities: 10,
  new_capacities: 2,
  total_messages: 50,
  new_messages: 10,
  total_organizations: 5,
  new_organizations: 1,
};

// Colors for the charts (copied from original component)
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

// Lighter blue color for the animation
const LIGHTER_BLUE = "#3498db"; // Lighter blue than capx-primary-blue (#0070b9)

// Mock AnimatedPieChart component from the original
const AnimatedPieChart = ({
  total,
  newValue,
  color,
  darkMode = false,
}: {
  total: number;
  newValue: number;
  color: string;
  darkMode?: boolean;
}) => {
  // Match sizing with main component
  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center h-[224px]">
      <svg
        className="w-[224px] h-[224px] transform -rotate-90"
        viewBox="0 0 224 224"
      >
        <circle
          cx="112"
          cy="112"
          r={radius}
          fill="transparent"
          className="stroke-capx-primary-blue opacity-80"
          strokeWidth="16"
        />
        <circle
          cx="112"
          cy="112"
          r={radius}
          fill="transparent"
          stroke={darkMode ? LIGHTER_BLUE : COLORS[5]}
          className="transition-all duration-[1500ms] ease-in-out"
          strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - newValue / total)}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={`text-capx-text-5xl font-bold ${
            darkMode ? "text-white" : "text-capx-light-text"
          }`}
        >
          {total}
        </span>
        <span
          className={`text-capx-text-2xl mt-2 ${
            darkMode ? "text-white" : "text-capx-light-text"
          }`}
        >
          +{Math.round((newValue / total) * 100)}%
        </span>
      </div>
    </div>
  );
};

// Mock StatisticsSection component for Storybook
// This is a simplified version of the original component
const MockStatisticsSection = ({
  data = defaultData,
  isLoading = false,
  error = null,
  darkMode = false,
}: {
  data?: Statistics;
  isLoading?: boolean;
  error?: Error | null;
  darkMode?: boolean;
}) => {
  // Simulated page content
  const pageContent = {
    "statistics-section-title": "Platform Statistics",
    "statistics-users-title": "Users",
    "statistics-capacities-title": "Capacities",
    "statistics-messages-title": "Messages",
    "statistics-organizations-title": "Organizations",
    "statistics-new-label": "new",
    "statistics-loading-text": "Loading statistics...",
    "statistics-error-text": "Error loading statistics",
    "statistics-source-text": "Data updated daily",
    "navbar-link-capacities": "View all capacities",
    "navbar-link-organizations": "View all organizations",
  };

  interface StatCardProps {
    title: string;
    value: number;
    newValue: number;
    color: string;
    type: "users" | "capacities" | "messages" | "organizations";
  }

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
      <div className="flex flex-col items-center justify-center">
        {type === "users" ? (
          <AnimatedPieChart
            total={value}
            newValue={newValue}
            color={color}
            darkMode={darkMode}
          />
        ) : (
          <div className="flex items-center justify-center h-[224px]">
            <div
              className="w-[200px] h-[200px] rounded-full flex items-center justify-center"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-capx-text-5xl font-bold">
                {value}
              </span>
            </div>
          </div>
        )}
        <h3
          className={`text-capx-text-xl font-semibold mt-4 ${
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
            <div
              role="status"
              className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"
            ></div>
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
};

// Define the meta for the component
const meta: Meta<typeof MockStatisticsSection> = {
  title: "Components/StatisticsSection",
  component: MockStatisticsSection,
  decorators: [
    (Story) => (
      <AppProvider>
        <ThemeProvider>
          <div className="w-full">
            <Story />
          </div>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MockStatisticsSection>;

export const Default: Story = {
  args: {
    data: defaultData,
    isLoading: false,
    error: null,
    darkMode: false,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    error: new Error("Failed to load statistics"),
  },
};

export const DarkMode: Story = {
  args: {
    data: defaultData,
    darkMode: true,
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const WithHighNumbers: Story = {
  args: {
    data: highNumbersData,
  },
};

export const WithLowNumbers: Story = {
  args: {
    data: lowNumbersData,
  },
};

export const Mobile: Story = {
  args: {
    data: defaultData,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
