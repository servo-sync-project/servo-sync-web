import { CommonModule } from "@angular/common";
import { Component, OnInit, Inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router, ActivatedRoute } from "@angular/router";
import { MovementResponse } from "../../models/MovementResponse";
import { RobotResponse } from "../../models/RobotResponse";
import { MovementService } from "../../services/movement.service";
import { RobotService } from "../../services/robot.service";

@Component({
    selector: 'app-control',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './control.component.html',
    styleUrl: './control.component.css'
})
export class ControlComponent implements OnInit {
  errorMessage: string | null = null;
  uniqueUid: string | null = null;
  robot: RobotResponse | null = null;
  movements: MovementResponse[] = [];
  constructor(
    private robotService: RobotService,
    private movementService: MovementService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.uniqueUid = params['uuid'];
      if (!this.uniqueUid) {
        this.router.navigate(['/connection']);
        return;
      }
      console.log('Robot UUID:', this.uniqueUid);
      this.loadRobot();
    });

  }

  loadRobot() {
    this.robotService.getRobotByUniqueUid(this.uniqueUid!).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.robot = response
        this.loadMovements();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.router.navigate(['/connection']);
      }
    })
  }

  loadMovements() {
    this.movementService.getAllMovementsByRobotId(this.robot!.id).subscribe({
      next: (response: MovementResponse[]) => {
        console.log(response);
        this.movements=response;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  buttonAtPosition(x: number, y: number) {
    return this.movements.find(movement => movement.coordinates?.coord_x === x && movement.coordinates?.coord_y === y) || null;
  }

  executeMovement(selectedMoveId: number) {
    if (!this.robot) return;
    this.robotService.executeMovementByIdAndYourId(this.robot.id, selectedMoveId).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  moveToInitialPosition() {
    if (!this.robot) return;
    this.robotService.moveToInitialPositionById(this.robot.id).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
