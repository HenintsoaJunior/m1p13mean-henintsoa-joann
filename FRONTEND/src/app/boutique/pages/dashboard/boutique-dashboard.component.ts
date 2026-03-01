import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-boutique-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './boutique-dashboard.component.html',
  styleUrls: ['./boutique-dashboard.component.scss'],
})
export class BoutiqueDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('caJoursCanvas') caJoursCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statutsCanvas') statutsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProduitsCanvas') topProduitsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mouvementsCanvas') mouvementsCanvas!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private charts: Chart[] = [];

  loading = true;
  error = '';
  data: any = null;

  // Months labels helper
  private monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  get kpis() { return this.data?.kpis || {}; }

  ngOnInit() {
    this.loadDashboard();
  }

  ngAfterViewInit() {}

  loadDashboard() {
    this.loading = true;
    this.error = '';
    const token = localStorage.getItem('token');
    this.http.get(`${environment.apiUrl}/api/boutique/dashboard`, {
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
    this.buildCaJoursChart();
    this.buildStatutsChart();
    this.buildTopProduitsChart();
    this.buildMouvementsChart();
  }

  // Chart 1: CA & commandes 7 jours
  private buildCaJoursChart() {
    const canvas = this.caJoursCanvas?.nativeElement;
    if (!canvas) return;
    const days = this.last7Days();
    const commandesData = days.map(d => {
      const found = this.data.commandesParJour?.find((c: any) =>
        c._id.year === d.year && c._id.month === d.month && c._id.day === d.day
      );
      return found?.count || 0;
    });
    const caData = days.map(d => {
      const found = this.data.commandesParJour?.find((c: any) =>
        c._id.year === d.year && c._id.month === d.month && c._id.day === d.day
      );
      return found?.ca || 0;
    });
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: days.map(d => `${d.day}/${d.month}`),
        datasets: [
          {
            label: 'CA (Ar)',
            data: caData,
            borderColor: '#3660a9',
            backgroundColor: 'rgba(54,96,169,0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#3660a9',
            yAxisID: 'yCA'
          },
          {
            label: 'Commandes',
            data: commandesData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16,185,129,0.08)',
            borderWidth: 2.5,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: '#10b981',
            yAxisID: 'yCmd'
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
              label: (ctx) => ctx.dataset.yAxisID === 'yCA'
                ? ` ${ctx.formattedValue} Ar`
                : ` ${ctx.formattedValue} cmd`
            }
          }
        },
        scales: {
          yCA: {
            type: 'linear', position: 'left',
            ticks: { callback: (v) => `${v} Ar`, font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          yCmd: {
            type: 'linear', position: 'right',
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // Chart 2: Doughnut statuts commandes
  private buildStatutsChart() {
    const canvas = this.statutsCanvas?.nativeElement;
    if (!canvas) return;
    const parStatut = this.data.commandesParStatut || [];
    const labels = parStatut.map((s: any) => this.statutLabel(s._id));
    const counts = parStatut.map((s: any) => s.count);
    const colors = parStatut.map((s: any) => this.statutColor(s._id));
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 12 }, usePointStyle: true, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed} commande${ctx.parsed > 1 ? 's' : ''}`
            }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // Chart 3: Top 5 produits (horizontal bar)
  private buildTopProduitsChart() {
    const canvas = this.topProduitsCanvas?.nativeElement;
    if (!canvas) return;
    const top = this.data.topProduits || [];
    const labels = top.map((p: any) => p.nom || 'Produit');
    const quantities = top.map((p: any) => p.quantite);
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantité vendue',
          data: quantities,
          backgroundColor: ['#3660a9', '#5b82c9', '#10b981', '#f59e0b', '#ef4444'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.formattedValue} unités` }
          }
        },
        scales: {
          x: {
            ticks: { stepSize: 1, font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            ticks: {
              font: { size: 11 },
              callback: (v, i) => {
                const lbl = labels[i] as string;
                return lbl.length > 20 ? lbl.substring(0, 20) + '...' : lbl;
              }
            },
            grid: { display: false }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  // Chart 4: Mouvements stock entrées vs sorties (30 jours)
  private buildMouvementsChart() {
    const canvas = this.mouvementsCanvas?.nativeElement;
    if (!canvas) return;
    const days = this.last30Days();
    const entrees = days.map(d => {
      const found = this.data.mouvementsParJour?.find((m: any) =>
        m._id.year === d.year && m._id.month === d.month && m._id.day === d.day && m._id.type === 'entree'
      );
      return found?.total || 0;
    });
    const sorties = days.map(d => {
      const found = this.data.mouvementsParJour?.find((m: any) =>
        m._id.year === d.year && m._id.month === d.month && m._id.day === d.day && m._id.type === 'sortie'
      );
      return found?.total || 0;
    });
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: days.map((d, i) => i % 5 === 0 ? `${d.day}/${d.month}` : ''),
        datasets: [
          {
            label: 'Entrées',
            data: entrees,
            backgroundColor: 'rgba(16,185,129,0.7)',
            borderColor: '#10b981',
            borderWidth: 1,
            borderRadius: 3
          },
          {
            label: 'Sorties',
            data: sorties,
            backgroundColor: 'rgba(239,68,68,0.7)',
            borderColor: '#ef4444',
            borderWidth: 1,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 12 }, usePointStyle: true } }
        },
        scales: {
          x: {
            stacked: false,
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 10 } }
          },
          y: {
            ticks: { stepSize: 5, font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        }
      }
    });
    this.charts.push(chart);
  }

  private last7Days() {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });
    }
    return days;
  }

  private last30Days() {
    const days = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days.push({ year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() });
    }
    return days;
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      en_attente: 'En attente', confirmee: 'Confirmée',
      expediee: 'Expédiée', livree: 'Livrée', annulee: 'Annulée'
    };
    return map[s] || s;
  }

  statutColor(s: string): string {
    const map: Record<string, string> = {
      en_attente: '#f59e0b', confirmee: '#3660a9',
      expediee: '#8b5cf6', livree: '#10b981', annulee: '#ef4444'
    };
    return map[s] || '#9ca3af';
  }

  formatMontant(v: number): string {
    if (!v) return '0 Ar';
    return new Intl.NumberFormat('fr-FR').format(Math.round(v)) + ' Ar';
  }

  ngOnDestroy() {
    this.destroyCharts();
  }
}
