
export const API_URL = 'https://simpa.ftiorganizerhub.tech'; // Ganti dengan IP komputer Anda

export const ENDPOINTS = {
    LOGIN: `${API_URL}/auth/login`,
    FORM_SUBMIT: `${API_URL}/form`,
  PROYEK: `${API_URL}/proyek`,
  UNIT: `${API_URL}/unit`,
  VARIABLE_PEMERIKSAAN: `${API_URL}/variable-pemeriksaan`,
  VARIABLE_PEMBERSIHAN: `${API_URL}/variable-pembersihan`,
  MAINTENANCE: `${API_URL}/maintenance`,
};



export const APP_COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  white: '#FFFFFF',
  text: '#000000',
  error: '#FF3B30',
  success: '#34C759',
};

export const APP_STYLES = {
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  card: {
    backgroundColor: APP_COLORS.white,
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: APP_COLORS.white,
  },
  button: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: APP_COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
};