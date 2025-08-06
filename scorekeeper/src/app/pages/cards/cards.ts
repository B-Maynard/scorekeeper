import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardsService } from '../../services/cards.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-cards',
  imports: [
    TableModule,
    ButtonModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './cards.html',
  styleUrl: './cards.scss'
})
export class Cards implements OnInit {

  public playerData: any = [];

  constructor(
    public cardsService: CardsService,
    private confirmService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.playerData = this.cardsService.getGameData();
  }

  addPlayer() {
    this.playerData.push({
      name: "",
      points: 0,
      notes: ""
    });

    this.cardsService.saveGameData(this.playerData);
  }

  resetGame(event: Event) {

    this.confirmService.confirm({
            target: event.target as EventTarget,
            message: 'Reset game data?',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'No',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Yes',
            },
            accept: () => {
                this.playerData = [];
                localStorage.clear();
            },
            reject: () => {
            },
        });
  }
}
