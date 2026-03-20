import {ChangeDetectionStrategy, Component, inject, OnInit, signal, computed} from '@angular/core';
import {API_BASE_URL} from '../../../app.constants';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Firestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc} from '@angular/fire/firestore';
import {MatTableModule} from '@angular/material/table';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ReactiveFormsModule, FormBuilder, Validators} from '@angular/forms';
import {firstValueFrom} from 'rxjs';

interface UserRole {
  id?: string;
  email: string;
  role: string;
}

interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserList implements OnInit {
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  
  users = signal<UserRole[]>([]);
  authUsers = signal<AuthUser[]>([]);
  isLoading = signal(true);
  isLoadingAuth = signal(false);
  isSubmitting = signal(false);
  editingId = signal<string | null>(null);
  deletingId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  
  displayedColumns: string[] = ['email', 'role', 'actions'];

  roleForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['', [Validators.required]]
  });

  // Filtered users for autocomplete
  filteredAuthUsers = computed(() => {
    const value = this.roleForm.get('email')?.value;
    const filterValue = (typeof value === 'string' ? value : '').toLowerCase();
    
    if (!filterValue) {
      return this.authUsers();
    }
    
    return this.authUsers().filter(user => 
      user.email.toLowerCase().includes(filterValue) || 
      (user.displayName && user.displayName.toLowerCase().includes(filterValue))
    );
  });

  async ngOnInit() {
    await Promise.all([
      this.fetchUsers(),
      this.fetchAuthUsers()
    ]);
  }

  async fetchUsers() {
    this.isLoading.set(true);
    try {
      const rolesRef = collection(this.firestore, 'Roles');
      const querySnapshot = await getDocs(rolesRef);
      const userList: UserRole[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserRole;
        userList.push({
          ...data,
          id: doc.id
        });
      });
      this.users.set(userList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async fetchAuthUsers() {
    this.isLoadingAuth.set(true);
    try {
      const users = await firstValueFrom(this.http.get<AuthUser[]>(`${API_BASE_URL}/api/admin/list-users`));
      this.authUsers.set(users || []);
    } catch (error: unknown) {
      console.error('Error fetching auth users:', error);
      // If the error has a message (from our server), log it specifically
      const err = error as { error?: { message?: string } };
      if (err.error && err.error.message) {
        console.error('Server error message:', err.error.message);
      }
    } finally {
      this.isLoadingAuth.set(false);
    }
  }

  async onSubmit() {
    if (this.roleForm.invalid) return;
    
    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    const formData = this.roleForm.value as UserRole;
    
    // Check for duplicate role for the same email
    const isDuplicate = this.users().some(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.role === formData.role && 
      u.id !== this.editingId()
    );

    if (isDuplicate) {
      this.errorMessage.set(`Người dùng ${formData.email} đã được cấp quyền ${formData.role} rồi.`);
      this.isSubmitting.set(false);
      return;
    }

    try {
      if (this.editingId()) {
        const docRef = doc(this.firestore, 'Roles', this.editingId()!);
        await updateDoc(docRef, {
          email: formData.email,
          role: formData.role
        });
      } else {
        const rolesRef = collection(this.firestore, 'Roles');
        await addDoc(rolesRef, formData);
      }
      
      this.roleForm.reset();
      this.editingId.set(null);
      await this.fetchUsers();
    } catch (error) {
      console.error('Error saving role:', error);
      this.errorMessage.set('Lỗi khi lưu quyền. Vui lòng thử lại.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  editRole(user: UserRole) {
    this.errorMessage.set(null);
    this.editingId.set(user.id || null);
    this.roleForm.patchValue({
      email: user.email,
      role: user.role
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.errorMessage.set(null);
    this.editingId.set(null);
    this.roleForm.reset();
  }

  async deleteRole(id: string) {
    this.deletingId.set(id);
    this.errorMessage.set(null);
  }

  cancelDelete() {
    this.deletingId.set(null);
  }

  async executeDelete(id: string) {
    try {
      this.isSubmitting.set(true);
      const docRef = doc(this.firestore, 'Roles', id);
      await deleteDoc(docRef);
      this.deletingId.set(null);
      await this.fetchUsers();
    } catch (error) {
      console.error('Error deleting role:', error);
      this.errorMessage.set('Lỗi khi xóa quyền. Vui lòng thử lại.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
