import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {AuthService} from '../../../../code/auth/auth.service';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  status: 'available' | 'borrowed' | 'reserved';
  publishYear: number;
  description: string;
  coverColor: string;
  borrowerName?: string;
  borrowedDate?: string;
}

@Component({
  selector: 'app-book',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './book.html',
  styleUrl: './book.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Book {
  authService = inject(AuthService);
  private router = inject(Router);

  // Filter signals
  searchQuery = signal('');
  selectedCategory = signal('all');
  isAddFormOpen = signal(false);

  // Book catalog signal
  books = signal<BookItem[]>([
    {
      id: 'BK-101',
      title: 'Thiết Kế Hệ Thống Quy Mô Lớn (System Design)',
      author: 'Alex Xu',
      category: 'Kỹ thuật',
      isbn: '978-0134494164',
      status: 'available',
      publishYear: 2022,
      description: 'Cẩm nang toàn diện về thiết kế hệ thống phân tán chịu tải cao và kiến trúc microservices.',
      coverColor: 'bg-emerald-600',
    },
    {
      id: 'BK-102',
      title: 'Clean Architecture: Hướng Dẫn Kiến Trúc Phần Mềm',
      author: 'Robert C. Martin',
      category: 'Kỹ thuật',
      isbn: '978-0134494166',
      status: 'borrowed',
      publishYear: 2018,
      description: 'Các nguyên lý thiết kế ứng dụng bền vững, dễ bảo trì và mở rộng theo chuẩn quốc tế.',
      coverColor: 'bg-blue-600',
      borrowerName: 'admin@ishipto.vn',
      borrowedDate: '2025-05-10',
    },
    {
      id: 'BK-103',
      title: 'Quản Trị Tinh Gọn (The Lean Startup)',
      author: 'Eric Ries',
      category: 'Kinh doanh',
      isbn: '978-0307887894',
      status: 'available',
      publishYear: 2019,
      description: 'Phương pháp xây dựng và phát triển doanh nghiệp công nghệ thích ứng linh hoạt và bền vững.',
      coverColor: 'bg-amber-600',
    },
    {
      id: 'BK-104',
      title: 'Tâm Lý Học Về Tiền (The Psychology of Money)',
      author: 'Morgan Housel',
      category: 'Kinh doanh',
      isbn: '978-0857197689',
      status: 'available',
      publishYear: 2021,
      description: 'Bài học vượt thời gian về sự giàu có, lòng tham và hạnh phúc.',
      coverColor: 'bg-purple-600',
    },
    {
      id: 'BK-105',
      title: 'Bắt Đầu Với Câu Hỏi Tại Sao (Start With Why)',
      author: 'Simon Sinek',
      category: 'Kỹ năng',
      isbn: '978-1591846444',
      status: 'reserved',
      publishYear: 2020,
      description: 'Cách các nhà lãnh đạo vĩ đại truyền cảm hứng cho mọi người hành động.',
      coverColor: 'bg-rose-600',
      borrowerName: 'Team Logistics',
    },
  ]);

  // Reactive form for adding a new book
  bookForm = new FormGroup({
    title: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    author: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    category: new FormControl('Kỹ thuật', {nonNullable: true, validators: [Validators.required]}),
    isbn: new FormControl('', {nonNullable: true}),
    publishYear: new FormControl(new Date().getFullYear(), {nonNullable: true}),
    status: new FormControl<'available' | 'borrowed' | 'reserved'>('available', {nonNullable: true}),
    description: new FormControl('', {nonNullable: true}),
  });

  // Derived filtered books
  filteredBooks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    const list = this.books();

    return list.filter(book => {
      const matchQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.id.toLowerCase().includes(query);

      const matchCategory = cat === 'all' || book.category === cat;

      return matchQuery && matchCategory;
    });
  });

  // Statistics
  totalBooksCount = computed(() => this.books().length);
  availableBooksCount = computed(() => this.books().filter(b => b.status === 'available').length);
  borrowedBooksCount = computed(() => this.books().filter(b => b.status === 'borrowed').length);

  categories = ['all', 'Kỹ thuật', 'Kinh doanh', 'Kỹ năng', 'Vận hành'];

  goToWorkflow() {
    this.router.navigate(['/admin/workflow']);
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  toggleAddForm() {
    this.isAddFormOpen.update(v => !v);
  }

  submitBook() {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const formVal = this.bookForm.getRawValue();
    const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-amber-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newBook: BookItem = {
      id: `BK-${Math.floor(100 + Math.random() * 900)}`,
      title: formVal.title,
      author: formVal.author,
      category: formVal.category,
      isbn: formVal.isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      status: formVal.status,
      publishYear: Number(formVal.publishYear) || new Date().getFullYear(),
      description: formVal.description || 'Không có mô tả chi tiết.',
      coverColor: randomColor,
    };

    this.books.update(list => [newBook, ...list]);
    this.bookForm.reset({
      title: '',
      author: '',
      category: 'Kỹ thuật',
      isbn: '',
      publishYear: new Date().getFullYear(),
      status: 'available',
      description: '',
    });
    this.isAddFormOpen.set(false);
  }

  toggleBorrowStatus(bookId: string) {
    this.books.update(list =>
      list.map(b => {
        if (b.id !== bookId) return b;
        if (b.status === 'available') {
          return {
            ...b,
            status: 'borrowed',
            borrowerName: 'Người dùng hiện tại',
            borrowedDate: new Date().toISOString().slice(0, 10),
          };
        } else {
          return {
            ...b,
            status: 'available',
            borrowerName: undefined,
            borrowedDate: undefined,
          };
        }
      })
    );
  }

  deleteBook(bookId: string) {
    this.books.update(list => list.filter(b => b.id !== bookId));
  }
}
