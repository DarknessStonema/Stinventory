<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <title>Eis Zeitstopper</title>
    <link rel="stylesheet" href="/static/style.css?=222">

</head>
<body>
    % include('static/navbar.tpl')
  <div class="container">
    <div class="ice-stopwatch">
        <h2>🧊 Eis Zeitstopper</h2>
        <div id="iceTimerDisplay">00:00:00</div>
        <div class="ice-buttons">
        <button id="startIce">Start</button>
        <button id="resetIce">Zurücksetzen</button>
        </div>
    </div>
    </div>

<script>
    const iceDisplay = document.getElementById('iceTimerDisplay');
    const iceMessage = document.createElement('div');
    iceMessage.style.marginTop = '1rem';
    iceMessage.style.fontSize = '1.25rem';
    iceMessage.style.color = '#28a745';
    iceMessage.style.fontWeight = 'bold';
    iceMessage.style.display = 'none';
    iceDisplay.insertAdjacentElement('afterend', iceMessage);

    let interval = null;

    function formatTime(seconds) {
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    }

    function updateTimer() {
        fetch('/api/ice')
        .then(res => res.json())
        .then(data => {
            const startBtn = document.getElementById('startIce');

            if (data.status === 'stopped') {
                clearInterval(interval);
                iceDisplay.textContent = '00:00:00';
                iceMessage.style.display = 'none';
                startBtn.style.display = 'inline-block'; // ✅ Show Start when reset
                return;
            }

            if (data.ready) {
                clearInterval(interval);
                iceDisplay.textContent = formatTime(3 * 3600);
                iceMessage.textContent = 'Eiswürfel sind bereit!';
                iceMessage.style.display = 'block';
                startBtn.style.display = 'inline-block';

                return; // ✅ Allow to restart after ready
            } else {
                iceDisplay.textContent = formatTime(data.elapsed);
                iceMessage.style.display = 'none';
                startBtn.style.display = 'none'; // ✅ Hide when running
            }
        });
    }

    document.getElementById('startIce').onclick = () => {
        fetch('/api/ice/start', { method: 'POST' })
        .then(() => {
            document.getElementById('startIce').style.display = 'none'; // HIDE the button
            clearInterval(interval);
            interval = setInterval(updateTimer, 1000);
            updateTimer();
        });
    };


    document.getElementById('resetIce').onclick = () => {
        fetch('/api/ice/reset', { method: 'POST' })
        .then(() => {
            clearInterval(interval);
            iceDisplay.textContent = '00:00:00';
            iceMessage.style.display = 'none';
            location.reload();
        });
    };

    // Initialize on load
    updateTimer();
    interval = setInterval(updateTimer, 1000);
</script>

</body>
</html>
