import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CentresService } from '../../services/centres.service';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './centres-list.component.html',
  styleUrls: ['./centres-list.component.scss']
})
export class CentresListComponent implements OnInit {
  centresCount = 0;
  batimentsCount = 0;
  etagesCount = 0;
  emplacementsCount = 0;

  constructor(private centresService: CentresService) {}

  ngOnInit() {
    this.loadCounts();
  }

  loadCounts() {
    this.centresService.getAllCentres().subscribe(centres => {
      this.centresCount = centres.length;
    });

    this.centresService.getBatiments().subscribe(batiments => {
      this.batimentsCount = batiments.length;
    });

    this.centresService.getEtages().subscribe(etages => {
      this.etagesCount = etages.length;
    });

    this.centresService.getEmplacements().subscribe(emplacements => {
      this.emplacementsCount = emplacements.length;
    });
  }
}
