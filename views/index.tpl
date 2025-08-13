<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="UTF-8">
    <link rel="manifest" href="/static/manifest.json">
    <meta name="theme-color" content="#007bff">
    <title>Pantry Inventar</title>
    <link rel="stylesheet" href="/static/style.css?=222">
    <script src="/static/script.js" defer></script>
    <script src="/static/pwa.js" defer></script>
    <link rel="icon" href="/static/WhitePantry192px.png" sizes="192x192">
    <link rel="icon" href="/static/WhitePantry512px.png" sizes="512x512">
    <link rel="mask-icon" href="/static/WhitePantry192px.png" color="#007bff">
    <link rel="mask-icon" href="/static/WhitePantry512px.png" color="#007bff">

</head>
<body>
    % include('static/navbar.tpl')
    <div class="container">
        <h1>Pantry Inventar</h1>
        <form id="addForm">
            <select id="category" required>
                <option value="">Wähle Stockwerk aus</option>
                <option value="1. Stock">1. Stock</option>
                <option value="2. Stock">2. Stock</option>
                <option value="3. Stock">3. Stock</option>
                <option value="4. Stock">4. Stock</option>
                <option value="5. Stock">5. Stock</option>
                <option value="Regal">Regal</option>
            </select>
            <input type="text" id="name" placeholder="Artikelname" required>
            <input type="text" id="quantity" placeholder="Menge" required>
            <button type="submit">Hinzufügen</button>
        </form>
        <input type="text" id="searchInput" placeholder="Artikel suchen..." />
        <button id="viewDuplicatesBtn" style="display: none;">Duplikate anzeigen</button>

        <ul id="inventoryList"></ul>
            <div id="confirmModal" class="modal">
                <div class="modal-content">
                    <p>Bist du sicher, dass du <strong><span id="itemToDelete"></span></strong> löschen möchtest?</p>
                    <button id="confirmYes">Ja</button>
                    <button id="confirmNo">Nein</button>
                </div>
            </div>
            <div id="toast" class="toast">Artikel gelöscht</div>
            <div id="itemCounter" class="item-counter">0 Artikel angezeigt</div>


    </div>
</body>
</html>
