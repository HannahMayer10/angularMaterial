import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { ActivatedRoute } from "@angular/router";
import {
  tap,
  debounce,
  debounceTime,
  distinctUntilChanged,
} from "rxjs/operators";
import { Course } from "../model/course";
import { CoursesService } from "../services/courses.service";
import { LessonsDatasource } from "../services/lessens.datasource";
import { MatSort } from "@angular/material/sort";
import { merge, fromEvent } from "rxjs";
import { MatInput } from "@angular/material/input";

@Component({
  selector: "course",
  templateUrl: "./course.component.html",
  styleUrls: ["./course.component.css"],
})
export class CourseComponent implements OnInit, AfterViewInit {
  course: Course;
  // dataSource = new MatTableDataSource([]);
  dataSource: LessonsDatasource;
  displayedColumns = ["seqNo", "description", "duration"];

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  @ViewChild("input")
  input: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private coursesService: CoursesService
  ) {}

  ngOnInit() {
    this.course = this.route.snapshot.data["course"];
    // this.coursesService
    //   .findAllCourseLessons(this.course.id)
    //   .subscribe((lessons) => (this.dataSource.data = lessons));

    this.dataSource = new LessonsDatasource(this.coursesService);
    this.dataSource.loadLessons(this.course.id, "", "asc", 0, 3);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
    });

    fromEvent(this.input.nativeElement, "keyup")
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.newData();
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        // startWith(null), //will load Lessons
        tap(() => this.newData())
      )
      .subscribe();
  }

  newData() {
    this.dataSource.loadLessons(
      this.course.id,
      this.input.nativeElement.value,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }
}
