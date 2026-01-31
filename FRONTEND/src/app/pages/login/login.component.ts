import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-header">
          <h1>Connexion Administration</h1>
          <p>Accédez à l'espace d'administration</p>
        </div>
        
        <form class="login-form">
          <div class="form-group">
            <label for="email">Adresse email</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <div class="form-group">
            <div class="checkbox-wrapper">
              <input type="checkbox" id="remember" name="remember">
              <label for="remember">Se souvenir de moi</label>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="login-btn">Se connecter</button>
            <button type="button" class="forgot-btn">Mot de passe oublié ?</button>
          </div>
        </form>
        
        <div class="login-footer">
          <div class="profile-section">
            <h4>Accès direct :</h4>
            <a routerLink="/admin/dashboard" class="profile-link">
              <span class="profile-icon">👨‍💼</span>
              <span>Espace Administration</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {}