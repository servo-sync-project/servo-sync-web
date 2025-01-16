import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule, Router } from "@angular/router";
import { RobotResponse } from "../../models/RobotResponse";
import { RobotService } from "../../services/robot.service";
import { ConfigModalComponent } from "./modals/config-modal/config-modal.component";
import { CreateModalComponent } from "./modals/create-modal/create-modal.component";
import { DeleteModalComponent } from "./modals/delete-modal/delete-modal.component";
import { UpdateModalComponent } from "./modals/update-modal/update-modal.component";

@Component({
  selector: 'app-connection',
  imports: [CommonModule, FormsModule, RouterModule, CreateModalComponent, UpdateModalComponent, DeleteModalComponent, ConfigModalComponent],
  templateUrl: './connection.component.html',
  styleUrl: './connection.component.css'
})
export class ConnectionComponent implements OnInit {
  errorMessage: string = ""
  robots: RobotResponse[] = []

  selectedRobot: RobotResponse | null = null
  openCreateModal: boolean = false;
  openUpdateModal: boolean = false;
  openDeleteModal: boolean = false;
  openConfigModal: boolean = false;

  constructor(
    private robotService: RobotService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadAllRobotsByMy();
  }

  loadAllRobotsByMy() {
    this.robotService.getAllRobotsByMy().subscribe({
      next: (response: RobotResponse[]) => {
        console.log(response);
        this.robots = response;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  // Función para actualizar un objeto
  updateRobot(newRobot: RobotResponse) {
    const index = this.robots.findIndex(robot => robot.id === newRobot.id);
    if (index !== -1) {
      this.robots[index] = newRobot;
    }
  }

  // Función para eliminar un objeto por su id
  deleteRobot(robotId: number) {
    this.robots = this.robots.filter(robot => robot.id !== robotId);
  }

  // Función para agregar un nuevo objeto
  createRobot(newRobot: RobotResponse) {
    this.robots.push(newRobot);
  }

  configureRobot(robot: RobotResponse) {
    if (!robot.initial_position) {
      this.selectRobot(robot);
      this.openConfigModal = true;
      return;
    }
    this.toConfigView(robot)
  }

  toConfigView(robot: RobotResponse) {
    this.router.navigate(['/device/config'], { queryParams: { uuid: robot.unique_uid } });
  }

  toControlView(robot: RobotResponse) {
    this.router.navigate(['/device/control'], { queryParams: { uuid: robot.unique_uid } });
  }

  selectRobot(robot: RobotResponse) {
    this.selectedRobot = { ...robot }; // Copia el robot seleccionado
  }
}
