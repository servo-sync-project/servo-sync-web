import { CommonModule } from "@angular/common";
import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { RobotResponse } from "../../../../models/RobotResponse";
import { RobotService } from "../../../../services/robot.service";

@Component({
    selector: 'app-delete-modal',
    imports: [CommonModule, FormsModule, RouterModule, NgHeroiconsModule],
    templateUrl: './delete-modal.component.html',
    styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnChanges{
  @Input() robot!: RobotResponse | null;
  @Input() openModal!: boolean;
  @Output() response = new EventEmitter<number>(); // Emite el nuevo robot al componente principal
  @Output() modalClosed = new EventEmitter<void>(); // Emite cuando se cierra el modal
  @ViewChild('deleteModal') deleteModal!: ElementRef<HTMLDialogElement>;
  
  errorMessage: string | null = null;
  
  constructor(
    private robotService: RobotService
  ){}

  ngOnChanges(): void {
    if (this.robot && this.openModal) {
      this.deleteModal.nativeElement.showModal();
    }
  }
  
  // Método para cerrar el modal
  closeModal(): void {
    this.deleteModal.nativeElement.close();
    this.errorMessage = null;
    this.modalClosed.emit();
  }

  deleteRobot() {
    if(!this.robot) return;
    console.log(this.robot);
    this.robotService.deleteRobotById(this.robot.id).subscribe({
      next: (response: boolean) => {
        console.log(response);
        this.response.emit(this.robot?.id);
        this.closeModal();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    })
  }
}
