
# Score Keeper (Angular)

Three modes on the homepage:
- **Cards**: players with notes and custom +/- amounts.
- **Teams**: unlimited teams, +/-1 or custom amount.
- **Tournament**: bracket with any number of entrants, click a slot to advance; BYEs auto-advance; simple animation on advance.

## Run it
```bash
npm i -g @angular/cli
npm i
npm start
```
Then open http://localhost:4200

## Notes
- Angular 17 standalone components (no NgModule) and simple in-component history stacks for **Undo** and **Reset**.
- Tournament makes a single-elimination bracket, padding with BYEs to the next power of two.
