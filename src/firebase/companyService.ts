import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { Company } from '../types/company';

const DIRECTORY_DOC_REF = doc(db, 'meta', 'directory');

export interface DirectoryMetadata {
  lastUpdated: string;
  count: number;
}

/**
 * Saves company list to Firestore cloud database so any user from any computer sees it
 */
export async function saveCompaniesToFirestore(companies: Company[]): Promise<boolean> {
  try {
    await setDoc(DIRECTORY_DOC_REF, {
      companies,
      lastUpdated: new Date().toISOString(),
      count: companies.length,
    });
    return true;
  } catch (error) {
    console.error('Firestore saveCompanies error:', error);
    return false;
  }
}

/**
 * Loads current company list once from Firestore
 */
export async function loadCompaniesFromFirestore(): Promise<{ companies: Company[]; lastUpdated?: string } | null> {
  try {
    const snap = await getDoc(DIRECTORY_DOC_REF);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.companies) && data.companies.length > 0) {
        return {
          companies: data.companies as Company[],
          lastUpdated: data.lastUpdated,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Firestore loadCompanies error:', error);
    return null;
  }
}

/**
 * Listens to real-time updates from Firestore across all connected computers
 */
export function subscribeToCompanies(
  onUpdate: (companies: Company[], lastUpdated?: string) => void,
  onError?: (error: Error) => void
): () => void {
  const unsubscribe = onSnapshot(
    DIRECTORY_DOC_REF,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.companies) && data.companies.length > 0) {
          onUpdate(data.companies as Company[], data.lastUpdated);
        }
      }
    },
    (err) => {
      console.warn('Firestore snapshot listener error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}
