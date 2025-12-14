import Config from '../../config.js';
import { API } from './index.js';
import StorageService from '../services/storage.service.js';

export const PresensiAPI = {
    // Check in
    async checkIn() {
        return await API.request(`${Config.API_BASE}/presensi/in`, {
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            }
        });
    },

    // Check out
    async checkOut() {
        return await API.request(`${Config.API_BASE}/presensi/out`, {
            headers: {
                'Authorization': `Bearer ${StorageService.getToken()}`
            }
        });
    },

    // Submit absence
    async submitAbsence(data) {
        const params = new URLSearchParams({
            tglAbsensi: data.tglAbsensi,
            kdStatus: data.kdStatus
        });
        
        return await API.request(
            `${Config.API_BASE}/presensi/absen?${params}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                }
            }
        );
    },

    // Get attendance list for admin
    async getAttendanceAdmin(tglAwal, tglAkhir) {
        const params = new URLSearchParams({ tglAwal, tglAkhir });
        return await API.request(
            `${Config.API_BASE}/presensi/daftar/admin?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                }
            }
        );
    },

    // Get attendance list for employee
    async getAttendanceEmployee(tglAwal, tglAkhir) {
        const params = new URLSearchParams({ tglAwal, tglAkhir });
        return await API.request(
            `${Config.API_BASE}/presensi/daftar/pegawai?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                }
            }
        );
    },

    // Get absence status combo
    async getStatusCombo(tglAwal, tglAkhir) {
        const params = new URLSearchParams({ tglAwal, tglAkhir });
        return await API.request(
            `${Config.API_BASE}/presensi/combo/status-absen?${params}`,
            {
                headers: {
                    'Authorization': `Bearer ${StorageService.getToken()}`
                }
            }
        );
    }
};