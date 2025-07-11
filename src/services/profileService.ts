import axios from 'axios';

interface QueryData {
  params?: {
    userId?: number;
    username?: string;
    language?: string;
    limit?: number;
    offset?: number;
  };
  headers: {
    Authorization: string;
  };
  body?: any;
}

export const profileService = {
  async fetchUserProfile(queryData: QueryData) {
    try {
      const response = await axios.get(`/api/profile`, {
        params: queryData.params,
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  async fetchProfileData(queryData: QueryData) {
    try {
      const [userData, territoryData, languageData, affiliationData, wikiProjectData, skillData] =
        await Promise.all([
          axios.get('/api/profile', {
            params: queryData.params,
            headers: queryData.headers,
          }),
          axios.get('/api/list/territory', {
            params: queryData.params,
            headers: queryData.headers,
          }),
          axios.get('/api/list/language', {
            params: queryData.params,
            headers: queryData.headers,
          }),
          axios.get('/api/list/affiliation', {
            params: queryData.params,
            headers: queryData.headers,
          }),
          axios.get('/api/list/wikimedia_project', {
            params: queryData.params,
            headers: queryData.headers,
          }),
          axios.get('/api/capacity', {
            params: queryData.params,
            headers: queryData.headers,
          }),
        ]);

      return {
        userData: userData.data,
        territoryData: territoryData.data,
        languageData: languageData.data,
        affiliationData: affiliationData.data,
        wikiProjectData: wikiProjectData.data,
        skillData: skillData.data,
      };
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
      throw error;
    }
  },

  async updateProfile(userId: number, profileData: any, queryData: QueryData) {
    try {
      const payload = {
        ...profileData,
        user: {
          id: userId,
        },
      };

      const response = await axios.put(`/api/profile/${userId}`, payload, {
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  async deleteProfile(userId: string, token: string) {
    try {
      const response = await axios.delete('/api/profile', {
        headers: {
          Authorization: `Token ${token}`,
        },
        data: {
          userId,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  },
};
