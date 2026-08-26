const fs = require('fs');
const file = 'kik-vagyunk.html';
let content = fs.readFileSync(file, 'utf8');

const newGrid = `        <div class="contact-person-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 2rem;">
          <!-- Egyesület -->
          <div class="card" style="background-color: var(--color-white); color: var(--color-dark-blue); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px; display: flex; flex-direction: row; overflow: hidden; height: 100%;">
            <div style="width: 200px; flex-shrink: 0; background-color: #f9f9f9; display: flex; align-items: center; justify-content: center; border-right: 1px solid #eee;">
              <img src="images/global/Logo_BEZS_emblema.png" alt="Egyesület" style="width: 80%; object-fit: contain;">
            </div>
            <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h3 style="color: var(--color-red); margin-bottom: 1rem;">Egyesület (Központ)</h3>
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                  <a href="mailto:info@tuzcsiholo.eu" style="color: var(--color-dark-blue); font-weight: 500;">info@tuzcsiholo.eu</a>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                  <a href="tel:+36301234567" style="color: var(--color-dark-blue); font-weight: 500;">+36 30 123 4567</a>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal); flex-shrink: 0; margin-top: 4px;" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
                  <span style="color: var(--color-dark-blue); font-weight: 500;">1234 Budapest, Példa utca 12.</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Gyermekvédelem -->
          <div class="card" style="background-color: var(--color-white); color: var(--color-dark-blue); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px; display: flex; flex-direction: row; overflow: hidden; height: 100%;">
            <div style="width: 200px; flex-shrink: 0;">
              <img src="images/team/Illesne-Ancsan-Aranka.jpg" alt="Illésné Áncsán Aranka" style="width: 100%; height: 100%; object-fit: cover; object-position: center 15%;">
            </div>
            <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h3 style="color: var(--color-red); margin-bottom: 0.5rem;">Gyermekvédelem</h3>
              <p style="font-weight: 600; margin-bottom: 1.5rem; color: var(--color-teal); font-size: 1.1rem;">Illésné Áncsán Aranka</p>
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                  <a href="mailto:gyermekvedelem@tuzcsiholo.eu" style="color: var(--color-dark-blue); font-weight: 500;">gyermekvedelem@tuzcsiholo.eu</a>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                  <a href="tel:+36301234567" style="color: var(--color-dark-blue); font-weight: 500;">+36 30 123 4567</a>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Szociális Lakásügynökség -->
          <div class="card" style="background-color: var(--color-white); color: var(--color-dark-blue); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px; display: flex; flex-direction: row; overflow: hidden; height: 100%;">
            <div style="width: 200px; flex-shrink: 0;">
              <img src="images/team/Kiss-Agnes.jpg" alt="Munkatárs neve" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
            </div>
            <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h3 style="color: var(--color-red); margin-bottom: 0.5rem;">Szociális Lakásügynökség</h3>
              <p style="font-weight: 600; margin-bottom: 1.5rem; color: var(--color-teal); font-size: 1.1rem;">Munkatárs neve</p>
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                  <a href="mailto:lakasugynokseg@tuzcsiholo.eu" style="color: var(--color-dark-blue); font-weight: 500;">lakasugynokseg@tuzcsiholo.eu</a>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                  <a href="tel:+36301234567" style="color: var(--color-dark-blue); font-weight: 500;">+36 30 123 4567</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Forrásteremtés és kommunikáció -->
          <div class="card" style="background-color: var(--color-white); color: var(--color-dark-blue); box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 12px; display: flex; flex-direction: row; overflow: hidden; height: 100%;">
            <div style="width: 200px; flex-shrink: 0;">
              <img src="images/team/Bihari-Apathy-Judit.jpg" alt="Apáthy Judit" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
            </div>
            <div style="padding: 2rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h3 style="color: var(--color-red); margin-bottom: 0.5rem;">Forrásteremtés és kommunikáció</h3>
              <p style="font-weight: 600; margin-bottom: 1.5rem; color: var(--color-teal); font-size: 1.1rem;">Apáthy Judit</p>
              <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
                  <a href="mailto:kommunikacio@tuzcsiholo.eu" style="color: var(--color-dark-blue); font-weight: 500;">kommunikacio@tuzcsiholo.eu</a>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <svg style="width: 20px; height: 20px; fill: var(--color-teal);" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
                  <a href="tel:+36301234567" style="color: var(--color-dark-blue); font-weight: 500;">+36 30 123 4567</a>
                </div>
              </div>
            </div>
          </div>
        </div>`;

const startIndex = content.indexOf('<div class="contact-grid" style="display: grid;');
const endIndex = content.indexOf('</div>', content.indexOf('<!-- Forrásteremtés és kommunikáció -->')) + 12; 
// finding the end of the contact grid is a bit tricky, let's use a regex or string replacement.

let toReplace = content.substring(startIndex, content.indexOf('      </div>\n    </section>\n\n    <section id="tamogatok"'));

content = content.replace(toReplace, newGrid + '\n');
fs.writeFileSync(file, content);
