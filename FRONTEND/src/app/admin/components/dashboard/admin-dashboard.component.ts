import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loyersCanvas') loyersCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('boutiquesCanvas') boutiquesCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('emplacementsCanvas') emplacementsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('appelsCanvas') appelsCanvas!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private charts: Chart[] = [];

  loading = true;
  error = '';
  data: any = null;

  get kpis() { return this.data?.kpis || {}; }

  ngOnInit() { this.loadDashboard(); }
  ngAfterViewInit() {}

  loadDashboard() {
    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    this.http.get(`${environment.apiUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.data = res;
        this.loading = false;
        setTimeout(() => this.initCharts(), 100);
      },
      error: (err) => {
        this.error = err?.error?.erreur || 'Erreur de chargement du tableau de bord';
        this.loading = false;
      }
    });
  }

  private destroyCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  initCharts() {
    this.destroyCharts();
    if (!this.data) return;
    this.buildLoyersChart();
    this.buildBoutiquesChart();
    this.buildEmplacementsChart();
    this.buildAppelsChart();
  }

  private buildLoyersChart() {
    const canvas = this.loyersCanvas?.nativeElement;
    if (!canvas) return;
    const mois = this.data.loyersParMois || [];
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: mois.map((m: any) => m.label),
        datasets: [
          {
            label: 'Loyers payés (Ar)',
            data: mois.map((m: any) => m.montantPaye),
            backgroundColor: 'rgba(54,96,169,0.75)',
            borderColor: '#3660a9',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'yMontant',
          },
          {
            label: 'Nb payés',
            data: mois.map((m: any) => m.countPaye),
            type: 'line' as any,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.1)',
            borderWidth: 2.5,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            yAxisID: 'yCount',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ctx.dataset.yAxisID === 'yMontant'
                ? ` ${new Intl.NumberFormat('fr-FR').format(ctx.parsed.y)} Ar`
                : ` ${ctx.parsed.y} paiement(s)`
            }
          }
        },
        scales: {
          yMontant: {
            type: 'linear', position: 'left',
            ticks: { callback: (v: any) => `${Number(v) >= 1000 ? (Number(v)/1000).toFixed(0)+'k' : v} Ar`, font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          yCount: {
            type: 'linear', position: 'right',
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildBoutiquesChart() {
    const canvas = this.boutiquesCanvas?.nativeElement;
    if (!canvas) return;
    const data = this.data.boutiquesParStatut || [];
    const labels = data.map((d: any) => this.boutiqueStatutLabel(d._id));
    const counts = data.map((d: any) => d.count);
    const colors = data.map((d: any) => this.boutiqueStatutColor(d._id));
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{ data: counts, backgroundColor: colors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 12 }, usePointStyle: true, padding: 12 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed} boutique${ctx.parsed > 1 ? 's' : ''}` } }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildEmplacementsChart() {
    const canvas = this.emplacementsCanvas?.nativeElement;
    if (!canvas) return;
    const data = this.data.emplacementsParType || [];
    const typeColors: Record<string, string> = {
      box: '#3660a9', kiosque: '#10b981', zone_loisirs: '#f59e0b',
      zone_commune: '#8b5cf6', pop_up: '#ef4444', autre: '#9ca3af'
    };
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map((d: any) => this.emplacementTypeLabel(d._id)),
        datasets: [{
          label: 'Emplacements',
          data: data.map((d: any) => d.count),
          backgroundColor: data.map((d: any) => typeColors[d._id] || '#9ca3af'),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.formattedValue} emplacement(s)` } }
        },
        scales: {
          x: { ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { ticks: { font: { size: 11 } }, grid: { display: false } }
        }
      }
    });
    this.charts.push(chart);
  }

  private buildAppelsChart() {
    const canvas = this.appelsCanvas?.nativeElement;
    if (!canvas) return;
    const data = this.data.appelsParStatut || [];
    const statutColors: Record<string, string> = { ouvert: '#10b981', ferme: '#9ca3af', attribue: '#3660a9' };
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: data.map((d: any) => this.appelStatutLabel(d._id)),
        datasets: [{
          data: data.map((d: any) => d.count),
          backgroundColor: data.map((d: any) => statutColors[d._id] || '#9ca3af'),
          borderWidth: 2, borderColor: '#fff', hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 12 }, usePointStyle: true, padding: 12 } },
          tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.parsed} appel(s)` } }
        }
      }
    });
    this.charts.push(chart);
  }

  boutiqueStatutLabel(s: string): string {
    const map: Record<string, string> = { active: 'Active', en_attente: 'En attente', fermee: 'Fermée' };
    return map[s] || s;
  }
  boutiqueStatutColor(s: string): string {
    const map: Record<string, string> = { active: '#10b981', en_attente: '#f59e0b', fermee: '#ef4444' };
    return map[s] || '#9ca3af';
  }
  emplacementTypeLabel(t: string): string {
    const map: Record<string, string> = { box: 'Box', kiosque: 'Kiosque', zone_loisirs: 'Zone loisirs', zone_commune: 'Zone commune', pop_up: 'Pop-up', autre: 'Autre' };
    return map[t] || t;
  }
  appelStatutLabel(s: string): string {
    const map: Record<string, string> = { ouvert: 'Ouvert', ferme: 'Fermé', attribue: 'Attribué' };
    return map[s] || s;
  }
  formatMontant(v: number): string {
    if (!v) return '0 Ar';
    return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' Ar';
  }

  ngOnDestroy() { this.destroyCharts(); }
}

