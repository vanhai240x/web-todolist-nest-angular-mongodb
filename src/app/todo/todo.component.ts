import { Component, OnInit } from '@angular/core';
import { TodoService } from './services/todo.service';
import * as moment from 'moment';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface ITodo {
  title: string;
  description: string;
  deadline: any;
  status: string;
  originItem: any;
}

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss'],
})
export class TodoComponent implements OnInit {
  columns = [
    {
      columnDef: 'title',
      header: 'Tên công việc',
      cell: (element: ITodo) => `${element.title}`,
    },
    {
      columnDef: 'description',
      header: 'Mô tả',
      cell: (element: ITodo) => `${element.description}`,
    },
    {
      columnDef: 'deadline',
      header: 'Thời hạn',
      cell: (element: ITodo) => `${element.deadline}`,
    },
    {
      columnDef: 'status',
      header: 'Trạng thái',
      cell: (element: ITodo) => `${element.status}`,
    },
  ];
  dataSource: ITodo[] = [];
  displayedColumns = this.columns.map((c) => c.columnDef);
  reactiveForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl(''),
    deadline: new FormControl<Date | null>(null, Validators.required),
    status: new FormControl('', Validators.required),
  });
  statusList: { _id: string; title: string; code: string }[] = [];
  isTypeUpdate = false;
  itemSelected: any = null;

  constructor(private todoSvc: TodoService) {}

  ngOnInit(): void {
    this.getDataTable();
    this.todoSvc.getTodoStatus().subscribe((res: any) => {
      this.statusList = res.status;
    });
  }

  getDataTable() {
    this.todoSvc.getTodos().subscribe((res: any) => {
      if (res.todos.length) {
        this.dataSource = this.convertDataToTable(
          res.todos
        );
      }
    });
  }

  convertDataToTable(datas: ITodo[]) {
    let tmp: ITodo[] = [];
    datas.forEach((e) => {
      tmp.push({
        title: e.title,
        description: e.description || '---',
        deadline: moment(e.deadline * 1000)
          .locale('vi')
          .calendar(),
        status: e.status,
        originItem: e,
      });
    });
    return tmp;
  }

  onSubmit() {
    if(this.reactiveForm.valid) {
      let deadline = this.reactiveForm.value.deadline;
      let todo: any = {
        title: this.reactiveForm.value.title as string,
        description: this.reactiveForm.value.description as string,
        statusId: this.reactiveForm.value.status as string,
        deadline: deadline?.getTime()! / 1000,   // TODO: Convert Date to Timestamp
      }
      if(!this.isTypeUpdate) {
        this.todoSvc.createTodo(todo).subscribe(res => {
          this.getDataTable();
          this.reactiveForm.reset();
          this.isTypeUpdate = false;
        })
      } else {
        this.todoSvc.updateTodo(this.itemSelected._id, todo).subscribe(res => {
          this.getDataTable();
          this.reactiveForm.reset();
          this.isTypeUpdate = false;
        })
      }
    }
  }

  clickEdit(item: ITodo) {
    this.itemSelected = item.originItem;
    this.isTypeUpdate = true;
    this.reactiveForm.patchValue({
      title: this.itemSelected.title,
      description: this.itemSelected.description,
      status: this.itemSelected.statusId,
      deadline: new Date(this.itemSelected.deadline * 1000),
    })
  }

  onCancel() {
    this.isTypeUpdate = false;
    this.reactiveForm.reset();
  }

  onDelete() {
    this.todoSvc.deleteTodo(this.itemSelected._id).subscribe(res => {
      this.dataSource = [...this.dataSource].filter(item => {
        return item.originItem._id !== this.itemSelected._id;
      });
      this.isTypeUpdate = false;
      this.reactiveForm.reset();
    })
  }
}
