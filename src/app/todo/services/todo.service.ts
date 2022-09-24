import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {

  constructor(private httpClient: HttpClient) { }

  getTodos() {
    return this.httpClient.get(`${environment.baseApi}/todos`);
  }

  getTodoStatus() {
    return this.httpClient.get(`${environment.baseApi}/todos/status`);
  }

  createTodo(todo: any) {
    return this.httpClient.post(`${environment.baseApi}/todos`, todo);
  }

  updateTodo(id: string, todo: any) {
    return this.httpClient.put(`${environment.baseApi}/todos/${id}`, todo);
  }

  deleteTodo(id: string) {
    return this.httpClient.delete(`${environment.baseApi}/todos/${id}`,);
  }
}
