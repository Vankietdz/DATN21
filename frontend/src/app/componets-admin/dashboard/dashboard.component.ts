import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
imports: [ RouterOutlet, CommonModule, RouterLink,NgxPaginationModule] // nếu là standalone

})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
