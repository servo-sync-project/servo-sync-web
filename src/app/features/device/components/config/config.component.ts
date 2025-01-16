import { CommonModule } from "@angular/common"
import { Component, OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { RouterModule, Router, ActivatedRoute } from "@angular/router"
import { CoordinatesJson } from "../../models/CoordinatesJson"
import { CreateMovementRequest, UpdateMovementRequest } from "../../models/MovementRequest"
import { MovementResponse } from "../../models/MovementResponse"
import { PositionJson } from "../../models/PositionJson"
import { CreatePositionRequest, UpdatePositionRequest } from "../../models/PositionRequest"
import { PositionResponse } from "../../models/PositionResponse"
import { UpdateInitialPositionRequest, UpdateCurrentPositionRequest } from "../../models/RobotRequest"
import { RobotResponse } from "../../models/RobotResponse"
import { ServoGroupJson } from "../../models/ServoGroupJson"
import { ServoGroupResponse } from "../../models/ServoGroupResponse"
import { MovementService } from "../../services/movement.service"
import { PositionService } from "../../services/position.service"
import { RobotService } from "../../services/robot.service"
import { ServoGroupService } from "../../services/servo-group.service"
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons"
import { UpdateServoGroupNameRequest } from "../../models/ServoGroupRequest"

@Component({
  selector: 'app-config',
  imports: [CommonModule, FormsModule, RouterModule, NgHeroiconsModule],
  templateUrl: './config.component.html',
  styleUrl: './config.component.css'
})
export class ConfigComponent implements OnInit {
  robot: RobotResponse | null = null
  rightServoGroups: ServoGroupJson[] = []
  middleServoGroups: ServoGroupJson[] = []
  leftServoGroups: ServoGroupJson[] = []

  uniqueUid: string = "";
  errorMessage: string | null = null;
  // Definir los IDs de los movimientos
  advanceMovementId: number = 6;
  turnRightMovementId: number = 5;
  turnLeftMovementId: number = 4;

  selectedMovement: MovementResponse | null = null; // Inicializado como null para evitar errores
  newMovementName: string = "";
  movements: MovementResponse[] = [];
  positions: PositionResponse[] = []; // Ajuste aquí
  selectedPosition: PositionResponse | null = null; // Ajuste aquí
  delay: number = 400;

  editingName: boolean = false;
  editingGroupId: number | null = null;
  newGroupName: string = "";

  selectedImageFile: File | null = null;
  isLoading: boolean = false;

  //table: number[][] = [];
  selectedCoordinates: CoordinatesJson | null = null;
  coordinateTable: number[][] = Array.from({ length: 4 }, () => Array.from({ length: 9 }, () => 0));

  constructor(
    private robotService: RobotService,
    private servoGroupService: ServoGroupService,
    private movementService: MovementService,
    private positionService: PositionService,
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

  toggleCoordinate(coordX: number, coordY: number, isChecked: boolean) {
    if (isChecked) {
      this.selectedCoordinates = { coord_x: coordX, coord_y: coordY };
    } else {
      this.selectedCoordinates = null;
    }
    console.log('Coordenada seleccionada:', this.selectedCoordinates);
  }

  isCoordinateChecked(coordX: number, coordY: number): boolean {
    return this.selectedCoordinates !== null && this.selectedCoordinates.coord_x === coordX && this.selectedCoordinates.coord_y === coordY;
  }

  // Método para seleccionar una única fila
  togglePosition(position: PositionResponse) {
    if (this.selectedPosition?.id === position.id) {
      this.selectedPosition = null; // Deseleccionar la fila
    } else {
      this.selectedPosition = position; // Selecciona la nueva fila
    }
    console.log('Posición seleccionada:', this.selectedPosition);
  }

  // Verificar si la fila está seleccionada
  isPositionSelected(position: PositionResponse): boolean {
    return this.selectedPosition?.id === position.id;
  }

  loadRobot() {
    this.robotService.getRobotByUniqueUid(this.uniqueUid).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.robot = response
        if (!this.robot.initial_position) {
          this.errorMessage = "Robot sin servos"
          this.router.navigate(['/connection']);
        }
        this.loadServosGroups();
        this.loadMovements();

      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.router.navigate(['/connection']);
      }
    })
  }

  loadServosGroups() {
    if (!this.robot) return;
    this.servoGroupService.getAllServoGroupsByRobotId(this.robot.id).subscribe({
      next: (response: ServoGroupResponse[]) => {
        console.log(response);
        const rightServoGroups = response.filter(group => group.column === "right");
        const middleServoGroups = response.filter(group => group.column === "middle");
        const leftServoGroups = response.filter(group => group.column === "left");

        const rightServosCount = rightServoGroups.reduce((sum, group) => sum + group.num_servos, 0);
        const middleServosCount = middleServoGroups.reduce((sum, group) => sum + group.num_servos, 0);
        const leftServosCount = leftServoGroups.reduce((sum, group) => sum + group.num_servos, 0);

        const totalServos = rightServosCount + middleServosCount + leftServosCount;

        this.rightServoGroups = this.reponseToServoGroupsJson(rightServoGroups, totalServos - middleServosCount - leftServosCount);
        this.middleServoGroups = this.reponseToServoGroupsJson(middleServoGroups, totalServos - leftServosCount);
        this.leftServoGroups = this.reponseToServoGroupsJson(leftServoGroups, totalServos);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.router.navigate(['/connection']);
      }
    })

  }

  reponseToServoGroupsJson(servoGroups: ServoGroupResponse[], startId: number): ServoGroupJson[] {
    let servoAngleId = startId;
    return servoGroups.map(servoGroup => ({
      id: servoGroup.id,
      name: servoGroup.name,
      servo_angles: Array.from({ length: servoGroup.num_servos }).map(() => {
        const servoAngle = {
          id: servoAngleId,
          angle: this.robot?.current_position?.angles[servoAngleId - 1] ?? 180,
        };
        servoAngleId--;
        return servoAngle;
      }),
    }));
  }

  loadMovements() {
    if (!this.robot) return;
    this.movementService.getAllMovementsByRobotId(this.robot.id).subscribe({
      next: (response: MovementResponse[]) => {
        console.log(response);
        this.movements = response;
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  loadPositions() {
    if (!this.selectedMovement) return;
    this.positionService.getAllPositionsByMovementId(this.selectedMovement.id).subscribe({
      next: (response: PositionResponse[]) => {
        console.log(response);
        this.positions = response;
        this.newMovementName = this.selectedMovement?.name ?? "";
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updateAndMoveToInitialPosition() {
    if (!this.robot) return;
    const request: UpdateInitialPositionRequest = {
      initial_position: {
        delay: this.delay,
        angles: [
          ...this.rightServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
          ...this.middleServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
          ...this.leftServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse()
        ]
      }
    }
    this.robotService.updateAndmoveToInitialPositionById(this.robot.id, request).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.robot = response;
        this.loadServosGroups();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  moveToInitialPosition() {
    if (!this.robot) return;
    this.robotService.moveToInitialPositionById(this.robot.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
        this.loadServosGroups();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  createMovement() {
    if (!this.robot) return;
    if (!this.newMovementName) return;
    const request: CreateMovementRequest = {
      name: this.newMovementName,
      coordinates: this.selectedCoordinates,
      robot_id: this.robot.id
    }
    this.movementService.createMovement(request).subscribe({
      next: (response: MovementResponse) => {
        console.log(response);
        this.loadMovements();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updateMovement() {
    if (!this.robot) return;
    if (!this.newMovementName || !this.selectedMovement) return;
    const request: UpdateMovementRequest = {
      name: this.newMovementName,
      coordinates: this.selectedCoordinates
    }
    this.movementService.updateMovementById(this.selectedMovement.id, request).subscribe({
      next: (response: MovementResponse) => {
        console.log(response);
        this.loadMovements();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  deleteMovement() {
    if (!this.selectedMovement) return;
    this.movementService.deleteMovementById(this.selectedMovement.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
        this.loadMovements();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  executeMovement() {
    if (!this.robot || !this.selectedMovement) return;
    this.robotService.executeMovementByIdAndYourId(this.robot.id, this.selectedMovement.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  createPosition() {
    if (!this.selectedMovement) return;
    const request: CreatePositionRequest = {
      delay: this.delay,
      angles: [
        ...this.rightServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.middleServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.leftServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse()
      ],
      movement_id: this.selectedMovement.id
    }
    this.positionService.createPosition(request).subscribe({
      next: (response: PositionResponse) => {
        console.log(response);
        this.loadPositions();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updatePosition() {
    if (!this.selectedPosition) return;
    const request: UpdatePositionRequest = {
      delay: this.delay,
      angles: [
        ...this.rightServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.middleServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.leftServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse()
      ]
    }
    this.positionService.updatePositionById(this.selectedPosition.id, request).subscribe({
      next: (response: PositionResponse) => {
        console.log(response);
        this.loadPositions();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  deletePosition() {
    if (!this.selectedPosition) return;
    this.positionService.deletePositionById(this.selectedPosition.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
        this.loadPositions();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  movePositionDown() {
    if (!this.selectedPosition) return;
    this.positionService.increasePositionSequenceById(this.selectedPosition.id).subscribe({
      next: (response: PositionResponse) => {
        console.log(response);
        this.loadPositions();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  movePositionUp() {
    if (!this.selectedPosition) return;
    this.positionService.decreasePositionSequenceById(this.selectedPosition.id).subscribe({
      next: (response: PositionResponse) => {
        console.log(response);
        this.loadPositions();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  moveToPosition() {
    if (!this.robot || !this.selectedPosition) return;
    this.robotService.moveToPositionByIdAndYourId(this.robot.id, this.selectedPosition.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updateAndMoveToCurrentPosition() {
    if (!this.robot) return;
    const newCurrent: PositionJson = {
      delay: this.delay,
      angles: [
        ...this.rightServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.middleServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
        ...this.leftServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse()
      ]
    };

    const request: UpdateCurrentPositionRequest = {
      current_position: newCurrent,
    };

    this.robotService.updateAndMoveToCurrentPositionById(this.robot.id, request).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  saveMovementInLocal() {
    if (!this.robot || !this.selectedMovement) return;
    this.robotService.saveMovementInLocalByIdAndYourId(this.robot.id, this.selectedMovement.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  deleteMovementInLocal() {
    if (!this.robot || !this.selectedMovement) return;
    this.robotService.deleteMovementInLocalByIdAndYourId(this.robot.id,this.selectedMovement.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  saveInitialPositionInLocal() {
    if (!this.robot) return;
    this.robotService.saveInitialPositionInLocalById(this.robot.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  clearLocalStorage() {
    if (!this.robot) return;
    this.robotService.clearLocalStorageById(this.robot.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updateServoGroupName(servoGroupSelected: ServoGroupJson) {
    const request: UpdateServoGroupNameRequest = {
      name: this.newGroupName
    }

    this.servoGroupService.updateServoGroupNameById(servoGroupSelected.id, request).subscribe({
      next: (response: ServoGroupResponse) => {
        console.log('Group name updated');
        this.loadServosGroups();
        this.cancelEditing();
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.cancelEditing();
      }
    });
  }

  startEditing(servoGroupSelected: ServoGroupJson) {
    this.editingName = true;
    this.editingGroupId = servoGroupSelected.id;
    this.newGroupName = servoGroupSelected.name; // Inicializar el nombre actual
  }

  cancelEditing() {
    this.editingName = false;
    this.editingGroupId = null;
    this.newGroupName = "";
  }

  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length == 0) return;
    const file = fileInput.files[0];
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Por favor, selecciona un archivo de imagen válido.';
      console.error('Archivo no válido seleccionado:', file);
      return;
    }
    this.selectedImageFile = file;
    this.errorMessage = null;
  }

  uploadImage(): void {
    if (!this.robot || !this.selectedImageFile || this.isLoading) return;

    this.errorMessage = null;
    this.isLoading = true;

    this.robotService.updateConfigImageById(this.robot.id, this.selectedImageFile).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.robot = response;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = 'Hubo un error al subir la imagen. Por favor, intenta nuevamente.';
      }
    })
  }
}
