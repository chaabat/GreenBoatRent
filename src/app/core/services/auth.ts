import { Injectable, isDevMode, signal } from '@angular/core';
import { User, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /** undefined = still loading */
  user = signal<User | null | undefined>(undefined);
  isAdmin = signal(false);

  /** Resolves once Firebase has restored the session */
  readonly ready: Promise<void>;

  constructor() {
    let resolve!: () => void;
    this.ready = new Promise(r => (resolve = r));

    onAuthStateChanged(auth, async u => {
      this.user.set(u);
      this.isAdmin.set(u ? await this.checkAdmin(u.uid) : false);
      resolve();
    });
  }

  async login(email: string, password: string): Promise<void> {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const ok = await this.checkAdmin(cred.user.uid);
    this.isAdmin.set(ok);
    if (!ok) {
      await signOut(auth);
      throw new Error(this.lastError ? 'ADMIN_CHECK_FAILED' : 'NOT_ADMIN');
    }
  }

  logout() {
    this.isAdmin.set(false);
    return signOut(auth);
  }

  /** Last Firestore error (debug) */
  lastError: string | null = null;

  private async checkAdmin(uid: string): Promise<boolean> {
    this.lastError = null;
    try {
      const snap = await getDoc(doc(db, 'admins', uid));
      if (isDevMode()) console.log('[admin check] exists =', snap.exists());
      return snap.exists();
    } catch (e: any) {
      this.lastError = e?.code ?? e?.message ?? String(e);
      if (isDevMode()) console.error('[admin check] Firestore error:', e);
      return false;
    }
  }
}