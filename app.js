
        // Matrix background animation
        const canvas = document.querySelector('.matrix-bg');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01アイウエオカキクケコサシスセソ';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        function drawMatrix() {
            ctx.fillStyle = 'rgba(10, 14, 39, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00ff88';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }

        setInterval(drawMatrix, 50);

        // Password generator logic
        let currentPassword = '';
        const lengthSlider = document.getElementById('lengthSlider');
        const lengthValue = document.getElementById('lengthValue');
        const uppercaseCheck = document.getElementById('uppercase');
        const lowercaseCheck = document.getElementById('lowercase');
        const numbersCheck = document.getElementById('numbers');
        const symbolsCheck = document.getElementById('symbols');
        const generateBtn = document.getElementById('generateBtn');
        const copyBtn = document.getElementById('copyBtn');
        const passwordText = document.getElementById('passwordText');
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        const proModeBtn = document.getElementById('proModeBtn');
        const proMode = document.getElementById('proMode');
        const entropyEl = document.getElementById('entropy');
        const hashEl = document.getElementById('hash');
        const crackTimeEl = document.getElementById('crackTime');

        lengthSlider.addEventListener('input', (e) => {
            lengthValue.textContent = e.target.value;
        });

        function generatePassword() {
            const length = parseInt(lengthSlider.value);
            let charset = '';
            
            if (uppercaseCheck.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (lowercaseCheck.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
            if (numbersCheck.checked) charset += '0123456789';
            if (symbolsCheck.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

            if (charset === '') {
                showNotification('Selecciona al menos una opción');
                return;
            }

            let password = '';
            const array = new Uint32Array(length);
            crypto.getRandomValues(array);
            
            for (let i = 0; i < length; i++) {
                password += charset[array[i] % charset.length];
            }

            currentPassword = password;
            passwordText.textContent = password;
            updateStrength(password, charset.length);
            if (proMode.classList.contains('active')) {
                updateProMode(password, charset.length);
            }
        }

        function updateStrength(password, charsetSize) {
            const length = password.length;
            const entropy = length * Math.log2(charsetSize);
            let strength = 0;
            let label = '';
            let color = '';

            if (entropy < 28) {
                strength = 20;
                label = 'Muy Débil';
                color = '#ff3366';
            } else if (entropy < 36) {
                strength = 40;
                label = 'Débil';
                color = '#ffaa00';
            } else if (entropy < 60) {
                strength = 60;
                label = 'Media';
                color = '#ffdd00';
            } else if (entropy < 128) {
                strength = 80;
                label = 'Fuerte';
                color = '#00ff88';
            } else {
                strength = 100;
                label = 'Muy Fuerte';
                color = '#00d4ff';
            }

            strengthFill.style.width = strength + '%';
            strengthFill.style.background = color;
            strengthText.textContent = `Fuerza: ${label}`;
            strengthText.style.color = color;
        }

        async function updateProMode(password, charsetSize) {
            const length = password.length;
            const entropy = (length * Math.log2(charsetSize)).toFixed(2);
            entropyEl.textContent = `${entropy} bits`;

            // Calculate SHA-256 hash
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            hashEl.textContent = hashHex;

            // Estimate crack time
            const combinations = Math.pow(charsetSize, length);
            const guessesPerSecond = 1e12; // 1 trillion guesses/second
            const seconds = combinations / guessesPerSecond;
            crackTimeEl.textContent = formatTime(seconds);
        }

        function formatTime(seconds) {
            if (seconds < 1) return 'Instantáneo';
            if (seconds < 60) return `${seconds.toFixed(0)} segundos`;
            if (seconds < 3600) return `${(seconds / 60).toFixed(0)} minutos`;
            if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} horas`;
            if (seconds < 31536000) return `${(seconds / 86400).toFixed(0)} días`;
            if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(0)} años`;
            return `${(seconds / 31536000).toExponential(2)} años`;
        }

        function copyToClipboard() {
            if (!currentPassword) {
                showNotification('Genera una contraseña primero');
                return;
            }

            navigator.clipboard.writeText(currentPassword).then(() => {
                showNotification('¡Copiado al portapapeles!');
            }).catch(() => {
                showNotification('Error al copiar');
            });
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.remove();
            }, 2000);
        }

        proModeBtn.addEventListener('click', () => {
            proModeBtn.classList.toggle('active');
            proMode.classList.toggle('active');
            
            if (proMode.classList.contains('active') && currentPassword) {
                const charset = 
                    (uppercaseCheck.checked ? 26 : 0) +
                    (lowercaseCheck.checked ? 26 : 0) +
                    (numbersCheck.checked ? 10 : 0) +
                    (symbolsCheck.checked ? 29 : 0);
                updateProMode(currentPassword, charset);
            }
        });

        generateBtn.addEventListener('click', generatePassword);
        copyBtn.addEventListener('click', copyToClipboard);

        // Generate initial password
        generatePassword();
