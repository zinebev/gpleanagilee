import Cookies from "js-cookie";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ======================
// FETCH GLOBAL API
// ======================
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = Cookies.get("token");

  //  utiliser Headers (solution propre)
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  // ajouter token si existe
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur API");
  }

  return data;
}

// ======================
// AUTH API
// ======================
export const authAPI = {
  login: async (username: string, password: string) => {
    const data = await fetchAPI("/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (data.access) {
      Cookies.set("token", data.access);
      localStorage.setItem("token", data.access);
    }

    return data;
  },

  register: async (username: string, email: string, password: string) => {
    const data = await fetchAPI("/register/", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });

    if (data.access) {
      Cookies.set("token", data.access);
      localStorage.setItem("token", data.access);
    }

    return data;
  },

  logout: () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
  },

  isAuthenticated: () => {
    return !!Cookies.get("token");
  },
};

// ======================
export const projectsAPI = {
  getAll: () => fetchAPI("/projects/"),
  getById: (id: number) => fetchAPI(`/projects/${id}/`),
  getKpi: (id: number) => fetchAPI(`/projects/${id}/kpi/`),
  create: (projectData: any) =>
    fetchAPI("/projects/", { method: "POST", body: JSON.stringify(projectData) }),
  update: (id: number, projectData: any) =>
    fetchAPI(`/projects/${id}/`, { method: "PUT", body: JSON.stringify(projectData) }),
  delete: (id: number) =>
    fetchAPI(`/projects/${id}/`, { method: "DELETE" }),
};
// ======================
// TASKS API
// ======================
export const tasksAPI = {
  getAll: () => fetchAPI("/taches/"),
  getByProject: (projectId: number) => fetchAPI(`/taches/?projet=${projectId}`),
  create: (data: any) =>
    fetchAPI("/taches/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    fetchAPI(`/taches/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    fetchAPI(`/taches/${id}/`, { method: "DELETE" }),
};

// ======================
// USERS API
// ======================
export const usersAPI = {
  getAll: () => fetchAPI("/users/"),
};

// ======================
// NON-CONFORMITES API
// ======================
export const ncAPI = {
  getAll: () => fetchAPI("/non-conformites/"),
  create: (data: any) =>
    fetchAPI("/non-conformites/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    fetchAPI(`/non-conformites/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    fetchAPI(`/non-conformites/${id}/`, { method: "DELETE" }),
};


// ======================
// COUTS (BUDGET) API
// ======================
export const coutsAPI = {
  getAll: () => fetchAPI("/couts/"),
  create: (data: any) =>
    fetchAPI("/couts/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    fetchAPI(`/couts/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) =>
    fetchAPI(`/couts/${id}/`, { method: "DELETE" }),
};

export const wasteAPI = {
  getAll: (projectId: number) =>
    fetchAPI(`/projects/${projectId}/wastes/`),
  create: (projectId: number, data: any) =>
    fetchAPI(`/projects/${projectId}/wastes/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
// ======================
// LEAN APIs
// ======================
export const mudaAPI = {
  getAll: () => fetchAPI("/mudas/"),
  create: (data: any) => fetchAPI("/mudas/", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/mudas/${id}/`, { method: "DELETE" }),
};

export const kaizenAPI = {
  getAll: () => fetchAPI("/kaizens/"),
  create: (data: any) => fetchAPI("/kaizens/", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) => fetchAPI(`/kaizens/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/kaizens/${id}/`, { method: "DELETE" }),
};

export const vsmAPI = {
  getAll: () => fetchAPI("/vsm-steps/"),
  create: (data: any) => fetchAPI("/vsm-steps/", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: number) => fetchAPI(`/vsm-steps/${id}/`, { method: "DELETE" }),
};