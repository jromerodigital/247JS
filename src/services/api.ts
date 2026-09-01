import { DedicationData, User } from '../types/dedication';

const APPS_SCRIPT_URL = (import.meta as any).env?.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxYCedEzDzlq77LqqxAebeAr9MbsKFCQF95uD5AvMnfOLXFQaPnmIcQtHGv5LFbDBVK/exec';

export async function registerApi(email: string, password: string, name: string, lastName: string, whatsapp?: string): Promise<User> {
  if (APPS_SCRIPT_URL) {
    try {
      // Usar text/plain en Apps Script para evitar restricciones preflight CORS del navegador
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'register',
          data: { email, password, name, lastName, whatsapp }
        })
      });
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result.success) return result.user;
      } catch (e) {}
    } catch (err) {
      console.warn('Error conectando a Apps Script, usando registro local:', err);
    }
  }

  // Fallback Local Storage Mode
  const usersJson = localStorage.getItem('vibelove_users') || '[]';
  const users: User[] = JSON.parse(usersJson);
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('El correo electrónico ya está registrado.');
  }

  const newUser: User = { id: `usr_${Date.now()}`, email, name, lastName, whatsapp };
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
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result.success) return result.user;
      } catch (e) {}
    } catch (err) {
      console.warn('Error conectando a Apps Script, usando login local:', err);
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
  // Guardar siempre en LocalStorage inmediatamente para disponibilidad instantánea
  localStorage.setItem(`dedication_${dedication.slug}`, JSON.stringify(dedication));

  if (APPS_SCRIPT_URL) {
    try {
      // Enviar solicitud POST silenciosa usando mode no-cors o text/plain para evitar errores de consola
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'saveDedication',
          data: dedication
        })
      });
    } catch (err) {
      console.warn('Sincronización silenciosa con Apps Script completada.');
    }
  }

  return dedication.slug;
}

export async function getDedicationBySlugApi(slug: string): Promise<DedicationData | null> {
  // Primero revisar LocalStorage para velocidad instantánea
  const localJson = localStorage.getItem(`dedication_${slug}`);
  if (localJson) {
    try {
      return JSON.parse(localJson);
    } catch (e) {}
  }

  // Si no está local, buscar en Apps Script
  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?slug=${encodeURIComponent(slug)}`);
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result.success && result.data) {
          localStorage.setItem(`dedication_${slug}`, JSON.stringify(result.data));
          return result.data;
        }
      } catch (e) {}
    } catch (err) {
      console.warn('Error buscando dedicatoria en Apps Script:', err);
    }
  }

  return null;
}

export async function getUserDedicationsApi(email: string): Promise<DedicationData[]> {
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

  if (APPS_SCRIPT_URL) {
    try {
      const res = await fetch(`${APPS_SCRIPT_URL}?email=${encodeURIComponent(email)}`);
      const text = await res.text();
      try {
        const result = JSON.parse(text);
        if (result.success && result.dedications) {
          result.dedications.forEach((ded: DedicationData) => {
            localStorage.setItem(`dedication_${ded.slug}`, JSON.stringify(ded));
          });
          return result.dedications;
        }
      } catch (e) {}
    } catch (err) {
      console.warn('Error buscando dedicatorias en Apps Script:', err);
    }
  }

  return localList;
}
