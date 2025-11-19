import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getClassifications = async () => {
    const response = await axios.get(`${API_BASE_URL}/classifications`);
    return response.data;
};

export const getStatistics = async () => {
    const response = await axios.get(`${API_BASE_URL}/statistics`);
    return response.data;
};

export const getClassificationsByRange = async (startDate, endDate) => {
    const response = await axios.get(`${API_BASE_URL}/classifications/range`, {
        params: { startDate, endDate }
    });
    return response.data;
};