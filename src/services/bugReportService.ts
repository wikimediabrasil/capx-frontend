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
    const response = await axios.post(
      "/api/report",
      {
        // report: "", // Deixe vazio para criar um novo relatorio
        title: bugReport.title,
        description: bugReport.description,
        // type: bugReport.type,
      },
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }

  static async getReports(token?: string): Promise<BugReport[]> {
    const response = await axios.get("/api/report", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("getReports response", response)
    return response.data;
  }

  static async getReportById(reportId: string, token?: string): Promise<BugReport> {
    const response = await axios.get(`/api/report?reportId=${reportId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }
}
