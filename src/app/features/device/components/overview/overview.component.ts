import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { RobotResponseForAll } from "../../models/RobotResponse";
import { RobotService } from "../../services/robot.service";


@Component({
    selector: 'app-overview',
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './overview.component.html',
    styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit {


  errorMessage: string = ""
  robots: RobotResponseForAll[] = []
  constructor(
    private robotService: RobotService,
  ) { }

  ngOnInit(): void {
    this.loadAllRobotsByMy();
  }

  loadAllRobotsByMy() {
    this.robotService.getAllRobotsForAll().subscribe({
      next: (response: RobotResponseForAll[]) => {
        console.log(response);
        this.robots = response;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
