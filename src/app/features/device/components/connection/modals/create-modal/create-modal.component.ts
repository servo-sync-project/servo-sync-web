import { CommonModule } from "@angular/common";
import { Component, OnChanges, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgHeroiconsModule } from "@dimaslz/ng-heroicons";
import { CreateRobotRequest } from "../../../../models/RobotRequest";
import { RobotResponse } from "../../../../models/RobotResponse";
import { RobotService } from "../../../../services/robot.service";


@Component({
    selector: 'app-create-modal',
    imports: [CommonModule, FormsModule, RouterModule, NgHeroiconsModule],
    templateUrl: './create-modal.component.html',
    styleUrl: './create-modal.component.css'
})
export class CreateModalComponent implements OnChanges{
  @Input() openModal!: boolean;
  @Output() response = new EventEmitter<RobotResponse>();
  @Output() modalClosed = new EventEmitter<void>();
  @ViewChild('createModal') createModal!: ElementRef<HTMLDialogElement>;

  errorMessage: string | null = null;
  request: CreateRobotRequest = {
    botname: "",
    description: "",
  };

  constructor(
    private robotService: RobotService
  ) {}

  ngOnChanges(): void {
    if (this.openModal) {
      this.createModal.nativeElement.showModal();
    }
  }

  // Método para cerrar el modal
  closeModal(): void {
    this.createModal.nativeElement.close();
    this.errorMessage = null;
    this.modalClosed.emit();
  }

  createRobot(): void {
    if (!this.request.botname || !this.request.description) {
      this.errorMessage = 'All fields are required.';
      return;
    }

    this.robotService.createRobot(this.request).subscribe({
      next: (response: RobotResponse) => {
        console.log(response);
        this.response.emit(response); 
        this.closeModal(); 
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
      }
    });
  }
}

