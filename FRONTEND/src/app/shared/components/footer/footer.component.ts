import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h4>Application</h4>
            <p>Système de gestion administratif</p>
          </div>
          <div class="footer-section">
            <h4>Liens utiles</h4>
            <ul>
              <li><a href="#">Aide</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Documentation</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>support@application.com</p>
            <p>+33 1 23 45 67 89</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Application. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {}