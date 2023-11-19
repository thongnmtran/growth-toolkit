const api = '/api/v1';
const auth = `${api}/auth`;

const register = `${auth}/register`;
const login = `${auth}/login`;
const logout = `${auth}/logout`;
const session = `${auth}/session`;

const agents = `${api}/agents`;
const registerAgent = `${agents}/register`;

const scraping = `${api}/scraping`;
const candidates = `${scraping}/candidates`;
const scrapingCompleted = `${scraping}/scraping-completed`;

export const Endpoints = {
  register,
  login,
  logout,
  session,

  agents,
  registerAgent,

  scraping,
  candidates,
  scrapingCompleted
};
