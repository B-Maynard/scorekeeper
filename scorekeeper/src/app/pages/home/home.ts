import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { OptionsService } from '../../services/options.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    ButtonModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  public options: any = [];

  constructor(
     private optionsService: OptionsService,
     private router: Router
  ) {}
  

  ngOnInit(): void {
    this.options = this.optionsService.getOptions();
  }

  navigateTo(route: any) {
    this.router.navigateByUrl(route);
  }


}
