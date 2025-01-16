import { CommonModule } from "@angular/common";
import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { UpdateRobotRequest } from "../../../../models/RobotRequest";
import { RobotResponse } from "../../../../models/RobotResponse";
import { RobotService } from "../../../../services/robot.service";

@Component({
    selector: 'app-update-modal',
    imports: [CommonModule, FormsModule, RouterModule, NgHeroiconsModule],
    templateUrl: './update-modal.component.html',
    styleUrl: './update-modal.component.css'
})
export class UpdateModalComponent implements OnChanges{
  @Input() robot!: RobotResponse | null;
  @Input() openModal!: boolean;
  @Output() response = new EventEmitter<RobotResponse>(); // Emite el nuevo robot al componente principal
  @Output() modalClosed = new EventEmitter<void>(); // Emite cuando se cierra el modal
  @ViewChild('updateModal') updateModal!: ElementRef<HTMLDialogElement>;

  errorMessage: string | null = null;
  request: UpdateRobotRequest = {
    botname: "",
    description: ""
  };

  selectedImageFile: File | null = null;
  isLoading: boolean = false;

  constructor(
    private robotService: RobotService
  ) { }

  ngOnChanges(): void {
    if (this.openModal && this.robot) {
      this.request = {
        botname: this.robot.botname,
        description: this.robot.description,
      };
      this.updateModal.nativeElement.showModal();
    }
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.updateModal.nativeElement.close();
    this.errorMessage = null;
    this.modalClosed.emit();
  }

  updateRobot(): void {
    if(!this.robot) return;

    if (!this.request.botname || !this.request.description) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.robotService.updateRobotById(this.robot.id, this.request).subscribe({
      next: (response: RobotResponse) => {
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

    this.robotService.updateImageById(this.robot.id, this.selectedImageFile).subscribe({
      next: (response) => {
        console.log(response);
        this.robot=response;
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
