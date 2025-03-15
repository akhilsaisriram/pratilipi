const axios = require('axios');

class UserService {
  constructor(token = null) {
    console.log('====================================');
    console.log(token);
    console.log('====================================');
    this.client = axios.create({
      baseURL: "http://192.168.144.104:3000",
      headers: token ? { Authorization: token } : {}
    });
  }

  async register(userData) {
    try {
      const response = await this.client.post('/users/register', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async login(credentials) {
    console.log(credentials);
    
    try {
      const response = await this.client.post('/users/login', credentials);
      console.log(response.data);
      
      return response.data;
    } catch (error) {
        console.log(error);
        
      this.handleError(error);
    }
  }

  async getUser() {
    try {
      const response = await this.client.get('/users');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(userData) {
    try {
      const response = await this.client.put('/users', userData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser() {
    try {
      const response = await this.client.delete('/users');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.client.patch('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.message || 'Error from user service');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('User service is not responding');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Error setting up request to user service');
    }
  }
}

module.exports = { UserService };
