from bottle import Bottle, run, request, response, static_file, template
import json
import os
import unicodedata

app = Bottle()
DATA_FILE = 'inventory.json'

def normalize(text):
    return unicodedata.normalize('NFC', text.strip().casefold())

def load_inventory():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_inventory(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    return template('views/index.tpl')

@app.route('/static/<filename>')
def serve_static(filename):
    return static_file(filename, root='static')

@app.get('/api/categories')
def get_categories():
    response.content_type = 'application/json; charset=utf-8'
    return json.dumps(load_inventory(), ensure_ascii=False)

@app.post('/api/items')
def add_item():
    data = request.json
    category = data.get('category')
    name = data.get('name', '').strip()
    quantity = data.get('quantity', '').strip()

    if not category or not name or not quantity:
        response.status = 400
        return {'error': 'Missing fields'}

    inventory = load_inventory()

    def try_parse(q):
        try:
            return float(q)
        except:
            return None

    for cat in inventory:
        if normalize(cat['category']) == normalize(category):
            for item in cat['items']:
                if normalize(item['name']) == normalize(name):
                    existing_q = try_parse(item['quantity'])
                    new_q = try_parse(quantity)

                    if existing_q is not None and new_q is not None:
                        item['quantity'] = str(existing_q + new_q)
                    else:
                        item['quantity'] += f", {quantity}"

                    save_inventory(inventory)
                    return {'status': 'updated'}

            cat['items'].append({'name': name, 'quantity': quantity})
            save_inventory(inventory)
            return {'status': 'added'}

    response.status = 404
    return {'error': 'Category not found'}

@app.put('/api/items/<category>/<item_id:int>')
def update_item(category, item_id):
    updated = request.json
    inventory = load_inventory()
    for cat in inventory:
        if normalize(cat['category']) == normalize(category):
            if 0 <= item_id < len(cat['items']):
                cat['items'][item_id] = updated
                save_inventory(inventory)
                return {'status': 'updated'}
    response.status = 404
    return {'error': 'Item not found'}

@app.delete('/api/items/<category>/<item_id:int>')
def delete_item(category, item_id):
    inventory = load_inventory()
    for cat in inventory:
        if normalize(cat['category']) == normalize(category):
            if 0 <= item_id < len(cat['items']):
                del cat['items'][item_id]
                save_inventory(inventory)
                return {'status': 'deleted'}
    response.status = 404
    return {'error': 'Item not found'}

run(app, host='192.168.1.39', port=5000, reloader=True, debug=True)