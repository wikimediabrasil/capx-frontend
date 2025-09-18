import { LetsConnect } from '@/types/lets_connect';
import { LetsConnectProfile } from '@/types/profile';
import axios from 'axios';

export interface LetsConnectServiceParams {
  letsConnect: Partial<LetsConnect>;
  token: string;
}

export class LetsConnectService {
  static async submitLetsConnectForm({
    letsConnect,
    token,
  }: LetsConnectServiceParams): Promise<any> {
    try {
      const response = await axios.post(
        '/api/lets_connect/profile',
        {
          full_name: letsConnect.full_name,
          email: letsConnect.email,
          role: letsConnect.role,
          area: Array.isArray(letsConnect.area) ? letsConnect.area.join(', ') : letsConnect.area,
          gender: letsConnect.gender,
          age: letsConnect.age,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to send lets connect data:', error);
      throw error;
    }
  }

  static async getLetsConnectProfile(username?: string): Promise<LetsConnectProfile | null> {
    if (!username) return null;

    try {
      const response = await axios.get('/api/lets_connect/profile', {
        params: { username },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get LetsConnect profile data:', error);
      throw error;
    }
  }
}
