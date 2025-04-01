import { BugReport } from "@/types/report";
import axios from "axios";

export interface BugReportServiceParams {
  bugReport: Partial<BugReport>;
  token: string;
}

export class BugReportService {
  static async submitReport({
    bugReport,
    token
  }: BugReportServiceParams): Promise<any> {
    try {
      const response = await axios.post(
        "/api/report",
        {
          title: bugReport.title,
          description: bugReport.description,
          author: bugReport.author,
          type: bugReport.type,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to submit report:", error);
      throw error;
    }
  }

  static async getReports(token?: string): Promise<BugReport[]> {
    try {
      const response = await axios.get("/api/report", {
        headers: {
          Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
    } catch (error) {
      console.error("Failed to get reports:", error);
      throw error;
    }
  }

  static async getReportById(reportId: string, token?: string): Promise<BugReport> {
    try {
      const response = await axios.get(`/api/report?reportId=${reportId}`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
      },
    });
    return response.data;
    } catch (error) {
      console.error("Failed to get report by id:", error);
      throw error;
    }
  }
}
