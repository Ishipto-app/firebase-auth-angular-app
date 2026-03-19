import {inject, Injectable, signal} from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth, { optional: true });
  private firestore = inject(Firestore, { optional: true });

  private _authenticated = false;
  private _roles = signal<string[]>([]);
  private _user$ = new BehaviorSubject<User | null | undefined>(undefined);

  constructor() {
    if (this.auth) {
      authState(this.auth).subscribe(user => {
        this.updateState(user);
      });
    }
  }

  private async updateState(user: User | null) {
    if (user) {
      // Avoid redundant updates if user is already set
      if (this._user$.value?.uid === user.uid && this._roles().length > 0) return;
      
      const roles = await this.fetchRoles(user);
      this._authenticated = true;
      this._roles.set(roles);
      this._user$.next(user);
    } else {
      this._authenticated = false;
      this._roles.set([]);
      this._user$.next(null);
    }
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  get roles() {
    return this._roles;
  }

  get user$(): Observable<User | null | undefined> {
    return this._user$.asObservable();
  }

  async signIn() {
    if (!this.auth) throw new Error('Firebase Auth is not configured');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    await this.updateState(result.user);
    return result;
  }

  async signInByEmail(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase Auth is not configured');
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    await this.updateState(result.user);
    return result;
  }

  async signUp(email: string, password: string) {
    if (!this.auth) throw new Error('Firebase Auth is not configured');
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    await sendEmailVerification(result.user);
    await this.updateState(result.user);
    return result;
  }

  async sendVerificationEmail(email: string, password: string) {
    const response = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send verification email');
    }
    return response.json();
  }

  async signOut() {
    if (!this.auth) return;
    this._authenticated = false;
    this._roles.set([]);
    this._user$.next(null);
    return signOut(this.auth);
  }

  private async fetchRoles(user: User): Promise<string[]> {
    if (!this.firestore || !user.email) return [];
    try {
      const roles: string[] = [];
      
      const rolesRef = collection(this.firestore, 'Roles');
      const q = query(rolesRef, where('email', '==', user.email));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const roleData = data['role'];
        
        if (Array.isArray(roleData)) {
          roleData.forEach(r => {
            if (typeof r === 'string') {
              const normalizedRole = r.toLowerCase().trim();
              if (!roles.includes(normalizedRole)) {
                roles.push(normalizedRole);
              }
            }
          });
        } else if (typeof roleData === 'string') {
          const normalizedRole = roleData.toLowerCase().trim();
          if (!roles.includes(normalizedRole)) {
            roles.push(normalizedRole);
          }
        }
      });
      
      return roles;
    } catch (error) {
      console.error('Error fetching roles:', error);
      return [];
    }
  }

  hasRole(role: string): boolean {
    return this._roles().includes(role);
  }
}
