import axios from "axios";

export interface BugReport {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class BugReportService {
  static async submitReport(
    title: string,
    description: string,
    type: string,
    token?: string
  ): Promise<any> {
    const response = await axios.post(
      "/api/report",
      {
        report: "", // Deixe vazio para criar um novo relatÃ³rio
        title,
        description,
        type,
      },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    return response.data;
  }

  static async getReports(token?: string): Promise<BugReport[]> {
    const response = await axios.get("/api/report", {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  }

  static async getReportById(reportId: string, token?: string): Promise<BugReport> {
    const response = await axios.get(`/api/report?reportId=${reportId}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
    return response.data;
  }
}
