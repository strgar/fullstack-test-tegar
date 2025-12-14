import Config from '../../config.js';
import { API } from './index.js';
import StorageService from '../services/storage.service.js';

export const PegawaiAPI = {
    // Get all employees
    async getAllPegawai() {
        return await API.request(`${Config.API_BASE}/api/pegawai/daftar`, {
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            }
        });
    },

    // Add new employee
    async addPegawai(data) {
        return await API.request(`${Config.API_BASE}/api/pegawai/admin-tambah-pegawai`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            },
            body: JSON.stringify(data)
        });
    },

    // Update employee
    async updatePegawai(idUser, data) {
        const params = new URLSearchParams({ idUser });
        return await API.request(
            `${Config.API_BASE}/api/pegawai/admin-ubah-pegawai?${params}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                },
                body: JSON.stringify(data)
            }
        );
    },

    // Update employee photo
    async updatePhoto(idUser, formData) {
        const params = new URLSearchParams({ idUser });
        return await API.request(
            `${Config.API_BASE}/api/pegawai/admin-ubah-photo?${params}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                },
                body: formData
            }
        );
    },

    // Update own photo
    async updateOwnPhoto(formData) {
        return await API.request(`${Config.API_BASE}/api/pegawai/ubah-photo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            },
            body: formData
        });
    },

    // Get combo data
    async getCombo(type) {
        return await API.request(`${Config.API_BASE}/api/pegawai/combo/${type}`, {
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            }
        });
    },

    // Get HRD department employees
    async getHrdEmployees() {
        return await API.request(`${Config.API_BASE}/api/pegawai/combo/departemen-hrd`, {
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            }
        });
    }
};