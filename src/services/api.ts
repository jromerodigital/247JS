import { DedicationData, User } from '../types/dedication';

// Si el usuario configura su URL de Apps Script la usaremos, si no, usa el modo LocalStorage sin romper nada
const APPS_SCRIPT_URL = (import.meta as any).env?.VITE_APPS_SCRIPT_URL || '';

export async function registerApi(email: string, password: string, name: string, lastName: string): Promise<User> {
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register',
          data: { email, password, name, lastName }
        })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Error al registrar usuario');
      return result.user;
    } catch (err: any) {
      console.warn('Error conectando a Apps Script, registrando localmente:', err);
    }
  }

  // Fallback Local Storage Mode
  const usersJson = localStorage.getItem('vibelove_users') || '[]';
  const users: User[] = JSON.parse(usersJson);
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const newUser: User = { id: `usr_${Date.now()}`, email, name, lastName };
  users.push(newUser);
  localStorage.setItem('vibelove_users', JSON.stringify(users));
  localStorage.setItem(`pass_${email.toLowerCase()}`, password);
  return newUser;
}

export async function loginApi(email: string, password: string): Promise<User> {
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'login',
          data: { email, password }
        })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Error al iniciar sesión');
      return result.user;
    } catch (err: any) {
      console.warn('Error conectando a Apps Script, autenticando localmente:', err);
    }
  }

  // Fallback Local Storage Mode
  const storedPass = localStorage.getItem(`pass_${email.toLowerCase()}`);
  if (!storedPass || storedPass !== password) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  const usersJson = localStorage.getItem('vibelove_users') || '[]';
  const users: User[] = JSON.parse(usersJson);
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  return found || { id: `usr_${Date.now()}`, email, name: email.split('@')[0], lastName: '' };
}

export async function saveDedicationApi(dedication: DedicationData): Promise<string> {
  // Always save locally
  localStorage.setItem(`dedication_${dedication.slug}`, JSON.stringify(dedication));

  if (APPS_SCRIPT_URL) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveDedication',
          data: dedication
        })
      });
    } catch (err) {
      console.warn('Error sincronizando dedicatoria con Google Sheets Apps Script:', err);
    }
  }

  return dedication.slug;
}

export async function getDedicationBySlugApi(slug: string): Promise<DedicationData | null> {
  // First check local storage
  const localJson = localStorage.getItem(`dedication_${slug}`);
  if (localJson) {
    try {
      return JSON.parse(localJson);
    } catch (e) {}
  }

  // Try Apps Script API
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?slug=${encodeURIComponent(slug)}`);
      const result = await res.json();
      if (result.success && result.data) {
        localStorage.setItem(`dedication_${slug}`, JSON.stringify(result.data));
        return result.data;
      }
    } catch (err) {
      console.warn('Error buscando dedicatoria en Apps Script:', err);
    }
  }

  return null;
}

export async function getUserDedicationsApi(email: string): Promise<DedicationData[]> {
  // Always get locally first
  const localList: DedicationData[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('dedication_')) {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        if (item.userEmail?.toLowerCase() === email.toLowerCase()) {
          localList.push(item);
        }
      } catch (e) {}
    }
  }

  // Try fetching from Apps Script and merge/overwrite
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}`);
      const result = await res.json();
      if (result.success && result.dedications) {
        // Update local storage with fresh data from server
        result.dedications.forEach((ded: DedicationData) => {
          localStorage.setItem(`dedication_${ded.slug}`, JSON.stringify(ded));
        });
        return result.dedications;
      }
    } catch (err) {
      console.warn('Error fetching user dedications from Apps Script:', err);
    }
  }

  return localList;
}
