import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-cards',
  imports: [
    TableModule
  ],
  templateUrl: './cards.html',
  styleUrl: './cards.scss'
})
export class Cards implements OnInit {

  public playerData: any = [];

  ngOnInit(): void {
    
  }

}
