import { CommonModule } from "@angular/common";
import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { UpdateCurrentPositionRequest, UpdateInitialPositionRequest } from "../../../../models/RobotRequest";
import { RobotResponse } from "../../../../models/RobotResponse";
import { ServoGroupJson } from "../../../../models/ServoGroupJson";
import { ColumnEnum, UpdateServoGroupNumServosRequest, CreateServoGroupRequest, UpdateServoGroupNameRequest } from "../../../../models/ServoGroupRequest";
import { ServoGroupResponse } from "../../../../models/ServoGroupResponse";
import { RobotService } from "../../../../services/robot.service";
import { ServoGroupService } from "../../../../services/servo-group.service";
import { PositionJson } from "../../../../models/PositionJson";


@Component({
  selector: 'app-config-modal',
  imports: [CommonModule, FormsModule, RouterModule, NgHeroiconsModule],
  templateUrl: './config-modal.component.html',
  styleUrl: './config-modal.component.css'
})
export class ConfigModalComponent implements OnChanges {
  @Input() robot!: RobotResponse | null;
  @Input() openModal!: boolean;
  @Output() response = new EventEmitter<RobotResponse>();
  @Output() modalClosed = new EventEmitter<void>();
  @ViewChild('configModal') configModal!: ElementRef<HTMLDialogElement>;

  errorMessage: string | null = null;

  rightServoCount: number = 0;
  middleServoCount: number = 0;
  leftServoCount: number = 0;

  rightServoGroups: ServoGroupJson[] = []
  middleServoGroups: ServoGroupJson[] = []
  leftServoGroups: ServoGroupJson[] = []

  rightColumn: ColumnEnum = ColumnEnum.RIGHT
  middleColumn: ColumnEnum = ColumnEnum.MIDDLE
  leftColumn: ColumnEnum = ColumnEnum.LEFT
  servoAngleId: number = 0;
  // servoGroupName: string = "";
  delay: number = 500;

  editingName: boolean = false;
  editingGroupId: number | null = null;
  newGroupName: string = "";

  selectedImageFile: File | null = null;
  isLoading: boolean = false;

  constructor(
    private robotService: RobotService,
    private servoGroupService: ServoGroupService
  ) { }

  ngOnChanges(): void {
    if (this.robot && this.openModal) {
      this.configModal.nativeElement.showModal();
      this.loadServosGroups(true);
    }
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.configModal.nativeElement.close();
    this.errorMessage = null;
    this.modalClosed.emit();
  }

  copyButtonContent() {
    if (!this.robot) return;
    const content = this.robot.unique_uid;
    navigator.clipboard.writeText(content).then(() => {
      console.log('Contenido copiado:', content);
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  loadServosGroups(executeMethod: boolean) {
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

        console.log(rightServosCount + ", " + middleServosCount + ", " + leftServosCount + ", ")
        const totalServos = rightServosCount + middleServosCount + leftServosCount;

        this.rightServoGroups = this.reponseToServoGroupsJson(rightServoGroups, totalServos - middleServosCount - leftServosCount);
        this.middleServoGroups = this.reponseToServoGroupsJson(middleServoGroups, totalServos - leftServosCount);
        this.leftServoGroups = this.reponseToServoGroupsJson(leftServoGroups, totalServos);

        if (executeMethod) this.updateAndMoveToCurrentPosition();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
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
          angle: this.robot?.current_position?.angles[servoAngleId - 1] ?? 90,
        };
        servoAngleId--;
        return servoAngle;
      }),
      sequence: servoGroup.sequence
    }));
  }

  createServo(servoGroupSelected: ServoGroupJson) {
    const request: UpdateServoGroupNumServosRequest = {
      num_servos: servoGroupSelected.servo_angles.length + 1
    }
    this.servoGroupService.updateServoGroupNumServosById(servoGroupSelected.id, request).subscribe({
      next: (response: ServoGroupResponse) => {
        this.loadServosGroups(true);//solo en estos casos llamar a updateAndMoveToCurrentPosition
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  deleteServo(servoGroupSelected: ServoGroupJson) {
    const request: UpdateServoGroupNumServosRequest = {
      num_servos: servoGroupSelected.servo_angles.length - 1
    }
    this.servoGroupService.updateServoGroupNumServosById(servoGroupSelected.id, request).subscribe({
      next: (response: ServoGroupResponse) => {
        this.loadServosGroups(true);//solo en estos casos llamar a updateAndMoveToCurrentPosition
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  createServoGroup(column: ColumnEnum) {
    if (!this.robot) return;
    const request: CreateServoGroupRequest = {
      name: "new group",
      num_servos: 0,
      column: column,
      robot_id: this.robot.id
    }
    this.servoGroupService.createServoGroup(request).subscribe({
      next: (response: ServoGroupResponse) => {
        this.loadServosGroups(false);//solo en estos casos llamar a updateAndMoveToCurrentPosition
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  deleteServoGroup(servoGroupSelected: ServoGroupJson) {
    this.servoGroupService.deleteServoGroup(servoGroupSelected.id).subscribe({
      next: (response: boolean) => {
        this.loadServosGroups(true);//solo en estos casos llamar a updateAndMoveToCurrentPosition
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  updateServoGroupName(servoGroupSelected: ServoGroupJson) {
    const request: UpdateServoGroupNameRequest = {
      name: this.newGroupName
    }

    this.servoGroupService.updateServoGroupNameById(servoGroupSelected.id, request).subscribe({
      next: (response: ServoGroupResponse) => {
        console.log('Group name updated');
        this.loadServosGroups(false);
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

  increaseServoGroupSequence(servoGroupSelected: ServoGroupJson) {
    this.servoGroupService.increaseServoGroupSequenceById(servoGroupSelected.id).subscribe({
      next: (response: ServoGroupResponse) => {
        console.log(response);
        this.loadServosGroups(false);
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
  }

  decreaseServoGroupSequence(servoGroupSelected: ServoGroupJson) {
    this.servoGroupService.decreaseServoGroupSequenceById(servoGroupSelected.id).subscribe({
      next: (response: ServoGroupResponse) => {
        console.log(response);
        this.loadServosGroups(false);
      },
      error: (error) => {
        this.errorMessage = error.message;
      }
    });
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
        this.robot = response;
        this.response.emit(response);
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }

  updateInitialPosition() {
    if (!this.robot) return;

    const request: UpdateInitialPositionRequest = {
      initial_position: {
        delay: this.delay,
        angles: [
          ...this.rightServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
          ...this.middleServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse(),
          ...this.leftServoGroups.flatMap(group => group.servo_angles.map(angleObj => angleObj.angle)).reverse()
        ]
      },
    };

    this.robotService.updateAndmoveToInitialPositionById(this.robot.id, request).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.response.emit(response);
        this.closeModal();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      },
    });
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
        this.response.emit(response);
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = 'Hubo un error al subir la imagen. Por favor, intenta nuevamente.';
      }
    })
  }
}
