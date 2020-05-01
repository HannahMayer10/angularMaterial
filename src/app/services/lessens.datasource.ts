import { DataSource } from "@angular/cdk/table";
import { CollectionViewer } from "@angular/cdk/collections";
import { Lesson } from "../model/lesson";
import { Observable, BehaviorSubject, of } from "rxjs";
import { CoursesService } from "./courses.service";
import { catchError, finalize } from "rxjs/operators";

export class LessonsDatasource implements DataSource<Lesson> {
  private lessonsSubject = new BehaviorSubject<Lesson[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private coursesService: CoursesService) {}

  loadLessons(
    courseId: number,
    filter: string,
    sortDirection: string,
    pageIndex: number,
    pageSize: number
  ) {
    this.loadingSubject.next(true);
    this.coursesService
      .findLessons(courseId, filter, sortDirection, pageIndex, pageSize)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((lessons) => this.lessonsSubject.next(lessons));
  }

  connect(collectionViewer: CollectionViewer): Observable<Lesson[]> {
    return this.lessonsSubject.asObservable();
  }
  disconnect(collectionViewer: CollectionViewer): void {
    this.lessonsSubject.complete();
    this.loadingSubject.complete();
  }
}
